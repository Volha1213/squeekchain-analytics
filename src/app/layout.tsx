import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squeekchain Analytics — Small paws. Real work.",
  description:
    "Independent analytics for Squeekchain on Ethereum Sepolia. Explore real wheel activity, settled Squeek blocks and SQK supply with transparent data sources.",
  applicationName: "Squeekchain Analytics",
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Squeekchain Analytics",
    description:
      "Small paws. Real work. A transparent look at the hamster-powered blockchain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
