"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AppShell, Button, Container, LoadingOverlay } from "@mantine/core";
import { Header } from "@/app/components/Header";
import { JiraLoginModal } from "@/app/components/JiraLoginModal";
import { CardTransition } from "@/app/components/CardTransition";
import { ConfigUpload } from "@/app/components/ConfigUpload";
import { ReferenceStoryForm } from "@/app/components/ReferenceStoryForm";
import { StoryForm } from "@/app/components/StoryForm";
import { ResultCard } from "@/app/components/ResultCard";
import { useState } from "react";

// TODO Fix everything up. GEt compnent library and everything else working again.!
// TODO Get Authentication working and required for API calls and pages to load.
// TODO Get Jira Login Modal working correctly.
// TODO Get AI Orchestration working optimally.
export default function Home() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [currentStep, setCurrentStep] = useState(0);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!isAuthenticated) {
    return (
      <Container size="sm" style={{ textAlign: "center", marginTop: "4rem" }}>
        <h1>Welcome to Point.Less</h1>
        <p>Please sign in to continue</p>
        <Button onClick={() => loginWithRedirect()}>Sign In</Button>
      </Container>
    );
  }

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <JiraLoginModal />
        <CardTransition
          currentStep={currentStep}
          forms={[
            <ConfigUpload
              key="config"
              onNext={handleNext}
              isActive={currentStep === 0}
            />,
            <ReferenceStoryForm key="reference" isActive={currentStep === 1} />,
            <StoryForm key="story" isActive={currentStep === 2} />,
            <ResultCard
              key="result"
              onBack={handlePrev}
              isActive={currentStep === 3}
            />,
          ]}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </AppShell.Main>
    </AppShell>
  );
}
