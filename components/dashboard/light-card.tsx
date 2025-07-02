"use client";

import { Lightbulb, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LightCardProps {
    name: string;
    isOn: boolean;
    entityId: string;
    toggleLight: (entityId: string) => Promise<void>;
}

// Mobile Light Card Component - Optimized for touch interactions
export function LightCard({
    name,
    isOn,
    entityId,
    toggleLight: toggleLightProp,
}: LightCardProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        try {
            setLoading(true);
            await toggleLightProp(entityId);
        } catch (error) {
            console.error("Failed to toggle light:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                isOn
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30"
                    : "bg-gray-800 border-gray-700"
            }`}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-full transition-colors duration-200 ${
                        isOn ? "bg-amber-500/30" : "bg-gray-700"
                    }`}
                >
                    <Lightbulb
                        className={`h-6 w-6 ${
                            isOn ? "text-amber-400" : "text-gray-500"
                        }`}
                    />
                </div>
                <div>
                    <p className="font-semibold text-lg">{name}</p>
                    <p className="text-sm text-gray-400">
                        {isOn ? "Light is on" : "Light is off"}
                    </p>
                </div>
            </div>
            <Button
                variant="outline"
                size="lg"
                className={`h-12 w-12 p-0 rounded-full transition-all duration-200 ${
                    isOn
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30"
                        : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                }`}
                onClick={handleToggle}
                disabled={loading}
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                    <Power className="h-5 w-5" />
                )}
            </Button>
        </div>
    );
}
