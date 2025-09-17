import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "TaskMaster - Intelligent Task Management",
  description: "A modern, secure task management application with advanced auto-logout features for enhanced security.",
  keywords: "task management, todo, productivity, security, auto-logout, JWT",
  authors: [{ name: "TaskMaster Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
