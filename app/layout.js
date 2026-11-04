import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SideBanners from "@/components/SideBanners";
import FireworksSideAnimation from "@/components/FireworksSideAnimation";
import Media from "@/components/Media";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "KanSan Crackers",
  description: "Shop with KanSan Crackers!!",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${outfit.className} antialiased text-gray-700`} suppressHydrationWarning={true} >
          <Toaster />
          <AppContextProvider>
            {children}
          </AppContextProvider>
          <Media />
          <FireworksSideAnimation />
        </body>
      </html>
      </ClerkProvider>
  );
}