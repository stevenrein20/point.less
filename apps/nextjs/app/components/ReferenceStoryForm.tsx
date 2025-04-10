import {
  Card,
  Stack,
  Group,
  Text,
  Button,
  Textarea,
  TextInput,
  NumberInput,
} from "@mantine/core";
import { FaTrash, FaPlus } from "react-icons/fa";
import { PointLessRequest, ReferenceStory } from "@pointless/types";
import { usePointLessStore } from "../store/pointless";
import { useEffect, useState } from "react";
import { CardBox } from "./CardBox";

interface ReferenceStoryFormProps {
  data?: Partial<PointLessRequest>;
  isActive: boolean;
}

export function ReferenceStoryForm({
  data,
  isActive,
}: ReferenceStoryFormProps) {
  const {
    referenceStories,
    customInstructions,
    setReferenceStories,
    setCustomInstructions,
  } = usePointLessStore();

  // Initialize store with data if provided
  useEffect(() => {
    if (data?.referenceStories) {
      setReferenceStories(data.referenceStories as ReferenceStory[]);
    }
    if (data?.customInstructions) {
      setCustomInstructions(data.customInstructions);
    }
  }, [data]);

  const addReferenceStory = (type: "manual" | "jira" = "manual") => {
    if (type === "jira") {
      setReferenceStories([
        ...(referenceStories ?? []),
        { source: "jira", issue: "" },
      ]);
    } else {
      setReferenceStories([
        ...(referenceStories ?? []),
        { title: "", content: "", points: 0 },
      ]);
    }
  };

  const removeReferenceStory = (index: number) => {
    setReferenceStories((referenceStories ?? []).filter((_, i) => i !== index));
  };

  const updateReferenceStory = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedStories = [...(referenceStories ?? [])];
    const story = updatedStories[index];
    if (story && "source" in story && story.source === "jira") {
      updatedStories[index] = { ...story, issue: value.toString() };
    } else {
      updatedStories[index] = {
        ...(story as ReferenceStory),
        [field]: value,
      } as ReferenceStory;
    }
    setReferenceStories(updatedStories);
  };

  return (
    <CardBox isActive={isActive}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="xl">
          <Text size="xl" fw={500} ta="center">
            Configure Reference Stories
          </Text>

          <Stack gap="md">
            {(referenceStories ?? []).map((story, index) => (
              <Card key={index} withBorder padding="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text fw={500}>Reference Story {index + 1}</Text>
                    <Button
                      variant="subtle"
                      color="red"
                      onClick={() => removeReferenceStory(index)}
                      leftSection={<FaTrash size={16} />}
                    >
                      Remove
                    </Button>
                  </Group>

                  {"source" in story && story.source === "jira" ? (
                    <TextInput
                      label="Jira Issue"
                      value={story.issue}
                      onChange={(e) =>
                        updateReferenceStory(index, "issue", e.target.value)
                      }
                      placeholder="Enter Jira issue key (e.g. SCRUM-123)"
                    />
                  ) : (
                    <>
                      <TextInput
                        label="Title"
                        value={(story as ReferenceStory).title}
                        onChange={(e) =>
                          updateReferenceStory(index, "title", e.target.value)
                        }
                        placeholder="Enter story title"
                      />

                      <Textarea
                        label="Content"
                        value={(story as ReferenceStory).content}
                        onChange={(e) =>
                          updateReferenceStory(index, "content", e.target.value)
                        }
                        placeholder="Enter story content"
                        minRows={3}
                      />

                      <NumberInput
                        label="Points"
                        value={(story as ReferenceStory).points}
                        onChange={(value) =>
                          updateReferenceStory(index, "points", value || 0)
                        }
                        min={0}
                        max={100}
                      />
                    </>
                  )}
                </Stack>
              </Card>
            ))}

            <Group justify="center" gap="md">
              <Button
                variant="light"
                onClick={() => addReferenceStory("manual")}
                leftSection={<FaPlus size={16} />}
              >
                Add Manual Story
              </Button>
              <Button
                variant="light"
                onClick={() => addReferenceStory("jira")}
                leftSection={<FaPlus size={16} />}
              >
                Add Jira Story
              </Button>
            </Group>
          </Stack>

          <Textarea
            label="Custom Instructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Enter custom instructions for point estimation"
            minRows={4}
          />
        </Stack>
      </Card>
    </CardBox>
  );
}
