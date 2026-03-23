import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe2Value — Creator Intelligence",
  description: "Find creators that convert. Hybrid search by semantic relevance × commercial performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
