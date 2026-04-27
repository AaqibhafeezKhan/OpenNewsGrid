import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Global News Daily - Real-Time World News Aggregation",
  description:
    "Get breaking news and top stories from thousands of global sources. Real-time news aggregation from around the world.",
  keywords:
    "news, global news, breaking news, world news, international news, headlines",
  authors: [{ name: "Global News Daily" }],
  openGraph: {
    title: "Global News Daily",
    description: "Real-Time World News Aggregation",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global News Daily",
    description: "Real-Time World News Aggregation",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <ThemeProvider>
          <Header />
          <main className="min-h-[calc(100vh-300px)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
