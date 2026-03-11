import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import DeviceInitializer from "@/components/DeviceInitializer";
import PwaInitializer from "@/components/PwaInitializer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FormMicro2 - Registre des Visiteurs",
  description: "Système moderne de gestion des visiteurs avec enregistrement des arrivées et départs",
  keywords: ["registre", "visiteurs", "sécurité", "gestion", "arrivée", "départ"],
  authors: [{ name: "FormMicro2" }],
  creator: "FormMicro2",
  publisher: "FormMicro2",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FormMicro2",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://formmicro2.example.com"),
  openGraph: {
    title: "FormMicro2 - Registre des Visiteurs",
    description: "Système moderne de gestion des visiteurs",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        <PwaInitializer />
        <DeviceInitializer />
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={4000}
          theme="dark"
        />
      </body>
    </html>
  );
}

