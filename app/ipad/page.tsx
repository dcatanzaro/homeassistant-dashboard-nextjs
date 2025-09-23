"use client";

import Link from "next/link";
import { Wifi, WifiOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const { sensors, lights, loading, connected, toggleLight } =
        useHomeAssistant();
    const lightsEntries = Object.entries(lights);
    const lightsOnCount = lightsEntries.filter(([, isOn]) => isOn).length;

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
                        <Link
                            href="/devices"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Devices
                        </Link>

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

            {/* Main Content */}
            <ScrollArea className="flex-1">
                <main className={"p-6 pb-12"}>
                    {/* Quick Status Cards */}
                    <QuickStatusCards sensors={sensors} />

                    <div className="grid gap-6 md:grid-cols-2">
                        <section className="space-y-6">
                            <OverviewTab sensors={sensors} />
                        </section>
                        <section className="space-y-6">
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">
                                        Lights
                                    </h2>
                                    <span className="text-xs text-gray-400">
                                        {lightsEntries.length
                                            ? `${lightsOnCount}/${lightsEntries.length} on`
                                            : "No lights"}
                                    </span>
                                </div>
                                {lightsEntries.length ? (
                                    <div className="grid gap-3">
                                        {lightsEntries.map(
                                            ([entityId, isOn]) => (
                                                <LightCard
                                                    key={entityId}
                                                    name={
                                                        sensors[entityId]
                                                            ?.displayName ||
                                                        entityId
                                                    }
                                                    isOn={isOn}
                                                    entityId={entityId}
                                                    toggleLight={toggleLight}
                                                />
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        No lights available.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </ScrollArea>
        </div>
    );
}
