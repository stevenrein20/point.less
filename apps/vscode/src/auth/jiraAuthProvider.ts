import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationProviderSessionOptions,
  AuthenticationSession,
  Disposable,
  env,
  EventEmitter,
  ExtensionContext,
  ProgressLocation,
  Uri,
  UriHandler,
  window,
} from "vscode";
import * as crypto from "crypto";
import { PromiseAdapter, promiseFromEvent } from "./utils";
import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv();

const AUTH_TYPE = `jira`;
const AUTH_NAME = `Jira`;
const SESSIONS_SECRET_KEY = `${AUTH_TYPE}.auth.sessions`;

class UriEventHandler extends EventEmitter<Uri> implements UriHandler {
  public handleUri(uri: Uri) {
    this.fire(uri);
  }
}

export class JiraAuthenticationProvider
  implements AuthenticationProvider, Disposable
{
  private _sessionChangeEmitter =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private _disposable: Disposable;
  private readonly _codeExchangePromises = new Map<
    string,
    { promise: Promise<string>; cancel: EventEmitter<void> }
  >();

  private _pendingStates: string[] = [];
  private _uriHandler = new UriEventHandler();
  private getRedirectUri(): string {
    // Get the URI scheme based on the VS Code variant
    const uriScheme = env.uriScheme;
    return `${uriScheme}://pointless.pointless`;
  }

  private get redirectUri(): string {
    return this.getRedirectUri();
  }

  constructor(private readonly context: ExtensionContext) {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(
        AUTH_TYPE,
        AUTH_NAME,
        this,
        { supportsMultipleAccounts: false }
      ),
      window.registerUriHandler(this._uriHandler) // Register the URI handler
    );
  }

  get onDidChangeSessions() {
    return this._sessionChangeEmitter.event;
  }

  /**
   * Get the existing sessions
   * @param scopes
   * @returns
   */
  public async getSessions(
    scopes: readonly string[] | undefined,
    options: AuthenticationProviderSessionOptions
  ): Promise<AuthenticationSession[]> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);

    if (allSessions) {
      return JSON.parse(allSessions) as AuthenticationSession[];
    }

    return [];
  }

  private async login(scopes: string[] = []) {
    return await window.withProgress<string>(
      {
        location: ProgressLocation.Notification,
        title: "Signing in to Jira...",
        cancellable: true,
      },
      async (_, token) => {
        const stateId = crypto.randomUUID();

        this._pendingStates.push(stateId);

        const searchParams = new URLSearchParams([
          ["audience", "api.atlassian.com"],
          ["response_type", "code"],
          ["client_id", process.env.JIRA_CLIENT_ID!],
          ["redirect_uri", this.redirectUri],
          ["state", stateId],
          ["scope", scopes.join(" ")],
          ["prompt", "consent"],
        ]);
        const uri = Uri.parse(
          `https://auth.atlassian.com/authorize?${searchParams.toString()}`
        );
        await env.openExternal(uri);

        let codeExchangePromise = this._codeExchangePromises.get(
          scopes.join(" ")
        );
        if (!codeExchangePromise) {
          codeExchangePromise = promiseFromEvent(
            this._uriHandler.event,
            this.handleUri(scopes)
          );
          this._codeExchangePromises.set(scopes.join(" "), codeExchangePromise);
        }

        try {
          return await Promise.race([
            codeExchangePromise.promise,
            new Promise<string>((_, reject) =>
              setTimeout(() => reject("Cancelled"), 60000)
            ),
            promiseFromEvent<any, any>(
              token.onCancellationRequested,
              (_, __, reject) => {
                reject("User Cancelled");
              }
            ).promise,
          ]);
        } finally {
          this._pendingStates = this._pendingStates.filter(
            (n) => n !== stateId
          );
          codeExchangePromise?.cancel.fire();
          this._codeExchangePromises.delete(scopes.join(" "));
        }
      }
    );
  }

  /**
   * Handle the redirect to VS Code (after sign in from Jira)
   * @param scopes
   * @returns
   */
  private handleUri: (
    scopes: readonly string[]
  ) => PromiseAdapter<Uri, string> =
    (scopes) => async (uri, resolve, reject) => {
      const query = new URLSearchParams(uri.query);
      const code = query.get("code");
      const state = query.get("state");

      if (!code) {
        reject(new Error("No code"));
        return;
      }
      if (!state) {
        reject(new Error("No state"));
        return;
      }

      // Check if it is a valid auth request started by the extension
      if (!this._pendingStates.some((n) => n === state)) {
        reject(new Error("State not found"));
        return;
      }

      try {
        const response = await axios.post(
          "https://auth.atlassian.com/oauth/token",
          {
            grant_type: "authorization_code",
            client_id: process.env.JIRA_CLIENT_ID,
            code: code,
            redirect_uri: this.redirectUri,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.data.access_token) {
          throw new Error("No access token received");
        }

        resolve(response.data.access_token);
      } catch (error) {
        reject(error);
      }
    };

  private async getUserInfo(
    token: string
  ): Promise<{ name: string; email: string }> {
    const response = await axios.get("https://api.atlassian.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return {
      name: response.data.name,
      email: response.data.email,
    };
  }

  public async createSession(scopes: string[]): Promise<AuthenticationSession> {
    try {
      const token = await this.login(scopes);
      if (!token) {
        throw new Error(`Jira login failure`);
      }

      const userinfo = await this.getUserInfo(token);

      const session: AuthenticationSession = {
        id: crypto.randomUUID(),
        accessToken: token,
        account: {
          label: userinfo.name,
          id: userinfo.email,
        },
        scopes: [],
      };

      await this.context.secrets.store(
        SESSIONS_SECRET_KEY,
        JSON.stringify([session])
      );

      this._sessionChangeEmitter.fire({
        added: [session],
        removed: [],
        changed: [],
      });

      return session;
    } catch (e) {
      window.showErrorMessage(`Sign in failed: ${e}`);
      throw e;
    }
  }

  /**
   * Remove an existing session
   * @param sessionId
   */
  public async removeSession(sessionId: string): Promise<void> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);
    if (allSessions) {
      let sessions = JSON.parse(allSessions) as AuthenticationSession[];
      const sessionIdx = sessions.findIndex((s) => s.id === sessionId);
      const session = sessions[sessionIdx];
      sessions.splice(sessionIdx, 1);

      await this.context.secrets.store(
        SESSIONS_SECRET_KEY,
        JSON.stringify(sessions)
      );

      if (session) {
        this._sessionChangeEmitter.fire({
          added: [],
          removed: [session],
          changed: [],
        });
      }
    }
  }

  /**
   * Dispose the registered services
   */
  public async dispose() {
    this._disposable.dispose();
  }
}
