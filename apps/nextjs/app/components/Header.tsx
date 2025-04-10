import { useAuth0 } from "@auth0/auth0-react";
import {
  Group,
  Title,
  Avatar,
  Menu,
  UnstyledButton,
  Text,
  Button,
} from "@mantine/core";
import { usePointLessStore } from "../store/pointless";
import { notifications } from "@mantine/notifications";

export function Header() {
  const { user, logout } = useAuth0();
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
                <Avatar src={user?.picture} radius="xl" />
                <Text size="sm">{user?.name}</Text>
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Settings</Menu.Label>
            <Menu.Divider />
            <Menu.Item
              color="red"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
