"use client";

import { Thermometer, Droplet, Zap, PlugZap, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ElectricityMiniGraph } from "./electricity-mini-graph";
import { TemperatureHumidityMiniGraph } from "./temperature-humidity-mini-graph";

import { SensorData } from "@/types/dashboard";

interface QuickStatusCardsProps {
    sensors: Record<string, SensorData>;
}

export function QuickStatusCards({ sensors }: QuickStatusCardsProps) {
    return (
        <section className="mb-6">
            <div className="grid grid-cols-2 gap-3">
                {/* Temperature Card */}
                <Card className="w-full h-32 bg-[#18181b] rounded-lg flex items-start">
                    <CardContent className="flex p-2 w-full h-full">
                        <div className="flex items-center justify-center bg-orange-900/30 rounded-full h-8 w-12 mt-1 mr-3">
                            <Thermometer className="h-4 w-4 text-orange-400" />
                        </div>
                        <div className="flex flex-col items-start flex-1">
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
                            <div className="h-1" />
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
                        <div className="flex items-center justify-center">
                            <TemperatureHumidityMiniGraph
                                temperatureEntityIds={[
                                    "sensor.sensor_temperature_living_temperature",
                                    "sensor.sensor_temperature_bedroom_temperature",
                                    "sensor.sensor_temperature_kitchen_temperature",
                                    "sensor.sensor_temperature_office_temperature",
                                ]}
                                humidityEntityIds={[
                                    "sensor.sensor_temperature_living_humidity",
                                    "sensor.sensor_temperature_bedroom_humidity",
                                    "sensor.sensor_temperature_kitchen_humidity",
                                    "sensor.sensor_temperature_office_humidity",
                                ]}
                                currentTemperature={
                                    parseFloat(
                                        (
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
                                        ).toFixed(1)
                                    ) || 0
                                }
                                currentHumidity={
                                    parseFloat(
                                        (
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
                                        ).toFixed(1)
                                    ) || 0
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Power Card */}
                <Card className="w-full h-32 bg-[#18181b] rounded-lg flex items-start">
                    <CardContent className="flex p-2 w-full h-full">
                        <div className="flex items-center justify-center bg-blue-900/30 rounded-full h-8 w-12 mt-1 mr-3">
                            <Zap className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex flex-col items-start flex-1">
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
                            <div className="h-1" />
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                    <PlugZap className="h-3 w-3 text-blue-400" />
                                    <span className="font-bold text-white">
                                        {sensors[
                                            "sensor.breaker_phase_a_voltage"
                                        ]?.value || "--"}{" "}
                                        V
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Gauge className="h-3 w-3 text-blue-400" />
                                    <span className="font-bold text-white">
                                        {sensors[
                                            "sensor.breaker_phase_a_current"
                                        ]?.value || "--"}{" "}
                                        A
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <ElectricityMiniGraph
                                powerEntityId="sensor.breaker_phase_a_power"
                                currentEntityId="sensor.breaker_phase_a_current"
                                currentPowerValue={
                                    sensors["sensor.breaker_phase_a_power"]
                                        ?.value
                                        ? parseFloat(
                                              sensors[
                                                  "sensor.breaker_phase_a_power"
                                              ].value
                                          )
                                        : 0
                                }
                                currentCurrentValue={
                                    sensors["sensor.breaker_phase_a_current"]
                                        ?.value
                                        ? parseFloat(
                                              sensors[
                                                  "sensor.breaker_phase_a_current"
                                              ].value
                                          )
                                        : 0
                                }
                                powerUnit={
                                    sensors["sensor.breaker_phase_a_power"]
                                        ?.unit || "W"
                                }
                                currentUnit={
                                    sensors["sensor.breaker_phase_a_current"]
                                        ?.unit || "A"
                                }
                                showCurrent={false} // Set to false to show only power consumption
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
