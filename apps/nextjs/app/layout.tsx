import { Inter } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import NextAuthSessionProvider from "./components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pointless",
  description: "Pointless - Your Jira Story Point Estimator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <MantineProvider defaultColorScheme="light">
            <Notifications />
            {children}
          </MantineProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
