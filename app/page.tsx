"use client";

import {
    Home,
    Thermometer,
    Droplet,
    Zap,
    DoorClosed,
    Lightbulb,
    Wind,
    Sun,
    Moon,
    Power,
    Wifi,
    WifiOff,
    Gauge,
    PlugZap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useHomeAssistant } from "@/hooks/use-home-assistant";
import dayjs from "dayjs";

interface SensorData {
    displayName: string;
    value: string;
    unit: string;
    icon: string;
    lastUpdated: string;
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const { sensors, lights, loading, connected, toggleLight, callService } =
        useHomeAssistant();

    // Helper function to get room data
    const getRoomData = (room: string) => {
        const tempKey = `sensor.sensor_temperature_${room.toLowerCase()}_temperature`;
        const humidityKey = `sensor.sensor_temperature_${room.toLowerCase()}_humidity`;

        return {
            temperature: sensors[tempKey]?.value
                ? `${sensors[tempKey].value}${sensors[tempKey].unit}`
                : "--",
            humidity: sensors[humidityKey]?.value
                ? `${sensors[humidityKey].value}${sensors[humidityKey].unit}`
                : "--",
            lights: Object.keys(sensors).filter(
                (key) =>
                    key.startsWith("switch.lightswitch_") &&
                    key.includes(room.toLowerCase())
            ).length,
            lightsOn: Object.entries(sensors).filter(
                ([key, data]) =>
                    key.startsWith("switch.lightswitch_") &&
                    key.includes(room.toLowerCase()) &&
                    (data as SensorData).value === "on"
            ).length,
        };
    };

    // Helper function to get door status
    const getDoorStatus = (door: string) => {
        const doorKey = `binary_sensor.sensor_${door.toLowerCase()}_door_contact`;
        return {
            status: sensors[doorKey]?.value === "off" ? "Closed" : "Open",
            lastUpdated: sensors[doorKey]?.lastUpdated
                ? dayjs(sensors[doorKey].lastUpdated).format(
                      "DD/MM/YYYY HH:mm:ss"
                  )
                : "--",
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Home Dashboard</h1>
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
                    {/* Quick Status Cards */}
                    <section className="mb-6">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Temperature Card */}
                            <Card className="w-48 h-24 bg-[#18181b] rounded-lg flex items-start">
                                <CardContent className="flex p-2 w-full h-full">
                                    <div className="flex items-center justify-center bg-orange-900/30 rounded-full h-8 w-12 mt-1 mr-3">
                                        <Thermometer className="h-4 w-4 text-orange-400" />
                                    </div>
                                    <div className="flex flex-col items-start w-full">
                                        <div className="flex items-end gap-1 mt-1">
                                            <span className="text-2xl font-extrabold text-white leading-none">
                                                {(
                                                    Object.entries(sensors)
                                                        .filter(
                                                            ([_key, data]: [
                                                                string,
                                                                SensorData
                                                            ]) =>
                                                                data.unit ===
                                                                "°C"
                                                        )
                                                        .reduce(
                                                            (
                                                                acc,
                                                                [_key, data]: [
                                                                    string,
                                                                    SensorData
                                                                ]
                                                            ) =>
                                                                acc +
                                                                parseFloat(
                                                                    data.value
                                                                ),
                                                            0
                                                        ) /
                                                    Object.entries(
                                                        sensors
                                                    ).filter(
                                                        ([_key, data]: [
                                                            string,
                                                            SensorData
                                                        ]) => data.unit === "°C"
                                                    ).length
                                                ).toFixed(1) || "--"}
                                            </span>
                                            <span className="text-base font-bold text-white mb-0.5">
                                                °C
                                            </span>
                                        </div>
                                        <div className="h-2" />
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Droplet className="h-3 w-3 text-blue-400" />
                                            <span className="font-bold text-white">
                                                {(
                                                    Object.entries(sensors)
                                                        .filter(
                                                            ([_key, data]: [
                                                                string,
                                                                SensorData
                                                            ]) =>
                                                                data.unit ===
                                                                "%"
                                                        )
                                                        .reduce(
                                                            (
                                                                acc,
                                                                [_key, data]: [
                                                                    string,
                                                                    SensorData
                                                                ]
                                                            ) =>
                                                                acc +
                                                                parseFloat(
                                                                    data.value
                                                                ),
                                                            0
                                                        ) /
                                                    Object.entries(
                                                        sensors
                                                    ).filter(
                                                        ([_key, data]: [
                                                            string,
                                                            SensorData
                                                        ]) => data.unit === "%"
                                                    ).length
                                                ).toFixed(1) || "--"}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Power Card */}
                            <Card className="w-48 h-24 bg-[#18181b] rounded-lg flex items-start">
                                <CardContent className="flex p-2 w-full h-full">
                                    <div className="flex items-center justify-center bg-blue-900/30 rounded-full h-8 w-12 mt-1 mr-3">
                                        <Zap className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div className="flex flex-col items-start w-full">
                                        <div className="flex items-end gap-1 mt-1">
                                            <span className="text-2xl font-extrabold text-white leading-none">
                                                {sensors[
                                                    "sensor.breaker_phase_a_power"
                                                ]?.value
                                                    ? `${sensors["sensor.breaker_phase_a_power"].value}`
                                                    : "--"}
                                            </span>
                                            <span className="text-base font-bold text-white mb-0.5">
                                                {sensors[
                                                    "sensor.breaker_phase_a_power"
                                                ]?.unit || "W"}
                                            </span>
                                        </div>
                                        <div className="h-2" />
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <PlugZap className="h-3 w-3 text-blue-400" />
                                            <span className="font-bold text-white">
                                                {sensors[
                                                    "sensor.breaker_phase_a_voltage"
                                                ]?.value || "--"}{" "}
                                                V
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Gauge className="h-3 w-3 text-blue-400" />
                                            <span className="font-bold text-white">
                                                {sensors[
                                                    "sensor.breaker_phase_a_current"
                                                ]?.value || "--"}{" "}
                                                A
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

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
                            <div className="space-y-4">
                                {/* Rooms Summary */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold mb-3">
                                            Rooms
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                "Living",
                                                "Bedroom",
                                                "Kitchen",
                                                "Office",
                                            ].map((room) => {
                                                const roomData = getRoomData(
                                                    room.toLowerCase()
                                                );
                                                return (
                                                    <div
                                                        key={room}
                                                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Home className="h-5 w-5 text-gray-400" />
                                                            <div>
                                                                <p className="font-medium">
                                                                    {room}
                                                                </p>
                                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Thermometer className="h-3 w-3 text-orange-400" />
                                                                    {
                                                                        roomData.temperature
                                                                    }
                                                                    <span className="mx-1 text-gray-500">
                                                                        •
                                                                    </span>
                                                                    <Droplet className="h-3 w-3 text-blue-400" />
                                                                    {
                                                                        roomData.humidity
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                roomData.lightsOn >
                                                                0
                                                                    ? "bg-amber-900/30 text-amber-400 border-amber-800"
                                                                    : "bg-gray-900/80 text-gray-400 border-gray-700"
                                                            }
                                                        >
                                                            {roomData.lightsOn}/
                                                            {roomData.lights}{" "}
                                                            lights
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Security Status */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold mb-3">
                                            Security
                                        </h3>
                                        <div className="space-y-3">
                                            {["lobby", "yard"].map((door) => {
                                                const doorStatus =
                                                    getDoorStatus(door);
                                                return (
                                                    <div
                                                        key={door}
                                                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <DoorClosed className="h-5 w-5 text-gray-400" />
                                                            <div>
                                                                <p className="font-medium capitalize">
                                                                    {door} Door
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {
                                                                        doorStatus.lastUpdated
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                doorStatus.status ===
                                                                "Closed"
                                                                    ? "bg-green-900/30 text-green-400 border-green-800"
                                                                    : "bg-red-900/30 text-red-400 border-red-800"
                                                            }
                                                        >
                                                            {doorStatus.status}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
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
                            <div className="space-y-4">
                                {/* Temperature Controls */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Wind className="h-5 w-5 text-blue-400" />
                                            <h3 className="font-semibold">
                                                AC Control
                                            </h3>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-400">
                                                    Temperature
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {(
                                                        Object.entries(sensors)
                                                            .filter(
                                                                ([key]) =>
                                                                    key.includes(
                                                                        "temperature"
                                                                    ) &&
                                                                    key.includes(
                                                                        "sensor.sensor_temperature_"
                                                                    )
                                                            )
                                                            .reduce(
                                                                (
                                                                    acc,
                                                                    [_, data]: [
                                                                        string,
                                                                        SensorData
                                                                    ]
                                                                ) =>
                                                                    acc +
                                                                    parseFloat(
                                                                        data.value
                                                                    ),
                                                                0
                                                            ) /
                                                        Object.keys(
                                                            sensors
                                                        ).filter(
                                                            (key) =>
                                                                key.includes(
                                                                    "temperature"
                                                                ) &&
                                                                key.includes(
                                                                    "sensor.sensor_temperature_"
                                                                )
                                                        ).length
                                                    ).toFixed(1) || "--"}
                                                    °C
                                                </span>
                                            </div>
                                            <Slider
                                                defaultValue={[24]}
                                                max={30}
                                                min={16}
                                                step={1}
                                                className="mb-4"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="bg-gray-700 border-gray-600"
                                            >
                                                <Power className="h-4 w-4 mr-2" />
                                                Off
                                            </Button>
                                            <Button className="bg-blue-900/30 text-blue-400 border-blue-800">
                                                <Wind className="h-4 w-4 mr-2" />
                                                Cool
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Room Temperatures */}
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold mb-3">
                                            Room Temperatures
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                "Living",
                                                "Bedroom",
                                                "Kitchen",
                                                "Office",
                                            ].map((room) => {
                                                const roomData = getRoomData(
                                                    room.toLowerCase()
                                                );
                                                return (
                                                    <div
                                                        key={room}
                                                        className="bg-gray-900 p-3 rounded-lg text-center"
                                                    >
                                                        <p className="text-sm font-medium mb-1">
                                                            {room}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-1 mb-1">
                                                            <Thermometer className="h-4 w-4 text-orange-400" />
                                                            <span className="text-lg font-bold">
                                                                {
                                                                    roomData.temperature
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Droplet className="h-3 w-3 text-blue-400" />
                                                            <span className="text-xs text-gray-400">
                                                                {
                                                                    roomData.humidity
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </ScrollArea>

            {/* Bottom Navigation */}
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
        </div>
    );
}

interface LightCardProps {
    name: string;
    isOn: boolean;
    entityId: string;
    toggleLight: (entityId: string) => Promise<void>;
}

// Mobile Light Card Component - Optimized for touch interactions
function LightCard({
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
