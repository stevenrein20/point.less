import axios from "axios";
import {
  ReferenceStory,
  Story,
  StoryLocation,
  StorySourceAdapter,
} from "@pointless/types";

export class JiraAdapter extends StorySourceAdapter {
  private requestJira: (path: string, config: object) => any;

  constructor(requestJira?: (path: string, config: object) => any) {
    super();

    if (requestJira) {
      this.requestJira = requestJira;
      return;
    }

    this.requestJira = async (path: string, config: object) => {
      const response = await axios.get(path, config);
      return response.data;
    };
  }

  /**
   * Fetches a single issue by its key or ID
   */
  async fetchStory(location: StoryLocation): Promise<Story> {
    const issue = await this.fetchIssue(location);
    console.log(issue);

    this.validateIssueType(issue);

    return this.transformIssue(issue);
  }

  /**
   * Fetches a single reference issue by its key or ID. This should have points assigned to it.
   */
  async fetchReferenceStory(location: StoryLocation): Promise<ReferenceStory> {
    const issue = await this.fetchIssue(location);

    this.validateIssueType(issue);
    const points = await this.findIssueStoryPoints(issue, location);
    if (points === undefined) {
      throw new Error("No story points found for the issue");
    }
    return {
      ...this.transformIssue(issue),
      points,
    };
  }

  private async fetchIssue(location: StoryLocation): Promise<any> {
    const response = await this.requestJira(
      `/rest/api/3/issue/${location.issue}`,
      {
        headers: { Authorization: location.authorization },
        origin: location.url,
      }
    );

    return response.data;
  }

  private async fetchAllFields(
    location: StoryLocation
  ): Promise<Array<string>> {
    // Get the first page to determine total pages needed
    const firstResponse = await this.requestJira(
      `/rest/api/3/field/search?query=point&startAt=0`,
      {
        headers: { Authorization: location.authorization },
        origin: location.url,
      }
    );

    const { values, maxResults, total } = firstResponse.data;

    // Calculate remaining pages and fetch them in parallel
    const remainingPages = Math.ceil((total - maxResults) / maxResults);
    const pageIndices = Array.from({ length: remainingPages }, (_, i) => i + 1);

    return await pageIndices.reduce(
      async (accPromise, pageIndex) => {
        const acc = await accPromise;
        const startAt = pageIndex * maxResults;
        const response = await this.requestJira(
          `/rest/api/3/field/search?query=point&startAt=${startAt}`,
          {
            headers: { Authorization: location.authorization },
            origin: location.url,
          }
        );
        return acc.concat(response.data.values);
      },
      Promise.resolve(values.map((field: any) => field.id as string))
    );
  }

  private async findIssueStoryPoints(
    data: any,
    location: StoryLocation
  ): Promise<number | undefined> {
    const fields = data.fields;
    if (!fields) {
      return undefined;
    }

    const allFields = await this.fetchAllFields(location);
    allFields.forEach((field: string) => {
      const value = fields[field];
      if (value !== undefined) {
        return value;
      }
    });

    return undefined; // Return undefined if no story points are found in any field
  }

  private validateIssueType(data: any): void {
    const issueType = data.fields?.issuetype?.name;
    if (!issueType || issueType.toLowerCase() !== "story") {
      throw new Error(
        `Invalid issue type: ${issueType}. Only Story type issues are supported.`
      );
    }
  }

  private transformIssue(data: any): Story {
    const title = data.fields?.summary || "";
    const description = this.extractTextContent(data.fields?.description);
    const comments = (data.fields?.comment?.comments || [])
      .map((comment: any) => this.extractTextContent(comment.body))
      .join("\n\n");

    return {
      title,
      content: [description, comments].filter(Boolean).join("\n\n"),
    };
  }

  private extractTextContent(doc: any): string {
    if (!doc || !doc.content) return "";
    return doc.content
      .map((block: any) => {
        if (block.type === "paragraph") {
          return block.content?.map((item: any) => item.text || "").join("");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
}
