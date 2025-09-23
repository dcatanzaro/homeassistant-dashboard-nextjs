"use client";

import {
    Wifi,
    WifiOff,
    Battery,
    BatteryLow,
    BatteryMedium,
    Signal,
    SignalHigh,
    SignalMedium,
    SignalLow,
    ArrowLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useHomeAssistant } from "@/hooks/use-home-assistant";
import { LoadingScreen } from "@/components/dashboard";
import { sensorConfigs, getSensorConfig } from "@/app/config/sensors";
import Link from "next/link";

interface DeviceData {
    deviceName: string;
    displayName: string;
    battery?: number;
    linkQuality?: number;
    lastUpdated: string;
    batteryEntityId?: string;
    linkQualityEntityId?: string;
    unitOfMeasurement?: string;
}

export default function DevicesPage() {
    const { states, loading, connected } = useHomeAssistant();
    const [devices, setDevices] = useState<DeviceData[]>([]);

    useEffect(() => {
        if (Object.keys(states).length === 0) return;

        const deviceEntities = Object.values(states).filter((state) => {
            const entityId = state.entity_id;
            const attributes = state.attributes;

            // Only include entities that are in our sensor configuration
            const sensorConfig = getSensorConfig(entityId);
            if (!sensorConfig) return false;

            // Look for entities that have battery or link quality information
            return (
                entityId.includes("battery") || entityId.includes("linkquality")
            );
        });

        // Group sensors by device name
        const deviceMap = new Map<string, DeviceData>();

        deviceEntities.forEach((state) => {
            const attributes = state.attributes;
            const entityId = state.entity_id;

            // Extract base device name by removing battery/linkquality suffixes
            let baseDeviceName = entityId
                .replace(/\.(battery|linkquality|link_quality|lqi|signal)$/, "")
                .replace(/^sensor\./, "");

            // If the first replace didn't work, try a more specific approach
            if (baseDeviceName === entityId.replace(/^sensor\./, "")) {
                // Remove the last part after the last underscore if it's battery/linkquality
                const parts = baseDeviceName.split("_");
                const lastPart = parts[parts.length - 1];
                if (
                    [
                        "battery",
                        "linkquality",
                        "link_quality",
                        "lqi",
                        "signal",
                    ].includes(lastPart)
                ) {
                    parts.pop();
                    baseDeviceName = parts.join("_");
                }
            }

            console.log(`Entity: ${entityId} -> Base: ${baseDeviceName}`);

            // Clean up the device name for display
            let deviceName = baseDeviceName.replace(/_/g, " ");
            deviceName = deviceName.replace(/\b\w/g, (l: string) =>
                l.toUpperCase()
            );

            // Extract display name from sensor config, friendly name, or use device name
            const sensorConfig = getSensorConfig(entityId);
            let displayName =
                sensorConfig?.displayName ||
                attributes.friendly_name ||
                deviceName;
            displayName = displayName
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase());

            // Get or create device entry using the base device name as key
            let device = deviceMap.get(baseDeviceName);
            if (!device) {
                device = {
                    deviceName: baseDeviceName,
                    displayName,
                    lastUpdated: state.last_updated,
                    unitOfMeasurement: attributes.unit_of_measurement,
                };
                deviceMap.set(baseDeviceName, device);
            }

            // Extract battery value
            if (
                entityId.includes("battery") ||
                attributes.device_class === "battery"
            ) {
                let battery: number | undefined;
                if (attributes.battery !== undefined) {
                    battery = attributes.battery;
                } else if (!isNaN(Number(state.state))) {
                    battery = Number(state.state);
                }
                if (battery !== undefined) {
                    device.battery = battery;
                    device.batteryEntityId = entityId;
                }
            }

            // Extract link quality value
            if (
                entityId.includes("linkquality") ||
                entityId.includes("link_quality") ||
                entityId.includes("lqi") ||
                entityId.includes("signal") ||
                attributes.device_class === "signal_strength"
            ) {
                let linkQuality: number | undefined;
                if (attributes.link_quality !== undefined) {
                    linkQuality = attributes.link_quality;
                } else if (attributes.lqi !== undefined) {
                    linkQuality = attributes.lqi;
                } else if (attributes.signal_strength !== undefined) {
                    linkQuality = attributes.signal_strength;
                } else if (!isNaN(Number(state.state))) {
                    linkQuality = Number(state.state);
                }
                if (linkQuality !== undefined) {
                    device.linkQuality = linkQuality;
                    device.linkQualityEntityId = entityId;
                }
            }

            // Update last updated time to the most recent
            if (new Date(state.last_updated) > new Date(device.lastUpdated)) {
                device.lastUpdated = state.last_updated;
            }
        });

        const deviceData: DeviceData[] = Array.from(deviceMap.values());
        setDevices(deviceData);
    }, [states]);

    const getBatteryIcon = (battery?: number) => {
        if (battery === undefined) return null;

        if (battery <= 20)
            return <BatteryLow className="h-4 w-4 text-red-400" />;
        if (battery <= 50)
            return <BatteryMedium className="h-4 w-4 text-yellow-400" />;
        if (battery <= 80)
            return <Battery className="h-4 w-4 text-green-400" />;
        return <Battery className="h-4 w-4 text-green-400" />;
    };

    const getSignalIcon = (linkQuality?: number) => {
        if (linkQuality === undefined) return null;

        if (linkQuality >= 80)
            return <SignalHigh className="h-4 w-4 text-green-400" />;
        if (linkQuality >= 60)
            return <SignalMedium className="h-4 w-4 text-yellow-400" />;
        if (linkQuality >= 40)
            return <SignalLow className="h-4 w-4 text-orange-400" />;
        return <Signal className="h-4 w-4 text-red-400" />;
    };

    const getBatteryColor = (battery?: number) => {
        if (battery === undefined) return "text-gray-400";
        if (battery <= 20) return "text-red-400";
        if (battery <= 50) return "text-yellow-400";
        return "text-green-400";
    };

    const getSignalColor = (linkQuality?: number) => {
        if (linkQuality === undefined) return "text-gray-400";
        if (linkQuality >= 80) return "text-green-400";
        if (linkQuality >= 60) return "text-yellow-400";
        if (linkQuality >= 40) return "text-orange-400";
        return "text-red-400";
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="p-1">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">Device Status</h1>
                    </div>
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

            {/* Main Content */}
            <ScrollArea className="flex-1">
                <main className="p-4 pb-24">
                    {devices.length === 0 ? (
                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="p-6 text-center">
                                <p className="text-gray-400">
                                    No devices with battery or link quality
                                    information found.
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Make sure your Home Assistant entities have
                                    battery or link quality attributes.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {devices.map((device) => (
                                <Card
                                    key={device.deviceName}
                                    className="bg-gray-900 border-gray-800"
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            <span>{device.displayName}</span>
                                            <div className="flex gap-1">
                                                {device.batteryEntityId && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Battery
                                                    </Badge>
                                                )}
                                                {device.linkQualityEntityId && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Signal
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Battery Status */}
                                            <div className="flex items-center gap-2">
                                                {getBatteryIcon(device.battery)}
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        Battery
                                                    </p>
                                                    <p
                                                        className={`font-medium ${getBatteryColor(
                                                            device.battery
                                                        )}`}
                                                    >
                                                        {device.battery !==
                                                        undefined
                                                            ? `${
                                                                  device.battery
                                                              }${
                                                                  device.unitOfMeasurement ||
                                                                  "%"
                                                              }`
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Link Quality */}
                                            <div className="flex items-center gap-2">
                                                {getSignalIcon(
                                                    device.linkQuality
                                                )}
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        Signal
                                                    </p>
                                                    <p
                                                        className={`font-medium ${getSignalColor(
                                                            device.linkQuality
                                                        )}`}
                                                    >
                                                        {device.linkQuality !==
                                                        undefined
                                                            ? `${device.linkQuality} LQI`
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Last Updated */}
                                        <div className="mt-3 pt-3 border-t border-gray-800">
                                            <p className="text-xs text-gray-500">
                                                Last updated:{" "}
                                                {new Date(
                                                    device.lastUpdated
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </ScrollArea>
        </div>
    );
}
