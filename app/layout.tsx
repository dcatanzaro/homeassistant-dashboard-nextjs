import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Smart Home Dashboard",
    description: "A modern smart home control dashboard",
    generator: "v0.dev",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Smart Home Dashboard",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: "cover",
    },
    icons: {
        apple: [
            {
                url: "/icons/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Smart Home Dashboard"
                />
                <link
                    rel="apple-touch-icon"
                    href="/icons/apple-touch-icon.png"
                />
                <link rel="manifest" href="/manifest.json" />
                <Script id="service-worker">
                    {`
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', () => {
                                navigator.serviceWorker.register('/sw.js')
                                    .then(registration => {
                                        console.log('ServiceWorker registration successful');
                                    })
                                    .catch(err => {
                                        console.log('ServiceWorker registration failed: ', err);
                                    });
                            });
                        }
                    `}
                </Script>
            </head>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
