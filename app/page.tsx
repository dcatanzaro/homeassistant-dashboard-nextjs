"use client";

import { Wifi, WifiOff, Home, Settings, Sun } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useHomeAssistant } from "@/hooks/use-home-assistant";
import {
    QuickStatusCards,
    OverviewTab,
    LightCard,
    ClimateTab,
    BottomNavigation,
    LoadingScreen,
} from "@/components/dashboard";
import { SensorData } from "@/types/dashboard";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const { sensors, lights, loading, connected, toggleLight } =
        useHomeAssistant();

    // PWA Installation check
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    if (typeof window !== "undefined") {
        window.addEventListener("beforeinstallprompt", (e) => {
            setInstallPrompt(e);
        });
    }

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Smart Home Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {connected ? (
                                <Wifi className="h-4 w-4 text-green-400" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-400" />
                            )}
                            <span className="text-xs text-gray-400">
                                {connected ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* PWA Install Banner */}
            {installPrompt && (
                <div className="bg-blue-600 p-3 text-center">
                    <p className="text-sm">
                        Install this app on your home screen!
                    </p>
                    <button
                        onClick={() => {
                            installPrompt.prompt();
                            setInstallPrompt(null);
                        }}
                        className="mt-2 bg-white text-blue-600 px-4 py-1 rounded text-sm"
                    >
                        Install
                    </button>
                </div>
            )}

            {/* Main Content */}
            <ScrollArea className="flex-1">
                <main className="p-4 pb-24">
                    {/* Quick Status Cards */}
                    <QuickStatusCards sensors={sensors} />

                    {/* Mobile Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="mb-6"
                    >
                        <TabsList className="grid grid-cols-3 bg-gray-800 h-12">
                            <TabsTrigger value="overview" className="text-sm">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="lights" className="text-sm">
                                Lights
                            </TabsTrigger>
                            <TabsTrigger value="climate" className="text-sm">
                                Climate
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-4">
                            <OverviewTab sensors={sensors} />
                        </TabsContent>

                        {/* Lights Tab */}
                        <TabsContent value="lights" className="mt-4">
                            <div className="space-y-3">
                                {Object.entries(lights).map(
                                    ([entityId, isOn]) => (
                                        <LightCard
                                            key={entityId}
                                            name={
                                                sensors[entityId]
                                                    ?.displayName || entityId
                                            }
                                            isOn={isOn}
                                            entityId={entityId}
                                            toggleLight={toggleLight}
                                        />
                                    )
                                )}
                            </div>
                        </TabsContent>

                        {/* Climate Tab */}
                        <TabsContent value="climate" className="mt-4">
                            <ClimateTab sensors={sensors} />
                        </TabsContent>
                    </Tabs>
                </main>
            </ScrollArea>

            {/* Bottom Navigation */}
            <BottomNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </div>
    );
}
