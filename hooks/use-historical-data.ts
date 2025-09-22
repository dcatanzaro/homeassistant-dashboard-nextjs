import { useState, useEffect, useCallback } from "react";

interface HistoricalDataPoint {
    timestamp: number;
    value: number;
    state: string;
    last_updated: string;
}

interface HistoricalDataResponse {
    entityId: string;
    hours: number;
    dataPoints: HistoricalDataPoint[];
    count: number;
}

interface UseHistoricalDataOptions {
    entityId: string;
    hours?: number;
    refreshInterval?: number; // in milliseconds
    enabled?: boolean;
}

export function useHistoricalData({
    entityId,
    hours = 4,
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
}: UseHistoricalDataOptions) {
    const [data, setData] = useState<HistoricalDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistoricalData = useCallback(async () => {
        if (!enabled || !entityId) {
            return;
        }

        try {
            setError(null);
            const response = await fetch(
                `/api/history?entityId=${entityId}&hours=${hours}`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch historical data: ${response.statusText}`
                );
            }

            const result: HistoricalDataResponse = await response.json();
            setData(result.dataPoints);
        } catch (err) {
            console.error("Failed to fetch historical data:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [entityId, hours, enabled]);

    // Initial fetch
    useEffect(() => {
        fetchHistoricalData();
    }, [fetchHistoricalData]);

    // Set up refresh interval
    useEffect(() => {
        if (!enabled || !refreshInterval) {
            return;
        }

        const interval = setInterval(fetchHistoricalData, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchHistoricalData, refreshInterval, enabled]);

    // Manual refresh function
    const refresh = useCallback(() => {
        setLoading(true);
        fetchHistoricalData();
    }, [fetchHistoricalData]);

    return {
        data,
        loading,
        error,
        refresh,
    };
}
