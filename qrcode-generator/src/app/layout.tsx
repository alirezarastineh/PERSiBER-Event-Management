import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import CustomProvider from "@/redux/provider";
import Setup from "./utils/Setup";
import NavBar from "./components/Common/NavBar";

export const metadata: Metadata = {
  title: "PERSiBER Event Management",
  description: "Manage events with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <CustomProvider>
          <Setup />
          <NavBar />
          <div className="flex-grow">{children}</div>
        </CustomProvider>
      </body>
    </html>
  );
}
