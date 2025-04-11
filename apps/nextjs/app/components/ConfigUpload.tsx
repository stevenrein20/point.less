import { useRef, useState } from "react";
import { Card, Button, Stack, Text, FileInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PointLessRequest } from "@pointless/types";
import { usePointLessStore } from "../store/pointless";
import { CardBox } from "./CardBox";

interface ConfigUploadProps {
  onNext: (data?: Partial<PointLessRequest>) => void;
  isActive: boolean;
}

export function ConfigUpload({ onNext, isActive }: ConfigUploadProps) {
  const fileUpload = useRef<HTMLButtonElement>(null);
  const [pointlessFile, setPointlessFile] = useState<File | null>(null);

  const { setReferenceStories, setCustomInstructions } = usePointLessStore();

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const content = await file.text();
      const data = JSON.parse(content);

      setReferenceStories(data.referenceStories || []);
      setCustomInstructions(data.customInstructions || "");

      notifications.show({
        title: "Success",
        message: ".pointless file loaded successfully",
        color: "green",
      });
      onNext();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to parse .pointless file",
        color: "red",
      });
    }
  };

  return (
    <CardBox isActive={isActive}>
      <Card
        shadow="sm"
        padding="xl"
        radius="md"
        withBorder
        style={{
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Stack gap="xl" align="center" mt={40}>
          <Text size="xl" fw={500} ta="center">
            Get Started with Point.less
          </Text>

          <Stack w="100%" mt="xl" gap="md">
            <FileInput
              ref={fileUpload}
              value={pointlessFile}
              onChange={(file) => {
                setPointlessFile(file);
                handleFileUpload(file);
              }}
              style={{ display: "none" }}
            />
            <Button
              variant="light"
              size="md"
              onClick={() => fileUpload.current?.click()}
            >
              Upload .pointless File
            </Button>
            <Button variant="light" size="md" onClick={() => onNext()}>
              Use Existing
            </Button>
          </Stack>
        </Stack>
      </Card>
    </CardBox>
  );
}
