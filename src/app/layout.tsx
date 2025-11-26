import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://godrejaerophase.in"),
  title: "Godrej AeroPhase Panvel | Luxury 2 & 3 BHK Apartments in Navi Mumbai",
  description:
    "Discover luxury living at Godrej AeroPhase Panvel - premium 2 & 3 BHK apartments in 106-acre township with 9-hole golf course, 20 mins from Navi Mumbai Airport by Godrej Properties.",
  keywords: [
    "Godrej Aerophase",
    "Godrej Aerophase Panvel",
    "Godrej Properties",
    "Luxury apartments Panvel",
    "Navi Mumbai apartments",
    "2 BHK apartments Panvel",
    "3 BHK apartments Panvel",
    "Golf course apartments",
    "Premium apartments Navi Mumbai",
    "Integrated township Panvel",
    "Godrej City Panvel",
    "The Highlands Godrej",
    "Green Terraces Godrej",
    "Panvel luxury homes",
    "Navi Mumbai Airport proximity",
    "Golf view apartments",
    "Godrej residential projects",
    "Premium lifestyle Panvel",
    "Thombrewadi Panvel",
    "Mumbai Pune Expressway apartments",
    "RERA approved Panvel",
    "Ready to move apartments",
    "Godrej Properties Panvel",
    "Luxury township Navi Mumbai",
    "Golf course view homes",
    "Premium amenities apartments",
    "Godrej AeroPhase price",
    "Godrej AeroPhase floor plans",
    "Panvel real estate",
    "Navi Mumbai properties",
  ],
  authors: [{ name: "Symbiosis Infra Pvt Ltd" }],
  creator: "Symbiosis Infra Pvt Ltd",
  publisher: "Symbiosis Infra Pvt Ltd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://godrejaerophase.in",
  },
  verification: {
    google: "RcVAbwn1pRJN-vQuiaovKKd-zoFXxehJQGIQRFQiNKY",
  },
  openGraph: {
    title:
      "Godrej AeroPhase Panvel | Luxury 2 & 3 BHK Apartments in Navi Mumbai | Panvel",
    description:
      "Discover luxury living at Godrej AeroPhase Panvel - premium 2 & 3 BHK apartments in 106-acre township with 9-hole golf course, 20 mins from Navi Mumbai Airport.",
    url: "https://godrejaerophase.in",
    siteName: "Godrej AeroPhase Panvel",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/5.webp",
        width: 1200,
        height: 630,
        alt: "Godrej AeroPhase Panvel - Luxury Apartments in Navi Mumbai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Godrej Aerophase Panvel | Luxury Apartments Navi Mumbai",
    description:
      "Premium 2 & 3 BHK apartments in 106-acre integrated township with world-class amenities, 20 minutes from Navi Mumbai Airport.",
    images: [
      "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/5.webp",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  category: "real-estate",
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
        <meta
          name="theme-color"
          content="#2563EB" /* blue theme color for Godrej Aerophase Panvel */
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#2563EB" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz@6..12&display=swap"
          rel="stylesheet"
        />

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PW939HMX');
            `,
          }}
        />

        {/* Schema.org structured data */}
        <Script
          id="schema-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Godrej AeroPhase Panvel",
              description:
                "Luxury 2 & 3 BHK apartments in 106-acre integrated township with world-class amenities by Godrej Properties Limited",
              url: "https://godrejaerophase.in",
              logo: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/logo.webp",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Panvel",
                addressRegion: "Navi Mumbai",
                postalCode: "410206",
                addressCountry: "IN",
                streetAddress: "Village Thombrewadi, Panvel",
              },
              telephone: "+91-9311377754",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "10:00",
                closes: "18:00",
              },
              priceRange: "₹₹₹₹",
              makesOffer: {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Apartment",
                  name: "Godrej AeroPhase Panvel",
                  description:
                    "Premium 2 & 3 BHK apartments in 106-acre integrated township with 9-hole golf course and world-class amenities",
                  numberOfRooms: {
                    "@type": "QuantitativeValue",
                    minValue: "2",
                    maxValue: "3",
                  },
                  floorSize: {
                    "@type": "QuantitativeValue",
                    minValue: "686",
                    maxValue: "1200",
                    unitCode: "SqrFt",
                  },
                  amenityFeature: [
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "9-Hole Golf Course",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Grand Clubhouse",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Swimming Pool",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Gymnasium & Spa",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Sports Courts",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Shopping Plaza",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Business Centre",
                      value: true,
                    },
                    {
                      "@type": "LocationFeatureSpecification",
                      name: "Kids Play Area",
                      value: true,
                    },
                  ],
                },
                price: {
                  "@type": "PriceSpecification",
                  price: "1.09",
                  priceCurrency: "INR",
                  unitCode: "Crore",
                },
              },
              areaServed: {
                "@type": "Place",
                name: "Navi Mumbai",
                containedInPlace: {
                  "@type": "Place",
                  name: "Maharashtra, India",
                },
              },
            }),
          }}
        />

        {/* Google Ads Conversion Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16735189245"
          strategy="afterInteractive"
        />
        <Script
          id="google-ads-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-16735189245');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900 overflow-x-hidden`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PW939HMX"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {children}
      </body>
    </html>
  );
}