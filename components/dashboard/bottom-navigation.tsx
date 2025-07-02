"use client";

import { Home, Lightbulb, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function BottomNavigation({
    activeTab,
    setActiveTab,
}: BottomNavigationProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2">
            <div className="flex justify-around">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto py-2 ${
                        activeTab === "overview"
                            ? "text-blue-400"
                            : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("overview")}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-xs">Home</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto py-2 ${
                        activeTab === "lights"
                            ? "text-blue-400"
                            : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("lights")}
                >
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-xs">Lights</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto py-2 ${
                        activeTab === "climate"
                            ? "text-blue-400"
                            : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("climate")}
                >
                    <Thermometer className="h-5 w-5" />
                    <span className="text-xs">Climate</span>
                </Button>
            </div>
        </nav>
    );
}
