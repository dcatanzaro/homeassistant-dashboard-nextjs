import { NextResponse } from "next/server";

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");

    try {
        const response = await fetch(
            `${HA_URL}/api/states${entityId ? `/${entityId}` : ""}`,
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
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { domain, service, service_data } = body;

        const response = await fetch(
            `${HA_URL}/api/services/${domain}/${service}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HA_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(service_data || {}),
            }
        );

        if (!response.ok) {
            throw new Error(`Home Assistant API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
