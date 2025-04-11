import { ReactNode } from "react";
import { Box, Container, Button } from "@mantine/core";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface CardTransitionProps {
  currentStep: number;
  forms: ReactNode[];
  onNext?: () => void;
  onPrev?: () => void;
}

// TODO : Make it so the first card and last card are centered as if they are any other.
export function CardTransition({
  currentStep,
  forms,
  onNext,
  onPrev,
}: CardTransitionProps) {
  return (
    <Container
      size="xl"
      style={{ position: "relative", height: "100%", maxWidth: "1400px" }}
    >
      <Box
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: "1200px",
          overflow: "hidden",
          padding: "40px 0",
        }}
      >
        {currentStep > 0 && onPrev && (
          <Button
            variant="light"
            style={{
              position: "absolute",
              left: "27%",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1000,
              padding: "12px",
              minWidth: "unset",
            }}
            onClick={onPrev}
          >
            <FaArrowLeft size={18} />
          </Button>
        )}
        {currentStep < forms.length - 1 && onNext && (
          <Button
            variant="light"
            style={{
              position: "absolute",
              right: "27%",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1000,
              padding: "12px",
              minWidth: "unset",
            }}
            onClick={onNext}
          >
            <FaArrowRight size={18} />
          </Button>
        )}
        {forms.map((form, index) => {
          const isPrevious = index === currentStep - 1;
          const isCurrent = index === currentStep;
          const isNext = index === currentStep + 1;
          // Show phantom cards for consistent spacing
          const isPhantomRight = currentStep === 0 && index === forms.length - 1;
          const isPhantomLeft = currentStep === forms.length - 1 && index === 0;
          const isVisible = isPrevious || isCurrent || isNext || isPhantomRight || isPhantomLeft;

          // Hide cards that are not adjacent to the current card or phantom
          if (!isVisible) return null;

          // Render visible cards with proper positioning
          return (
            <Box
              key={index}
              style={{
                position: "relative",
                width: "100%",
                transform: `
                  translateX(${isPrevious || isPhantomLeft ? "-20%" : isNext || isPhantomRight ? "20%" : "0%"})
                  scale(${isCurrent ? 1 : isPhantomLeft || isPhantomRight ? 0.8 : 0.9})
                  translateZ(${isCurrent ? 0 : isPhantomLeft || isPhantomRight ? -100 : -50}px)
                `,
                opacity: isCurrent ? 1 : isPhantomLeft || isPhantomRight ? 0.4 : 0.6,
                transition: "all 0.3s ease-in-out",
                cursor:
                  (isPrevious && onPrev) || (isNext && onNext)
                    ? "pointer"
                    : "default",
                pointerEvents: isCurrent ? "auto" : "none",
              }}
              onClick={() => {
                if (isPrevious && onPrev) onPrev();
                if (isNext && onNext) onNext();
              }}
            >
              {form}
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
