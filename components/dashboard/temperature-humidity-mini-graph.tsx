"use client";

import React from "react";
import { useHistoricalData } from "@/hooks/use-historical-data";

interface TemperatureHumidityMiniGraphProps {
    temperatureEntityIds: string[];
    humidityEntityIds: string[];
    currentTemperature: number;
    currentHumidity: number;
}

export function TemperatureHumidityMiniGraph({
    temperatureEntityIds,
    humidityEntityIds,
    currentTemperature,
    currentHumidity,
}: TemperatureHumidityMiniGraphProps) {
    // Fetch historical data for all temperature sensors
    const temperatureDataQueries = temperatureEntityIds.map((entityId) =>
        useHistoricalData({
            entityId,
            hours: 12,
            refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
        })
    );

    // Fetch historical data for all humidity sensors
    const humidityDataQueries = humidityEntityIds.map((entityId) =>
        useHistoricalData({
            entityId,
            hours: 12,
            refreshInterval: 5 * 60 * 1000,
        })
    );

    // Process temperature historical data
    const temperatureDataPoints = React.useMemo(() => {
        const allTemperatureData = temperatureDataQueries
            .map((query) => query.data)
            .flat();

        if (allTemperatureData.length === 0) {
            return [{ timestamp: Date.now(), value: currentTemperature }];
        }

        // Group by timestamp and calculate averages
        const timestampGroups: Record<number, number[]> = {};

        allTemperatureData.forEach((point) => {
            const timestamp =
                Math.floor(point.timestamp / (10 * 60 * 1000)) *
                (10 * 60 * 1000); // Round to 10-minute intervals
            if (!timestampGroups[timestamp]) {
                timestampGroups[timestamp] = [];
            }
            timestampGroups[timestamp].push(point.value);
        });

        const averagedData = Object.entries(timestampGroups)
            .map(([timestamp, values]) => ({
                timestamp: parseInt(timestamp),
                value:
                    values.reduce((sum, val) => sum + val, 0) / values.length,
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

        return averagedData.length > 0
            ? averagedData
            : [{ timestamp: Date.now(), value: currentTemperature }];
    }, [temperatureDataQueries, currentTemperature]);

    // Process humidity historical data
    const humidityDataPoints = React.useMemo(() => {
        const allHumidityData = humidityDataQueries
            .map((query) => query.data)
            .flat();

        if (allHumidityData.length === 0) {
            return [{ timestamp: Date.now(), value: currentHumidity }];
        }

        // Group by timestamp and calculate averages
        const timestampGroups: Record<number, number[]> = {};

        allHumidityData.forEach((point) => {
            const timestamp =
                Math.floor(point.timestamp / (10 * 60 * 1000)) *
                (10 * 60 * 1000); // Round to 10-minute intervals
            if (!timestampGroups[timestamp]) {
                timestampGroups[timestamp] = [];
            }
            timestampGroups[timestamp].push(point.value);
        });

        const averagedData = Object.entries(timestampGroups)
            .map(([timestamp, values]) => ({
                timestamp: parseInt(timestamp),
                value:
                    values.reduce((sum, val) => sum + val, 0) / values.length,
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

        return averagedData.length > 0
            ? averagedData
            : [{ timestamp: Date.now(), value: currentHumidity }];
    }, [humidityDataQueries, currentHumidity]);

    // Check loading state
    const loading =
        temperatureDataQueries.some((q) => q.loading) ||
        humidityDataQueries.some((q) => q.loading);
    const error =
        temperatureDataQueries.some((q) => q.error) ||
        humidityDataQueries.some((q) => q.error);

    // SVG dimensions
    const width = 220;
    const height = 80;
    const margin = { top: 5, right: 8, bottom: 15, left: 25 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Find min/max for scaling - temperature
    const tempValues = temperatureDataPoints.map((p) => p.value);
    const tempMinValue = Math.min(...tempValues);
    const tempMaxValue = Math.max(...tempValues);
    const tempValueRange = tempMaxValue - tempMinValue || 1;

    // Find min/max for scaling - humidity
    const humidityValues = humidityDataPoints.map((p) => p.value);
    const humidityMinValue = Math.min(...humidityValues);
    const humidityMaxValue = Math.max(...humidityValues);
    const humidityValueRange = humidityMaxValue - humidityMinValue || 1;

    // Generate SVG paths
    const tempPoints = temperatureDataPoints
        .map((point, index) => {
            const x =
                margin.left +
                (index / (temperatureDataPoints.length - 1)) * chartWidth;
            const y =
                margin.top +
                chartHeight -
                ((point.value - tempMinValue) / tempValueRange) * chartHeight;
            return `${x},${y}`;
        })
        .join(" ");

    const humidityPoints = humidityDataPoints
        .map((point, index) => {
            const x =
                margin.left +
                (index / (humidityDataPoints.length - 1)) * chartWidth;
            const y =
                margin.top +
                chartHeight -
                ((point.value - humidityMinValue) / humidityValueRange) *
                    chartHeight;
            return `${x},${y}`;
        })
        .join(" ");

    // Generate tick values for Y axis (temperature)
    const tempYTicks = [
        tempMinValue,
        tempMinValue + tempValueRange * 0.5,
        tempMaxValue,
    ];

    // Generate time labels for X axis
    const timeLabels = React.useMemo(() => {
        const allDataPoints = [...temperatureDataPoints, ...humidityDataPoints];
        if (allDataPoints.length <= 1) {
            return ["now"];
        }

        const oldestTimestamp = Math.min(
            ...allDataPoints.map((p) => p.timestamp)
        );
        const newestTimestamp = Math.max(
            ...allDataPoints.map((p) => p.timestamp)
        );
        const timeRangeHours =
            (newestTimestamp - oldestTimestamp) / (1000 * 60 * 60);

        if (timeRangeHours >= 3) {
            return ["4h", "2h", "now"];
        } else if (timeRangeHours >= 1) {
            return ["2h", "1h", "now"];
        } else {
            return ["1h", "30m", "now"];
        }
    }, [temperatureDataPoints, humidityDataPoints]);

    // Create gradients for the lines
    const tempGradientId = `temp-gradient-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    const humidityGradientId = `humidity-gradient-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    return (
        <div className="flex flex-col items-end">
            <svg width={width} height={height} className="mb-1">
                <defs>
                    <linearGradient
                        id={tempGradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop
                            offset="0%"
                            stopColor="rgb(251, 146, 60)"
                            stopOpacity="0.5"
                        />
                        <stop
                            offset="100%"
                            stopColor="rgb(253, 186, 116)"
                            stopOpacity="0.8"
                        />
                    </linearGradient>
                    <linearGradient
                        id={humidityGradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop
                            offset="0%"
                            stopColor="rgb(59, 130, 246)"
                            stopOpacity="0.5"
                        />
                        <stop
                            offset="100%"
                            stopColor="rgb(147, 197, 253)"
                            stopOpacity="0.8"
                        />
                    </linearGradient>
                </defs>

                {/* X-axis */}
                <line
                    x1={margin.left}
                    y1={height - margin.bottom}
                    x2={width - margin.right}
                    y2={height - margin.bottom}
                    stroke="rgb(75, 85, 99)"
                    strokeWidth="0.5"
                />

                {/* Y-axis */}
                <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={height - margin.bottom}
                    stroke="rgb(75, 85, 99)"
                    strokeWidth="0.5"
                />

                {/* Y-axis ticks and labels (temperature) */}
                {tempYTicks.map((tick, index) => {
                    const y =
                        margin.top +
                        chartHeight -
                        ((tick - tempMinValue) / tempValueRange) * chartHeight;
                    return (
                        <g key={index}>
                            <line
                                x1={margin.left - 2}
                                y1={y}
                                x2={margin.left}
                                y2={y}
                                stroke="rgb(75, 85, 99)"
                                strokeWidth="0.5"
                            />
                            <text
                                x={margin.left - 4}
                                y={y + 1}
                                textAnchor="end"
                                fontSize="6"
                                fill="rgb(251, 146, 60)"
                            >
                                {tick.toFixed(0)}°
                            </text>
                        </g>
                    );
                })}

                {/* X-axis ticks and labels */}
                {timeLabels.map((label, index) => {
                    const x =
                        margin.left +
                        (index / (timeLabels.length - 1)) * chartWidth;
                    return (
                        <g key={index}>
                            <line
                                x1={x}
                                y1={height - margin.bottom}
                                x2={x}
                                y2={height - margin.bottom + 2}
                                stroke="rgb(75, 85, 99)"
                                strokeWidth="0.5"
                            />
                            <text
                                x={x}
                                y={height - margin.bottom + 8}
                                textAnchor="middle"
                                fontSize="6"
                                fill="rgb(156, 163, 175)"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}

                {/* Grid lines */}
                {tempYTicks.slice(1, -1).map((tick, index) => {
                    const y =
                        margin.top +
                        chartHeight -
                        ((tick - tempMinValue) / tempValueRange) * chartHeight;
                    return (
                        <line
                            key={index}
                            x1={margin.left}
                            y1={y}
                            x2={width - margin.right}
                            y2={y}
                            stroke="rgb(55, 65, 81)"
                            strokeWidth="0.3"
                            strokeDasharray="1,1"
                        />
                    );
                })}

                {/* Temperature line chart */}
                <polyline
                    fill="none"
                    stroke={
                        loading
                            ? "rgb(107, 114, 128)"
                            : error
                            ? "rgb(239, 68, 68)"
                            : `url(#${tempGradientId})`
                    }
                    strokeWidth="1.5"
                    points={tempPoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={loading ? "0.5" : "1"}
                />

                {/* Humidity line chart */}
                <polyline
                    fill="none"
                    stroke={
                        loading
                            ? "rgb(107, 114, 128)"
                            : error
                            ? "rgb(239, 68, 68)"
                            : `url(#${humidityGradientId})`
                    }
                    strokeWidth="1.5"
                    points={humidityPoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={loading ? "0.5" : "1"}
                    strokeDasharray="3,3"
                />

                {/* Temperature data points */}
                {temperatureDataPoints.map((point, index) => {
                    const x =
                        margin.left +
                        (index / (temperatureDataPoints.length - 1)) *
                            chartWidth;
                    const y =
                        margin.top +
                        chartHeight -
                        ((point.value - tempMinValue) / tempValueRange) *
                            chartHeight;

                    const showDot =
                        index % 4 === 0 ||
                        index === temperatureDataPoints.length - 1;
                    if (!showDot) return null;

                    return (
                        <circle
                            key={`temp-${index}`}
                            cx={x}
                            cy={y}
                            r={
                                index === temperatureDataPoints.length - 1
                                    ? "1.5"
                                    : "0.8"
                            }
                            fill={
                                index === temperatureDataPoints.length - 1
                                    ? "rgb(253, 186, 116)"
                                    : "rgb(251, 146, 60)"
                            }
                            opacity={
                                index === temperatureDataPoints.length - 1
                                    ? "1"
                                    : "0.8"
                            }
                        />
                    );
                })}

                {/* Humidity data points */}
                {humidityDataPoints.map((point, index) => {
                    const x =
                        margin.left +
                        (index / (humidityDataPoints.length - 1)) * chartWidth;
                    const y =
                        margin.top +
                        chartHeight -
                        ((point.value - humidityMinValue) /
                            humidityValueRange) *
                            chartHeight;

                    const showDot =
                        index % 4 === 0 ||
                        index === humidityDataPoints.length - 1;
                    if (!showDot) return null;

                    return (
                        <circle
                            key={`humidity-${index}`}
                            cx={x}
                            cy={y}
                            r={
                                index === humidityDataPoints.length - 1
                                    ? "1.5"
                                    : "0.8"
                            }
                            fill={
                                index === humidityDataPoints.length - 1
                                    ? "rgb(147, 197, 253)"
                                    : "rgb(59, 130, 246)"
                            }
                            opacity={
                                index === humidityDataPoints.length - 1
                                    ? "1"
                                    : "0.8"
                            }
                        />
                    );
                })}

                {/* Legend */}
                <g>
                    <line
                        x1={width - 40}
                        y1={12}
                        x2={width - 30}
                        y2={12}
                        stroke="rgb(251, 146, 60)"
                        strokeWidth="1.5"
                    />
                    <text
                        x={width - 28}
                        y={14}
                        fontSize="8"
                        fill="rgb(251, 146, 60)"
                    >
                        °C
                    </text>
                    <line
                        x1={width - 40}
                        y1={22}
                        x2={width - 30}
                        y2={22}
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                    />
                    <text
                        x={width - 28}
                        y={24}
                        fontSize="8"
                        fill="rgb(59, 130, 246)"
                    >
                        %
                    </text>
                </g>
            </svg>
            <div className="text-[9px] text-gray-400 font-medium">
                {loading
                    ? "Loading..."
                    : error
                    ? "Data unavailable"
                    : temperatureDataPoints.length <= 1 &&
                      humidityDataPoints.length <= 1
                    ? "Current values"
                    : "Temp & humidity trends"}
            </div>
        </div>
    );
}
