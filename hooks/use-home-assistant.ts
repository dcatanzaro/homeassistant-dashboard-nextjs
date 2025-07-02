import { useState, useEffect, useCallback } from "react";
import { homeAssistant } from "@/lib/home-assistant";
import { getSensorConfig } from "@/app/config/sensors";

interface HomeAssistantState {
    entity_id: string;
    state: string;
    attributes: Record<string, any>;
    last_changed: string;
    last_updated: string;
}

interface SensorData {
    displayName: string;
    value: string;
    unit: string;
    icon: string;
    lastUpdated: string;
}

export function useHomeAssistant() {
    const [states, setStates] = useState<Record<string, HomeAssistantState>>(
        {}
    );
    const [sensors, setSensors] = useState<Record<string, SensorData>>({});
    const [lights, setLights] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Convert Home Assistant state to sensor data format
    const convertStateToSensorData = useCallback(
        (state: HomeAssistantState): SensorData => {
            const attributes = state.attributes;
            const sensorConfig = getSensorConfig(state.entity_id);

            return {
                displayName: sensorConfig?.displayName || state.entity_id,
                value: state.state,
                unit: sensorConfig?.unit || "",
                icon: sensorConfig?.icon || "sensor",
                lastUpdated: state.last_updated,
            };
        },
        []
    );

    // Update states when new data comes in
    const updateState = useCallback(
        (newState: HomeAssistantState) => {
            setStates((prevStates) => ({
                ...prevStates,
                [newState.entity_id]: newState,
            }));

            // Update sensors if it's a sensor entity
            if (
                newState.entity_id.startsWith("sensor.") ||
                newState.entity_id.startsWith("binary_sensor.") ||
                newState.entity_id.startsWith("switch.") ||
                newState.entity_id.startsWith("light.")
            ) {
                setSensors((prevSensors) => ({
                    ...prevSensors,
                    [newState.entity_id]: convertStateToSensorData(newState),
                }));

                // Update lights state if it's a light or switch
                if (newState.entity_id.startsWith("switch.lightswitch_")) {
                    setLights((prevLights) => ({
                        ...prevLights,
                        [newState.entity_id]: newState.state === "on",
                    }));
                }
            }
        },
        [convertStateToSensorData]
    );

    // Initialize data and WebSocket connection
    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch initial states
                const initialStates = await homeAssistant.getStates();
                const statesMap: Record<string, HomeAssistantState> = {};
                const sensorsMap: Record<string, SensorData> = {};
                const lightsMap: Record<string, boolean> = {};

                initialStates.forEach((state) => {
                    statesMap[state.entity_id] = state;

                    if (
                        state.entity_id.startsWith("sensor.") ||
                        state.entity_id.startsWith("binary_sensor.") ||
                        state.entity_id.startsWith("switch.") ||
                        state.entity_id.startsWith("light.")
                    ) {
                        sensorsMap[state.entity_id] =
                            convertStateToSensorData(state);

                        if (state.entity_id.startsWith("switch.lightswitch_")) {
                            lightsMap[state.entity_id] = state.state === "on";
                        }
                    }
                });

                setStates(statesMap);
                setSensors(sensorsMap);
                setLights(lightsMap);

                // Connect to WebSocket for real-time updates
                await homeAssistant.connectWebSocket();
                setConnected(true);

                // Subscribe to state changes
                unsubscribe = homeAssistant.onStateChange(updateState);
            } catch (err) {
                console.error("Failed to initialize Home Assistant data:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to connect to Home Assistant"
                );
            } finally {
                setLoading(false);
            }
        };

        initializeData();

        // Cleanup on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            homeAssistant.disconnectWebSocket();
        };
    }, [updateState, convertStateToSensorData]);

    // Toggle light function
    const toggleLight = useCallback(async (entityId: string) => {
        try {
            await homeAssistant.toggleEntity(entityId);
            // The WebSocket will automatically update the state
        } catch (err) {
            console.error("Failed to toggle light:", err);
            setError(
                err instanceof Error ? err.message : "Failed to toggle light"
            );
        }
    }, []);

    // Call service function
    const callService = useCallback(
        async (
            domain: string,
            service: string,
            serviceData?: Record<string, any>
        ) => {
            try {
                await homeAssistant.callService({
                    domain,
                    service,
                    service_data: serviceData,
                });
                // The WebSocket will automatically update the state
            } catch (err) {
                console.error("Failed to call service:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to call service"
                );
            }
        },
        []
    );

    return {
        states,
        sensors,
        lights,
        loading,
        connected,
        error,
        toggleLight,
        callService,
        updateState,
    };
}
