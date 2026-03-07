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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <title>{metadataConfig.title}</title>
        <meta name="description" content={metadataConfig.description} />

        {/* Viewport meta - critical for mobile Safari and iOS */}
        {/* viewport-fit=cover enables safe-area-inset for notched devices */}
        {/* user-scalable=yes allows accessibility zoom */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=yes, minimum-scale=1.0, maximum-scale=5.0"
        />

        {/* Force dark color scheme - prevent system theme from affecting the app */}
        <meta name="color-scheme" content="dark only" />
        <meta name="theme-color" content="#1a1a2e" />

        {/* iOS Safari specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PERSiBER" />

        {/* Prevent iOS from detecting phone numbers as links */}
        <meta name="format-detection" content="telephone=no" />

        {/* Microsoft/IE specific */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="msapplication-TileColor" content="#1a1a2e" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Favicons and icons */}
        <link rel="icon" href="/icon" type="image/x-icon" />
        <link rel="shortcut icon" href="/icon" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icon" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon" />

        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
      </head>
      <body
        className="flex flex-col antialiased min-h-screen"
        style={{
          // Prevent iOS Safari overscroll bounce on body
          overscrollBehavior: "none",
          // Enable smooth scrolling
          WebkitOverflowScrolling: "touch",
        }}
      >
        <CustomProvider>
          <Setup />
          <NavBar />
          <main className="grow">{children}</main>
        </CustomProvider>
      </body>
    </html>
  );
}
