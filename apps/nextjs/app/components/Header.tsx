import { signOut, useSession } from "next-auth/react";
import {
  Group,
  Title,
  Avatar,
  Menu,
  UnstyledButton,
  Text,
  Button,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { usePointLessStore } from "../store/pointless";

export function Header() {
  const { data } = useSession();
  const { referenceStories, customInstructions, reset } = usePointLessStore();

  const handleExport = () => {
    try {
      const config = {
        referenceStories,
        customInstructions,
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/pointless",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "/.pointless";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifications.show({
        title: "Success",
        message: "Configuration exported successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to export configuration",
        color: "red",
      });
    }
  };

  return (
    <Group justify="space-between" h="100%" px="md">
      <UnstyledButton onClick={() => (window.location.href = "/")}>
        <Title order={3}>Point.Less</Title>
      </UnstyledButton>

      <Group gap="md">
        <Button variant="light" onClick={handleExport}>
          Export
        </Button>
        <Button
          variant="light"
          color="red"
          onClick={() => {
            reset();
            notifications.show({
              title: "Success",
              message: "All data has been reset",
              color: "green",
            });
          }}
        >
          Reset
        </Button>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap="xs">
                <Avatar src={data?.user?.image} radius="xl" />
                <Text size="sm">{data?.user?.name}</Text>
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Settings</Menu.Label>
            <Menu.Divider />
            <Menu.Item
              color="red"
              onClick={() => signOut({ callbackUrl: window.location.origin })}
            >
              <Button
                onClick={() => signOut({ callbackUrl: window.location.origin })}
              >
                Sign Out
              </Button>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
