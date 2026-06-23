import type { Metadata } from "next";
import { SocketProvider } from "@/providers/SocketProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Queue Cure 26",
  description: "Real-time clinic queue management for receptionists and patients."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
