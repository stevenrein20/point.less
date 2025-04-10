import { ReactNode } from "react";
import { Box } from "@mantine/core";

interface CardTransitionsProps {
  children?: ReactNode;
  isActive?: boolean;
}

export function CardBox({ children, isActive = false }: CardTransitionsProps) {
  return (
    <Box
      style={{
        position: "relative",
        maxWidth: 800,
        margin: "0 auto",
        animation: isActive ? "glowingBorder 2s ease-in-out infinite" : "none",
      }}
    >
      <style>
        {`
          @keyframes glowingBorder {
            0% { box-shadow: 0 0 10px rgba(0, 123, 255, 0.2); }
            50% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.6); }
            100% { box-shadow: 0 0 10px rgba(0, 123, 255, 0.2); }
          }
        `}
      </style>
      {children}
    </Box>
  );
}
