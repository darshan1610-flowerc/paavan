import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PAAVAN Go-Electric — Campus E-Bike Rentals, IIT Bombay",
  description:
    "Premium e-bike rentals for IIT Bombay campus. ₹39/day. No license required. Removable battery. Daily unlock code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} antialiased`}
    >
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
