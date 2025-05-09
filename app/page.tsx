"use client";

import {
    Home,
    Thermometer,
    Droplet,
    Zap,
    DoorClosed,
    Lightbulb,
    Camera,
    Clock,
    Wind,
    AlertTriangle,
    BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { homeAssistant } from "@/lib/home-assistant";
import { useState, useEffect } from "react";

interface SensorData {
    displayName: string;
    value: string;
    unit: string;
    icon: string;
    lastUpdated: string;
}

export default function Dashboard() {
    const [lights, setLights] = useState<Record<string, boolean>>({});
    const [sensors, setSensors] = useState<Record<string, SensorData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sensor data
                const sensorResponse = await fetch("/api/sensors");
                const sensorData = await sensorResponse.json();
                setSensors(sensorData);

                // Update lights state from sensor data
                const lightStates = Object.entries(sensorData)
                    .filter(([entityId]) =>
                        entityId.startsWith("switch.lightswitch_")
                    )
                    .reduce(
                        (acc, [entityId, data]) => ({
                            ...acc,
                            [entityId]: data.value === "on",
                        }),
                        {}
                    );
                setLights(lightStates);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                    data.value === "on"
            ).length,
        };
    };

    // Helper function to get power data
    const getPowerData = () => {
        return {
            voltage: sensors["sensor.breaker_phase_a_voltage"]?.value
                ? `${sensors["sensor.breaker_phase_a_voltage"].value} ${sensors["sensor.breaker_phase_a_voltage"].unit}`
                : "--",
            current: sensors["sensor.breaker_phase_a_current"]?.value
                ? `${sensors["sensor.breaker_phase_a_current"].value} ${sensors["sensor.breaker_phase_a_current"].unit}`
                : "--",
            power: sensors["sensor.breaker_phase_a_power"]?.value
                ? `${sensors["sensor.breaker_phase_a_power"].value} ${sensors["sensor.breaker_phase_a_power"].unit}`
                : "--",
        };
    };

    // Helper function to get door status
    const getDoorStatus = (door: string) => {
        const doorKey = `binary_sensor.sensor_${door.toLowerCase()}_door_contact`;
        return {
            status: sensors[doorKey]?.value === "off" ? "Closed" : "Open",
            lastUpdated: sensors[doorKey]?.lastUpdated
                ? new Date(sensors[doorKey].lastUpdated).toLocaleString()
                : "--",
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Main Content */}
            <ScrollArea className="flex-1">
                <main className="p-4 pb-20">
                    {/* Status Overview */}
                    <section className="mb-6">
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardContent className="p-3 flex flex-col items-center justify-center">
                                    <Thermometer className="h-6 w-6 text-orange-400 mb-1" />
                                    <p className="text-xs text-gray-400">
                                        Avg. Temp
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {(
                                            Object.entries(sensors)
                                                .filter(
                                                    ([_, data]: [
                                                        string,
                                                        SensorData
                                                    ]) => data.unit === "°C"
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
                                                        parseFloat(data.value),
                                                    0
                                                ) /
                                            Object.entries(sensors).filter(
                                                ([_, data]: [
                                                    string,
                                                    SensorData
                                                ]) => data.unit === "°C"
                                            ).length
                                        ).toFixed(1) || "--"}
                                        °C
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gray-800 border-gray-700">
                                <CardContent className="p-3 flex flex-col items-center justify-center">
                                    <Droplet className="h-6 w-6 text-blue-400 mb-1" />
                                    <p className="text-xs text-gray-400">
                                        Avg. Humidity
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {(
                                            Object.entries(sensors)
                                                .filter(
                                                    ([key]) =>
                                                        key.includes(
                                                            "humidity"
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
                                                        parseFloat(data.value),
                                                    0
                                                ) /
                                            Object.keys(sensors).filter(
                                                (key) =>
                                                    key.includes("humidity") &&
                                                    key.includes(
                                                        "sensor.sensor_temperature_"
                                                    )
                                            ).length
                                        ).toFixed(2) || "--"}
                                        %
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gray-800 border-gray-700">
                                <CardContent className="p-3 flex flex-col items-center justify-center">
                                    <Zap className="h-6 w-6 text-yellow-400 mb-1" />
                                    <p className="text-xs text-gray-400">
                                        Power
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {sensors["sensor.breaker_phase_a_power"]
                                            ?.value
                                            ? `${sensors["sensor.breaker_phase_a_power"].value} ${sensors["sensor.breaker_phase_a_power"].unit}`
                                            : "--"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="mb-6">
                        <h2 className="text-lg font-medium mb-3">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-4 gap-3">
                            <Button
                                variant="outline"
                                className="flex flex-col h-auto py-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                            >
                                <Home className="h-5 w-5 mb-1" />
                                <span className="text-xs">Home</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col h-auto py-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                            >
                                <DoorClosed className="h-5 w-5 mb-1" />
                                <span className="text-xs">Away</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col h-auto py-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                            >
                                <Lightbulb className="h-5 w-5 mb-1" />
                                <span className="text-xs">All Off</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col h-auto py-3 bg-gray-800 border-gray-700 hover:bg-gray-700"
                            >
                                <AlertTriangle className="h-5 w-5 mb-1" />
                                <span className="text-xs">Alarm</span>
                            </Button>
                        </div>
                    </section>

                    {/* Tabs */}
                    <Tabs defaultValue="rooms" className="mb-6">
                        <TabsList className="grid grid-cols-5 bg-gray-800">
                            <TabsTrigger value="rooms">Rooms</TabsTrigger>
                            <TabsTrigger value="climate">Climate</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="energy">Energy</TabsTrigger>
                            <TabsTrigger value="scenes">Scenes</TabsTrigger>
                        </TabsList>

                        {/* Rooms Tab */}
                        <TabsContent value="rooms" className="mt-4">
                            <div className="grid gap-4">
                                <RoomCard
                                    name="Living Room"
                                    icon={<Home className="h-5 w-5" />}
                                    temperature={
                                        getRoomData("living").temperature
                                    }
                                    humidity={getRoomData("living").humidity}
                                    lights={getRoomData("living").lights}
                                    lightsOn={getRoomData("living").lightsOn}
                                    climate={false}
                                />
                                <RoomCard
                                    name="Bedroom"
                                    icon={<Home className="h-5 w-5" />}
                                    temperature={
                                        getRoomData("bedroom").temperature
                                    }
                                    humidity={getRoomData("bedroom").humidity}
                                    lights={getRoomData("bedroom").lights}
                                    lightsOn={getRoomData("bedroom").lightsOn}
                                    climate={true}
                                />
                                <RoomCard
                                    name="Kitchen"
                                    icon={<Home className="h-5 w-5" />}
                                    temperature={
                                        getRoomData("kitchen").temperature
                                    }
                                    humidity={getRoomData("kitchen").humidity}
                                    lights={getRoomData("kitchen").lights}
                                    lightsOn={getRoomData("kitchen").lightsOn}
                                    climate={false}
                                />
                                <RoomCard
                                    name="Office"
                                    icon={<Home className="h-5 w-5" />}
                                    temperature={
                                        getRoomData("office").temperature
                                    }
                                    humidity={getRoomData("office").humidity}
                                    lights={getRoomData("office").lights}
                                    lightsOn={getRoomData("office").lightsOn}
                                    climate={false}
                                />
                            </div>
                        </TabsContent>

                        {/* Climate Tab */}
                        <TabsContent value="climate" className="mt-4">
                            <div className="grid gap-4">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Wind className="h-5 w-5 text-blue-400" />
                                                <h3 className="font-medium">
                                                    AC Control
                                                </h3>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="bg-green-900/30 text-green-400 border-green-800"
                                            >
                                                Active
                                            </Badge>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-400">
                                                    Temperature
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {Object.entries(sensors)
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
                                                        ).length || "--"}
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

                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-400">
                                                    Fan Speed
                                                </span>
                                                <span className="text-sm font-medium">
                                                    Auto
                                                </span>
                                            </div>
                                            <ToggleGroup
                                                type="single"
                                                defaultValue="auto"
                                                className="justify-between"
                                            >
                                                <ToggleGroupItem
                                                    value="low"
                                                    className="flex-1 text-xs"
                                                >
                                                    Low
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="med"
                                                    className="flex-1 text-xs"
                                                >
                                                    Med
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="high"
                                                    className="flex-1 text-xs"
                                                >
                                                    High
                                                </ToggleGroupItem>
                                                <ToggleGroupItem
                                                    value="auto"
                                                    className="flex-1 text-xs"
                                                >
                                                    Auto
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>

                                        <div className="flex justify-between gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-gray-700 border-gray-600"
                                            >
                                                Off
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-blue-900/30 text-blue-400 border-blue-800"
                                            >
                                                Cool
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-gray-700 border-gray-600"
                                            >
                                                Heat
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-gray-700 border-gray-600"
                                            >
                                                Auto
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <h3 className="font-medium mb-4">
                                            Temperature & Humidity
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <TempHumidityCard
                                                room="Living"
                                                temp={
                                                    getRoomData("living")
                                                        .temperature
                                                }
                                                humidity={
                                                    getRoomData("living")
                                                        .humidity
                                                }
                                            />
                                            <TempHumidityCard
                                                room="Bedroom"
                                                temp={
                                                    getRoomData("bedroom")
                                                        .temperature
                                                }
                                                humidity={
                                                    getRoomData("bedroom")
                                                        .humidity
                                                }
                                            />
                                            <TempHumidityCard
                                                room="Kitchen"
                                                temp={
                                                    getRoomData("kitchen")
                                                        .temperature
                                                }
                                                humidity={
                                                    getRoomData("kitchen")
                                                        .humidity
                                                }
                                            />
                                            <TempHumidityCard
                                                room="Office"
                                                temp={
                                                    getRoomData("office")
                                                        .temperature
                                                }
                                                humidity={
                                                    getRoomData("office")
                                                        .humidity
                                                }
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="mt-4">
                            <div className="grid gap-4">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Camera className="h-5 w-5 text-blue-400" />
                                                <h3 className="font-medium">
                                                    Front Camera
                                                </h3>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="bg-green-900/30 text-green-400 border-green-800"
                                            >
                                                Online
                                            </Badge>
                                        </div>
                                        <div className="aspect-video bg-gray-900 rounded-md flex items-center justify-center mb-3">
                                            <div className="text-gray-500">
                                                Loading camera feed...
                                            </div>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 bg-gray-700 border-gray-600"
                                            >
                                                <Camera className="h-4 w-4 mr-1" />{" "}
                                                Live
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 bg-gray-700 border-gray-600"
                                            >
                                                <Clock className="h-4 w-4 mr-1" />{" "}
                                                History
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <h3 className="font-medium mb-4">
                                            Door Sensors
                                        </h3>
                                        <div className="grid gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <DoorClosed className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">
                                                            Lobby Door
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Last updated:{" "}
                                                            {sensors[
                                                                "binary_sensor.sensor_lobby_door_contact"
                                                            ]?.lastUpdated
                                                                ? new Date(
                                                                      sensors[
                                                                          "binary_sensor.sensor_lobby_door_contact"
                                                                      ].lastUpdated
                                                                  ).toLocaleString()
                                                                : "--"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`${
                                                        sensors[
                                                            "binary_sensor.sensor_lobby_door_contact"
                                                        ]?.value === "off"
                                                            ? "bg-green-900/30 text-green-400 border-green-800"
                                                            : "bg-red-900/30 text-red-400 border-red-800"
                                                    }`}
                                                >
                                                    {sensors[
                                                        "binary_sensor.sensor_lobby_door_contact"
                                                    ]?.value === "off"
                                                        ? "Closed"
                                                        : "Open"}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <DoorClosed className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">
                                                            Yard Door
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Last updated:{" "}
                                                            {sensors[
                                                                "binary_sensor.sensor_yard_door_contact"
                                                            ]?.lastUpdated
                                                                ? new Date(
                                                                      sensors[
                                                                          "binary_sensor.sensor_yard_door_contact"
                                                                      ].lastUpdated
                                                                  ).toLocaleString()
                                                                : "--"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`${
                                                        sensors[
                                                            "binary_sensor.sensor_yard_door_contact"
                                                        ]?.value === "off"
                                                            ? "bg-green-900/30 text-green-400 border-green-800"
                                                            : "bg-red-900/30 text-red-400 border-red-800"
                                                    }`}
                                                >
                                                    {sensors[
                                                        "binary_sensor.sensor_yard_door_contact"
                                                    ]?.value === "off"
                                                        ? "Closed"
                                                        : "Open"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Energy Tab */}
                        <TabsContent value="energy" className="mt-4">
                            <div className="grid gap-4">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium">
                                                Power Consumption
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-900/30 text-blue-400 border-blue-800"
                                            >
                                                {sensors[
                                                    "sensor.breaker_phase_a_power"
                                                ]?.value
                                                    ? `${sensors["sensor.breaker_phase_a_power"].value} ${sensors["sensor.breaker_phase_a_power"].unit}`
                                                    : "--"}
                                            </Badge>
                                        </div>

                                        <div className="h-40 bg-gray-900 rounded-md flex items-center justify-center mb-4">
                                            <BarChart3 className="h-20 w-20 text-gray-700" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-900 p-3 rounded-md">
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Voltage
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {sensors[
                                                        "sensor.breaker_phase_a_voltage"
                                                    ]?.value
                                                        ? `${sensors["sensor.breaker_phase_a_voltage"].value} ${sensors["sensor.breaker_phase_a_voltage"].unit}`
                                                        : "--"}
                                                </p>
                                            </div>
                                            <div className="bg-gray-900 p-3 rounded-md">
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Current
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {sensors[
                                                        "sensor.breaker_phase_a_current"
                                                    ]?.value
                                                        ? `${sensors["sensor.breaker_phase_a_current"].value} ${sensors["sensor.breaker_phase_a_current"].unit}`
                                                        : "--"}
                                                </p>
                                            </div>
                                            <div className="bg-gray-900 p-3 rounded-md">
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Daily Usage
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {sensors[
                                                        "sensor.breaker_phase_a_power"
                                                    ]?.value
                                                        ? `${(
                                                              parseFloat(
                                                                  sensors[
                                                                      "sensor.breaker_phase_a_power"
                                                                  ].value
                                                              ) * 24
                                                          ).toFixed(1)} kWh`
                                                        : "--"}
                                                </p>
                                            </div>
                                            <div className="bg-gray-900 p-3 rounded-md">
                                                <p className="text-xs text-gray-400 mb-1">
                                                    Monthly
                                                </p>
                                                <p className="text-lg font-semibold">
                                                    {sensors[
                                                        "sensor.breaker_phase_a_power"
                                                    ]?.value
                                                        ? `${(
                                                              parseFloat(
                                                                  sensors[
                                                                      "sensor.breaker_phase_a_power"
                                                                  ].value
                                                              ) *
                                                              24 *
                                                              30
                                                          ).toFixed(1)} kWh`
                                                        : "--"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Scenes Tab */}
                        <TabsContent value="scenes" className="mt-4">
                            <div className="grid gap-4">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="p-4">
                                        <h3 className="font-medium mb-4">
                                            Scenes
                                        </h3>
                                        <div className="grid gap-3">
                                            <Button className="justify-start bg-gradient-to-r from-blue-900 to-purple-900 hover:from-blue-800 hover:to-purple-800">
                                                <Home className="h-4 w-4 mr-2" />{" "}
                                                Good Morning
                                            </Button>
                                            <Button className="justify-start bg-gradient-to-r from-orange-900 to-red-900 hover:from-orange-800 hover:to-red-800">
                                                <Home className="h-4 w-4 mr-2" />{" "}
                                                Movie Night
                                            </Button>
                                            <Button className="justify-start bg-gradient-to-r from-indigo-900 to-blue-900 hover:from-indigo-800 hover:to-blue-800">
                                                <Home className="h-4 w-4 mr-2" />{" "}
                                                Good Night
                                            </Button>
                                            <Button className="justify-start bg-gradient-to-r from-green-900 to-teal-900 hover:from-green-800 hover:to-teal-800">
                                                <Home className="h-4 w-4 mr-2" />{" "}
                                                Away Mode
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="justify-start bg-gray-700 border-gray-600"
                                            >
                                                <Home className="h-4 w-4 mr-2" />{" "}
                                                Add New Scene
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Lights Section */}
                    <section className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-medium">Lights</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 bg-gray-800 border-gray-700"
                                onClick={async () => {
                                    try {
                                        await homeAssistant.callService({
                                            domain: "light",
                                            service: "turn_off",
                                            target: {
                                                entity_id: Object.keys(lights),
                                            },
                                        });
                                        setLights((prev) =>
                                            Object.fromEntries(
                                                Object.entries(prev).map(
                                                    ([id]) => [id, false]
                                                )
                                            )
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Failed to turn off all lights:",
                                            error
                                        );
                                    }
                                }}
                            >
                                All Off
                            </Button>
                        </div>
                        <div className="grid gap-3">
                            {Object.entries(lights).map(([entityId, isOn]) => (
                                <LightCard
                                    key={entityId}
                                    name={sensors[entityId].displayName}
                                    isOn={isOn}
                                    entityId={entityId}
                                    setLights={setLights}
                                    setSensors={setSensors}
                                />
                            ))}
                        </div>
                    </section>
                </main>
            </ScrollArea>
        </div>
    );
}

interface RoomCardProps {
    name: string;
    icon: React.ReactNode;
    temperature: string;
    humidity: string;
    lights: number;
    lightsOn: number;
    climate: boolean;
}

// Room Card Component
function RoomCard({
    name,
    icon,
    temperature,
    humidity,
    lights,
    lightsOn,
    climate,
}: RoomCardProps) {
    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="font-medium">{name}</h3>
                    </div>
                    <Badge
                        variant="outline"
                        className={`${
                            lightsOn > 0
                                ? "bg-amber-900/30 text-amber-400 border-amber-800"
                                : "bg-gray-900/80 text-gray-400 border-gray-700"
                        }`}
                    >
                        {lightsOn > 0 ? `${lightsOn}/${lights} On` : "All Off"}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-900 p-2 rounded-md flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-400" />
                        <span>{temperature}</span>
                    </div>
                    <div className="bg-gray-900 p-2 rounded-md flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-400" />
                        <span>{humidity}</span>
                    </div>
                </div>

                <div className="flex justify-between gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-gray-700 border-gray-600"
                    >
                        <Lightbulb className="h-4 w-4 mr-1" /> Lights
                    </Button>
                    {climate && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-gray-700 border-gray-600"
                        >
                            <Thermometer className="h-4 w-4 mr-1" /> Climate
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface TempHumidityCardProps {
    room: string;
    temp: string;
    humidity: string;
}

// Temperature & Humidity Card Component
function TempHumidityCard({ room, temp, humidity }: TempHumidityCardProps) {
    return (
        <div className="bg-gray-900 p-3 rounded-md">
            <p className="text-sm font-medium mb-2">{room}</p>
            <div className="flex items-center gap-2 mb-1">
                <Thermometer className="h-4 w-4 text-orange-400" />
                <span className="text-sm">{temp}</span>
            </div>
            <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{humidity}</span>
            </div>
        </div>
    );
}

interface LightCardProps {
    name: string;
    isOn: boolean;
    entityId: string;
    setLights: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    setSensors: React.Dispatch<
        React.SetStateAction<Record<string, SensorData>>
    >;
}

// Light Card Component
function LightCard({
    name,
    isOn,
    entityId,
    setLights,
    setSensors,
}: LightCardProps) {
    const [loading, setLoading] = useState(false);

    const toggleLight = async () => {
        try {
            setLoading(true);
            await homeAssistant.toggleEntity(entityId);
            const newState = !isOn; // Use the current isOn prop to determine new state
            setLights((prev: Record<string, boolean>) => ({
                ...prev,
                [entityId]: newState,
            }));
            // Update sensor data to reflect the new light state
            setSensors((prev) => ({
                ...prev,
                [entityId]: {
                    ...prev[entityId],
                    value: newState ? "on" : "off",
                    lastUpdated: new Date().toISOString(),
                },
            }));
        } catch (error) {
            console.error("Failed to toggle light:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-700">
            <div className="flex items-center gap-3">
                <Avatar
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isOn ? "bg-amber-500/20" : "bg-gray-700"
                    }`}
                >
                    <Lightbulb
                        className={`h-5 w-5 ${
                            isOn ? "text-amber-400" : "text-gray-500"
                        }`}
                    />
                </Avatar>
                <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-gray-400">
                        {isOn ? "On" : "Off"}
                    </p>
                </div>
            </div>
            <Switch
                checked={isOn}
                onCheckedChange={toggleLight}
                disabled={loading}
            />
        </div>
    );
}
