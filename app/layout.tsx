import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Anton, Bebas_Neue, Caveat, Outfit, Shrikhand, Rasa } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const shrikhand = Shrikhand({
  variable: "--font-shrikhand",
  weight: "400",
  subsets: ["gujarati"],
});

const rasa = Rasa({
  variable: "--font-rasa",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["gujarati", "latin"],
});

export const metadata: Metadata = {
  title: "CamBuddy — Premium Wedding Photography & Cinematic Films Studio",
  description: "Discover luxury wedding photography packages, cinematic 4K films, and custom quote tools. Build your dream wedding coverage with CamBuddy's interactive proposal builder.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  return (
    <html
      lang={locale}
      className={`${anton.variable} ${bebas.variable} ${caveat.variable} ${outfit.variable} ${shrikhand.variable} ${rasa.variable} h-full antialiased`}
      data-locale={locale}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
