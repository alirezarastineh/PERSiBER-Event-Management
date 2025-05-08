"use client";

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
        <link rel="icon" href="/icon" type="image/x-icon" />
        <link rel="shortcut icon" href="/icon" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icon" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon" />
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
