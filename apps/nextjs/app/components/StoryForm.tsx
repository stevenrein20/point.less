import {
  Card,
  Stack,
  Group,
  Text,
  Button,
  Textarea,
  TextInput,
} from "@mantine/core";
import { CardBox } from "./CardBox";
import { Story } from "@pointless/types";
import { usePointLessStore } from "../store/pointless";

interface StoryFormProps {
  isActive: boolean;
}

export function StoryForm({ isActive }: StoryFormProps) {
  const { story, setStory } = usePointLessStore();

  const updateStory = (field: string, value: string) => {
    if (story && "source" in story && story.source === "jira") {
      setStory({ ...story, issue: value });
    } else {
      setStory({
        ...(story as Story),
        [field]: value,
      } as Story);
    }
  };

  const toggleStoryType = (type: "manual" | "jira") => {
    if (type === "jira") {
      setStory({ source: "jira", issue: "" });
    } else {
      setStory({ title: "", content: "" });
    }
  };

  return (
    <CardBox isActive={isActive}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xl">
          <Text size="xl" fw={500} ta="center">
            Specify Your Story
          </Text>

          <Group justify="center" gap="md">
            <Button
              variant={!story || !("source" in story) ? "filled" : "light"}
              onClick={() => toggleStoryType("manual")}
            >
              Manual Story
            </Button>
            <Button
              variant={story && "source" in story ? "filled" : "light"}
              onClick={() => toggleStoryType("jira")}
            >
              Jira Story
            </Button>
          </Group>

          {story && "source" in story ? (
            <TextInput
              label="Jira Issue"
              value={story.issue}
              onChange={(e) => updateStory("issue", e.target.value)}
              placeholder="Enter Jira issue key (e.g. SCRUM-123)"
            />
          ) : (
            <Stack gap="md">
              <TextInput
                label="Title"
                value={(story as Story)?.title || ""}
                onChange={(e) => updateStory("title", e.target.value)}
                placeholder="Enter story title"
              />
              <Textarea
                label="Content"
                value={(story as Story)?.content || ""}
                onChange={(e) => updateStory("content", e.target.value)}
                placeholder="Enter story content"
                minRows={3}
              />
            </Stack>
          )}
        </Stack>
      </Card>
    </CardBox>
  );
}
