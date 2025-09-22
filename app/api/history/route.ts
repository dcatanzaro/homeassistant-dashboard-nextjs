import { NextResponse } from "next/server";

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    const hours = searchParams.get("hours") || "4"; // Default to 4 hours

    if (!entityId) {
        return NextResponse.json(
            { error: "entityId parameter is required" },
            { status: 400 }
        );
    }

    try {
        // Calculate start time (X hours ago)
        const hoursAgo = parseInt(hours);
        const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        const endTime = new Date();

        const response = await fetch(
            `${HA_URL}/api/history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`,
            {
                headers: {
                    Authorization: `Bearer ${HA_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Home Assistant API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Process the data to extract historical values
        const historicalData = [];
        if (data && data.length > 0 && data[0].length > 0) {
            const entityHistory = data[0]; // First entity (we're only querying one)

            // Filter and format the data points
            for (const point of entityHistory) {
                const value = parseFloat(point.state);
                // Only include numeric values (skip 'unavailable', 'unknown', etc.)
                if (!isNaN(value)) {
                    historicalData.push({
                        timestamp: new Date(point.last_updated).getTime(),
                        value: value,
                        state: point.state,
                        last_updated: point.last_updated,
                    });
                }
            }
        }

        return NextResponse.json({
            entityId,
            hours: hoursAgo,
            dataPoints: historicalData,
            count: historicalData.length,
        });
    } catch (error) {
        console.error("Failed to fetch historical data:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
