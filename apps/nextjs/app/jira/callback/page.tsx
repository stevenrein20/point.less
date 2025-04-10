'use client';

import { Loader, Center, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function JiraCallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && window.opener) {
      window.opener.postMessage(
        { type: 'jira-auth-code', code },
        window.location.origin
      );
      window.close(); // close the popup
    }
  }, [searchParams]);

  return (
    <Center h="100vh">
      <Stack align="center">
        <Loader color="blue" />
        <Text size="sm" c="dimmed">
          Finishing Jira login...
        </Text>
      </Stack>
    </Center>
  );
}
