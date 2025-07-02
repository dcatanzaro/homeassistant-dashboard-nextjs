"use client";

import { Wind, Thermometer, Droplet, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

import { SensorData } from "@/types/dashboard";

interface ClimateTabProps {
    sensors: Record<string, SensorData>;
}

export function ClimateTab({ sensors }: ClimateTabProps) {
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
        };
    };

    return (
        <div className="space-y-4">
            {/* Temperature Controls */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Wind className="h-5 w-5 text-blue-400" />
                        <h3 className="font-semibold">AC Control</h3>
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
                                                key.includes("temperature") &&
                                                key.includes(
                                                    "sensor.sensor_temperature_"
                                                )
                                        )
                                        .reduce(
                                            (
                                                acc,
                                                [_, data]: [string, SensorData]
                                            ) => acc + parseFloat(data.value),
                                            0
                                        ) /
                                    Object.keys(sensors).filter(
                                        (key) =>
                                            key.includes("temperature") &&
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
                    <h3 className="font-semibold mb-3">Room Temperatures</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {["Living", "Bedroom", "Kitchen", "Office"].map(
                            (room) => {
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
                                                {roomData.temperature}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-1">
                                            <Droplet className="h-3 w-3 text-blue-400" />
                                            <span className="text-xs text-gray-400">
                                                {roomData.humidity}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
