"use client";

import { Home, Thermometer, Droplet, DoorClosed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import dayjs from "dayjs";

import { SensorData } from "@/types/dashboard";

interface OverviewTabProps {
    sensors: Record<string, SensorData>;
}

export function OverviewTab({ sensors }: OverviewTabProps) {
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

    return (
        <div className="space-y-4">
            {/* Rooms Summary */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Rooms</h3>
                    <div className="space-y-3">
                        {["Living", "Bedroom", "Kitchen", "Office"].map(
                            (room) => {
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
                                                    {roomData.temperature}
                                                    <span className="mx-1 text-gray-500">
                                                        •
                                                    </span>
                                                    <Droplet className="h-3 w-3 text-blue-400" />
                                                    {roomData.humidity}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                roomData.lightsOn > 0
                                                    ? "bg-amber-900/30 text-amber-400 border-amber-800"
                                                    : "bg-gray-900/80 text-gray-400 border-gray-700"
                                            }
                                        >
                                            {roomData.lightsOn}/
                                            {roomData.lights} lights
                                        </Badge>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Security</h3>
                    <div className="space-y-3">
                        {["lobby", "yard"].map((door) => {
                            const doorStatus = getDoorStatus(door);
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
                                                {doorStatus.lastUpdated}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            doorStatus.status === "Closed"
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
    );
}
