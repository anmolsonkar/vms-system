import "./globals.css";

const geistSans = { variable: "--font-geist-sans" };

const geistMono = { variable: "--font-geist-mono" };

export const metadata = {
  title: "VMS - Visitor Management System",
  description:
    "Secure and efficient visitor management system for residential complexes, warehouses, and RWAs. Manage visitors, approvals, and security seamlessly.",
  keywords: [
    "Visitor Management System",
    "VMS",
    "Security Management",
    "Residential Security",
    "Visitor Tracking",
    "Gate Management",
    "Access Control",
    "Apartment Security",
    "Warehouse Visitor Management",
    "RWA Management",
  ],
  authors: [{ name: "Cybersecure Digital Intelligence Private Limited" }],
  creator: "Cybersecure Digital Intelligence Private Limited",
  publisher: "Cybersecure Digital Intelligence Private Limited",
  robots: {
    index: false, // Set to true if you want public indexing
    follow: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900 overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
