import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMS - ATARI",
  description:
    "ICAR - Agricultural Technology Application Research Institute: Agriculture Management System",
  // Chrome's built-in page-translate feature edits the DOM directly,
  // outside React's control - when React then re-renders, the translated
  // and original text nodes can both stay on screen (visible as doubled,
  // offset text in a different font). Marking the document non-translatable
  // stops Chrome from offering/running translation on it at all.
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${inter.variable} notranslate h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
