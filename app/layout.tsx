import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoadingProvider } from "@/hooks/use-loading";
import { GlobalLoadingBar } from "@/components/layout/global-loading-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { initializeApp } from "@/lib/init";
import "./globals.css";

// Initialize the application on server startup
if (typeof window === 'undefined') {
  initializeApp();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RSS Reader",
  description: "A modern RSS reader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <TooltipProvider>
              <SidebarProvider>
                <GlobalLoadingBar />
                {children}
              </SidebarProvider>
            </TooltipProvider>
            <Toaster />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
