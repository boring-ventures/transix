import { Inter } from 'next/font/google'
import "./globals.css"
import { Providers } from '@/components/providers'
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const neutro = localFont({
  src: "../../public/fonts/Neutro-ExtraBold.otf",
  variable: "--font-neutro",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${neutro.variable}`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
