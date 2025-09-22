import type React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    applicationName: "Smart Home Dashboard",
    title: {
        default: "Smart Home Dashboard",
        template: "%s | Smart Home Dashboard",
    },
    description: "A modern smart home control dashboard",
    generator: "v0.dev",
    manifest: "/manifest.json",
    themeColor: "#000000",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Smart Home Dashboard",
    },
    icons: {
        icon: [
            {
                url: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                url: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        apple: [
            {
                url: "/icons/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="application-name" content="Smart Home Dashboard" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Smart Home Dashboard"
                />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#000000" />
                <link
                    rel="apple-touch-icon"
                    href="/icons/apple-touch-icon.png"
                />
                <link rel="manifest" href="/manifest.json" />
                <Script id="service-worker" strategy="afterInteractive">
                    {`
                        if ('serviceWorker' in navigator) {
                            const register = () => {
                                navigator.serviceWorker
                                    .register('/sw.js')
                                    .then(() => {
                                        console.log('ServiceWorker registration successful');
                                    })
                                    .catch((err) => {
                                        console.log('ServiceWorker registration failed:', err);
                                    });
                            };

                            if (document.readyState === 'complete') {
                                register();
                            } else {
                                window.addEventListener('load', register, { once: true });
                            }
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
