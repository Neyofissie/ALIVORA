import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/Feedback";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Alivora", template: "%s · Alivora" },
  description: "Life, beautifully in sync. Plan, organise and share family life.",
  applicationName: "Alivora",
  appleWebApp: { capable: true, title: "Alivora", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#F8F6F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
