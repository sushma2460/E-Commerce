import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aura | Premium Curated Fashion & Accessories",
    template: "%s | Aura"
  },
  description: "Experience the next generation of luxury e-commerce. Hand-curated premium accessories, apparel, and footwear with a modern aesthetic.",
  keywords: ["luxury fashion", "premium accessories", "modern e-commerce", "high-end apparel"],
  authors: [{ name: "Aura Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aura-ecommerce.vercel.app",
    siteName: "Aura Premium Shop",
    title: "Aura | Luxury Redefined",
    description: "Discover a curated collection of high-end essentials designed for the modern lifestyle.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center p-4 lg:p-12 relative overflow-x-hidden pt-32 lg:pt-32">
        {/* Subtle glowing ambient light behind glass elements */}
        <div className="fixed top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-purple-500/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
        
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="w-full max-w-7xl relative mx-auto">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
