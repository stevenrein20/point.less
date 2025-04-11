import { useState } from "react";
import {
  Card,
  Stack,
  Text,
  Alert,
  LoadingOverlay,
  Button,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { usePointLessStore } from "../store/pointless";
import { useJiraStore } from "../store/jira";
import { pointStoryAction } from "../actions/point";
import { CardBox } from "./CardBox";

interface ResultCardProps {
  onBack: () => void;
  isActive: boolean;
}

export function ResultCard({ onBack, isActive }: ResultCardProps) {
  const { instance, accessToken } = useJiraStore();
  const [isLoading, setIsLoading] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const { referenceStories, customInstructions, story } = usePointLessStore();

  const handlePointStory = async () => {
    if (!story) {
      notifications.show({
        title: "Error",
        message: "Failed to point story",
        color: "red",
      });
      onBack();
      return;
    }

    try {
      setIsLoading(true);
      const result = await pointStoryAction(
        { story, referenceStories, customInstructions },
        { instance: instance!, accessToken: accessToken! }
      );

      if (!result) {
        notifications.show({
          title: "Error",
          message: "Failed to point story",
          color: "red",
        });
      } else {
        setPoints(result.points);
        setExplanation(result.explanation);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to point story",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardBox isActive={isActive}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
        <Stack gap="xl">
          <Text size="xl" fw={500} ta="center">
            Story Points Result
          </Text>

          {!isLoading && points !== null && (
            <Alert color="green" title="Story Points">
              <Text>Points: {points}</Text>
              <Text size="sm" mt="xs">
                {explanation}
              </Text>
            </Alert>
          )}

          <Button
            onClick={handlePointStory}
            loading={isLoading}
            disabled={!story}
          >
            Point Story
          </Button>
        </Stack>
      </Card>
    </CardBox>
  );
}
