import { ClerkProvider } from '@clerk/nextjs'
import AuthHeader from '@/components/AuthHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import "./globals.css";

export const metadata = {
  title: "ChatGPT Clone - AI Conversation Assistant",
  description: "A modern ChatGPT clone built with Next.js, featuring real-time AI conversations, conversation sharing, and user authentication.",
  keywords: "ChatGPT, AI, conversation, artificial intelligence, Next.js, React",
  authors: [{ name: "ChatGPT Clone" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "ChatGPT Clone - AI Conversation Assistant",
    description: "A modern ChatGPT clone built with Next.js, featuring real-time AI conversations, conversation sharing, and user authentication.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatGPT Clone - AI Conversation Assistant",
    description: "A modern ChatGPT clone built with Next.js, featuring real-time AI conversations, conversation sharing, and user authentication.",
  }
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <AuthHeader />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  </ClerkProvider>
  );
}
