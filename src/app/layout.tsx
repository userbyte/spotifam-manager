import Header from "./components/Header";
import Footer from "./components/Footer";
import { Metadata, Viewport } from "next";
import { Source_Code_Pro } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const font_SourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  fallback: ["Courier New", "Courier", "monospace"],
  display: "swap",
});
const font_SpotifyMix = localFont({
  variable: "--font-spotify-mix",
  src: [
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-ThinItalic.woff2",
      weight: "100",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Light.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-LightItalic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Extrabold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-ExtraboldItalic.woff2",
      weight: "800",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-Ultra.woff2",
      weight: "1000",
      style: "normal",
    },
    {
      path: "./fonts/SpotifyMix/SpotifyMix-UltraItalic.woff2",
      weight: "1000",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sfmgr.userbyte.xyz"),
  title: "spotifam-manager",
  description: "manage a spotify family financially",
  keywords: [],
  manifest: "/pwa/manifest.json",
  icons: {
    icon: "/img/png/logo.png",
    shortcut: "/img/png/logo.png",
    apple: "/img/png/logo_nomask.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/img/png/logo_nomask.png",
    },
  },
  openGraph: {
    siteName: "spotifam-manager",
    images: "/img/png/logo.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${font_SpotifyMix.variable} ${font_SourceCodePro.variable}`}
    >
      <body>
        <Header />
        {children}
        <ToastContainer position="bottom-center" theme="dark" />
        <Footer />
      </body>
    </html>
  );
}
