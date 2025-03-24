import React, { useState } from "react";
import {
  Textfield,
  Button,
  Form,
  useProductContext,
  Spinner,
} from "@forge/react";

const PointForm = ({ onSubmit, isLoading }) => {
  const [apiKey, setApiKey] = useState("");
  const context = useProductContext();

  const handleSubmit = () => {
    const issue = context?.extension?.issue?.id;
    if (issue) {
      onSubmit({
        openAIAPIKey: apiKey,
        story: { source: "jira", issue },
      });
    }
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <Form onSubmit={handleSubmit}>
      <Textfield
        label="OpenAI API Key"
        type="password"
        value={apiKey}
        onChange={(event) => {
          setApiKey(event.target.value);
        }}
        isRequired
      />
      <Button type="submit" appearance="primary">
        Point Story
      </Button>
    </Form>
  );
};

export default PointForm;
