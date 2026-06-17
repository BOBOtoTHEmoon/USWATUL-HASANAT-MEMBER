import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uswatul Hasanat — Member Verification",
  description: "Official member verification system for Uswatul Hasanat Society",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
