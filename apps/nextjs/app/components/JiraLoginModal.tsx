import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Modal, Stack, Text, Group, Button } from "@mantine/core";
import { usePointLessStore } from "@/app/store/pointless";
import { useJiraStore } from "@/app/store/jira";

const JIRA_CLIENT_ID = process.env.NEXT_PUBLIC_JIRA_CLIENT_ID || "";
const JIRA_CALLBACK_URL =
  process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_URL}/api/jira/callback`;

export function JiraLoginModal() {
  const { story, referenceStories, setStory, setReferenceStories } =
    usePointLessStore();
  const { isAuthenticated, setAuth } = useJiraStore();
  const [isOpen, setIsOpen] = useState(false);

  const hasJiraDependentStories = useCallback(() => { 
      const isJiraStory = (s: any) => s && "source" in s && s.source === "jira";
      return isJiraStory(story) || (referenceStories ?? []).some(isJiraStory);
  }, [story, referenceStories]);

  const handleRemoveJiraStories = () => {
    if (story && "source" in story && story.source === "jira") {
      setStory(undefined);
    }

    const filteredStories = (referenceStories ?? []).filter(
      (s) => !("source" in s && s.source === "jira")
    );
    setReferenceStories(filteredStories);

    setIsOpen(false);
  };

  const handleLogin = async () => {
    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${JIRA_CLIENT_ID}&scope=${encodeURIComponent(
      "read:jira-work write:jira-work offline_access"
    )}&redirect_uri=${encodeURIComponent(
      JIRA_CALLBACK_URL
    )}&response_type=code&prompt=consent`;

    window.open(authUrl, "_blank", "width=600,height=700");

    setIsOpen(false);
  };

  useEffect(() => {
    if (hasJiraDependentStories() && !isAuthenticated()) {
      setIsOpen(true);
    }
  }, [hasJiraDependentStories, isAuthenticated]);

  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, code } = event.data;
      if (type === "jira-auth-code" && code) {
        try {
          // Exchange the code using Next.js API route
          const response = await axios.post("/api/jira/exchange", { code });
          const { access_token, expires_in, instances } = response.data;

          setAuth({
            accessToken: access_token,
            instance: instances[0].id,
            expiresAt: Date.now() + expires_in * 1000,
          });
          setIsOpen(false); // Close the modal after successful authentication
        } catch (error) {
          console.error("Error exchanging Jira auth code:", error);
          // Handle error (e.g., show error message to user)
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setAuth]);

  // Check Jira authentication status on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  if (!hasJiraDependentStories()) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      title="Jira Authentication Required"
      centered
    >
      <Stack>
        <Text>
          Some of your stories are linked to Jira. To access these stories, you
          need to log in to Jira. Would you like to log in now or remove the
          Jira-dependent stories?
        </Text>

        <Group justify="center" mt="md">
          <Button onClick={handleLogin} variant="filled">
            Log in to Jira
          </Button>
          <Button onClick={handleRemoveJiraStories} variant="light" color="red">
            Remove Jira Stories
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
