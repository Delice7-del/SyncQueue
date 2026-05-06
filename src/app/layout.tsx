import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncQueue | Smart Hospital Queue System",
  description: "A premium, offline-first hospital queue management experience.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SyncQueue",
  },
  formatDetection: {
    telephone: false,
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#F6F9FC" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body
        className={`${outfit.className} bg-bg-light text-brand-blue min-h-full antialiased`}
      >
        <Layout>
          {children}
        </Layout>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
