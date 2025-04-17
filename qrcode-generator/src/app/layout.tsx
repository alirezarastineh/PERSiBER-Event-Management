"use client";

import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import CustomProvider from "@/redux/provider";
import Setup from "./utils/Setup";
import NavBar from "./components/Common/NavBar";

// This metadata needs to be moved to a separate config file since we're using "use client"
const metadataConfig = {
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
      <head>
        <title>{metadataConfig.title}</title>
        <meta name="description" content={metadataConfig.description} />
        <link rel="icon" href="/icon" type="image/png" />
        <link rel="icon" href="/icon" type="image/svg+xml" />
      </head>
      <body className="flex flex-col">
        <CustomProvider>
          <Setup />
          <NavBar />
          <div className="grow">{children}</div>
        </CustomProvider>
      </body>
    </html>
  );
}
