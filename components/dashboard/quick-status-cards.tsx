"use client";

import { Thermometer, Droplet, Zap, PlugZap, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { SensorData } from "@/types/dashboard";

interface QuickStatusCardsProps {
    sensors: Record<string, SensorData>;
}

export function QuickStatusCards({ sensors }: QuickStatusCardsProps) {
    return (
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
                                                ]) => data.unit === "°C"
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
                                                    parseFloat(data.value),
                                                0
                                            ) /
                                        Object.entries(sensors).filter(
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
                                                ]) => data.unit === "%"
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
                                                    parseFloat(data.value),
                                                0
                                            ) /
                                        Object.entries(sensors).filter(
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
                                    {sensors["sensor.breaker_phase_a_power"]
                                        ?.value
                                        ? `${sensors["sensor.breaker_phase_a_power"].value}`
                                        : "--"}
                                </span>
                                <span className="text-base font-bold text-white mb-0.5">
                                    {sensors["sensor.breaker_phase_a_power"]
                                        ?.unit || "W"}
                                </span>
                            </div>
                            <div className="h-2" />
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <PlugZap className="h-3 w-3 text-blue-400" />
                                <span className="font-bold text-white">
                                    {sensors["sensor.breaker_phase_a_voltage"]
                                        ?.value || "--"}{" "}
                                    V
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Gauge className="h-3 w-3 text-blue-400" />
                                <span className="font-bold text-white">
                                    {sensors["sensor.breaker_phase_a_current"]
                                        ?.value || "--"}{" "}
                                    A
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
