import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eurohuncfot | AI StoryWriter",
  description: "Epic, AI-generated stories for kids of all ages",
  icons: {
    icon: "/logo.webp",
  },

  openGraph: {
    title: "AI Huncfot | AI StoryWriter",
    description: "Epic, AI-generated stories for kids of all ages",
    url: "https://huncfot.aiverge.io",
    siteName: "AI Huncfot",
    images: [
      {
        url: "https://huncfot.aiverge.io/logo.webp",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        {children}

        <Toaster duration={8000} position="bottom-left" />
      </body>
    </html>
  );
}
