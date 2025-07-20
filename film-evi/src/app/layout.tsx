import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Film Evi - İrem & Yusuf'un Sinema Platformu",
  description: "Netflix tarzında modern film takip uygulaması. İrem ve Yusuf'un kişisel sinema deneyimi.",
  keywords: "film, movie, sinema, netflix, tmdb, izleme listesi, film takip",
  authors: [{ name: "Film Evi" }],
  creator: "Film Evi",
  publisher: "Film Evi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Film Evi - İrem & Yusuf'un Sinema Platformu",
    description: "Netflix tarzında modern film takip uygulaması",
    url: "https://filmevi.com",
    siteName: "Film Evi",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Film Evi",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Film Evi - İrem & Yusuf'un Sinema Platformu",
    description: "Netflix tarzında modern film takip uygulaması",
    images: ["/og-image.jpg"],
    creator: "@filmevi",
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
  verification: {
    google: "google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
