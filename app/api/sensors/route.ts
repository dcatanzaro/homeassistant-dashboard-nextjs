import { NextResponse } from "next/server";
import { homeAssistant } from "@/lib/home-assistant";
import { sensorConfigs, SensorConfig } from "@/app/config/sensors";

export async function GET() {
    try {
        const states = await homeAssistant.getStates();

        const sensorData = states
            .filter((state) =>
                sensorConfigs.some(
                    (config) => config.entityId === state.entity_id
                )
            )
            .reduce((acc, state) => {
                const config = sensorConfigs.find(
                    (config) => config.entityId === state.entity_id
                );
                acc[state.entity_id] = {
                    displayName: config?.displayName || state.entity_id,
                    value: state.state,
                    unit: config?.unit || "",
                    icon: config?.icon || "thermometer",
                    lastUpdated: state.last_updated,
                };
                return acc;
            }, {} as Record<string, any>);

        return NextResponse.json(sensorData);
    } catch (error) {
        console.error("Failed to fetch sensor data:", error);
        return NextResponse.json(
            { error: "Failed to fetch sensor data" },
            { status: 500 }
        );
    }
}
