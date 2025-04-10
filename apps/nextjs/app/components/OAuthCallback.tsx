import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const OAuthCallback = () => {
  const [params] = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    if (code && window.opener) {
      window.opener.postMessage({ type: "jira-auth-code", code }, window.origin);
      window.close();
    }
  }, [params]);

  return <p>Finishing Jira login...</p>;
};

export default OAuthCallback;