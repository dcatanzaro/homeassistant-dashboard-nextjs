"use client";

import React from "react";
import { useHistoricalData } from "@/hooks/use-historical-data";

interface ElectricityMiniGraphProps {
    powerEntityId: string;
    currentEntityId?: string;
    currentPowerValue: number;
    currentCurrentValue?: number;
    powerUnit: string;
    currentUnit?: string;
    showCurrent?: boolean;
}

export function ElectricityMiniGraph({
    powerEntityId,
    currentEntityId,
    currentPowerValue,
    currentCurrentValue = 0,
    powerUnit,
    currentUnit = "A",
    showCurrent = true,
}: ElectricityMiniGraphProps) {
    // Fetch historical data for power
    const {
        data: powerHistoricalData,
        loading: powerLoading,
        error: powerError,
    } = useHistoricalData({
        entityId: powerEntityId,
        hours: 1,
        refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    });

    // Fetch historical data for current (only if enabled and entityId provided)
    const {
        data: currentHistoricalData,
        loading: currentLoading,
        error: currentError,
    } = useHistoricalData({
        entityId: currentEntityId || "",
        hours: 1,
        refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
        enabled: showCurrent && !!currentEntityId,
    });

    // Process power historical data
    const powerDataPoints = React.useMemo(() => {
        if (powerLoading || powerError || powerHistoricalData.length === 0) {
            return [{ timestamp: Date.now(), value: currentPowerValue }];
        }

        return powerHistoricalData.map((point) => ({
            timestamp: point.timestamp,
            value: point.value,
        }));
    }, [powerHistoricalData, powerLoading, powerError, currentPowerValue]);

    // Process current historical data (only if enabled)
    const currentDataPoints = React.useMemo(() => {
        if (!showCurrent || !currentEntityId) {
            return [];
        }

        if (
            currentLoading ||
            currentError ||
            currentHistoricalData.length === 0
        ) {
            return [{ timestamp: Date.now(), value: currentCurrentValue }];
        }

        return currentHistoricalData.map((point) => ({
            timestamp: point.timestamp,
            value: point.value,
        }));
    }, [
        showCurrent,
        currentEntityId,
        currentHistoricalData,
        currentLoading,
        currentError,
        currentCurrentValue,
    ]);

    // Check loading and error states
    const loading = powerLoading || (showCurrent && currentLoading);
    const error = powerError || (showCurrent && currentError);

    // SVG dimensions
    const width = 220;
    const height = 80;
    const margin = { top: 5, right: 8, bottom: 15, left: 25 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Find min/max for scaling - power
    const powerValues = powerDataPoints.map((p) => p.value);
    const powerMinValue = Math.min(...powerValues);
    const powerMaxValue = Math.max(...powerValues);
    const powerValueRange = powerMaxValue - powerMinValue || 1;

    // Find min/max for scaling - current (only if enabled)
    const currentValues = currentDataPoints.map((p) => p.value);
    const currentMinValue =
        currentValues.length > 0 ? Math.min(...currentValues) : 0;
    const currentMaxValue =
        currentValues.length > 0 ? Math.max(...currentValues) : 1;
    const currentValueRange = currentMaxValue - currentMinValue || 1;

    // Generate SVG paths
    const powerPoints = powerDataPoints
        .map((point, index) => {
            const x =
                margin.left +
                (index / (powerDataPoints.length - 1)) * chartWidth;
            const y =
                margin.top +
                chartHeight -
                ((point.value - powerMinValue) / powerValueRange) * chartHeight;
            return `${x},${y}`;
        })
        .join(" ");

    const currentPoints =
        showCurrent && currentDataPoints.length > 0
            ? currentDataPoints
                  .map((point, index) => {
                      const x =
                          margin.left +
                          (index / (currentDataPoints.length - 1)) * chartWidth;
                      const y =
                          margin.top +
                          chartHeight -
                          ((point.value - currentMinValue) /
                              currentValueRange) *
                              chartHeight;
                      return `${x},${y}`;
                  })
                  .join(" ")
            : "";

    // Generate tick values for Y axis (power)
    const powerYTicks = [
        powerMinValue,
        powerMinValue + powerValueRange * 0.5,
        powerMaxValue,
    ];

    // Generate time labels for X axis based on data range
    const timeLabels = React.useMemo(() => {
        const allDataPoints = [...powerDataPoints, ...currentDataPoints];
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
    }, [powerDataPoints, currentDataPoints]);

    // Create gradients for the lines
    const powerGradientId = `power-gradient-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    const currentGradientId = `current-gradient-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    return (
        <div className="flex flex-col items-end">
            <svg width={width} height={height} className="mb-1">
                <defs>
                    <linearGradient
                        id={powerGradientId}
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
                    <linearGradient
                        id={currentGradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop
                            offset="0%"
                            stopColor="rgb(34, 197, 94)"
                            stopOpacity="0.5"
                        />
                        <stop
                            offset="100%"
                            stopColor="rgb(134, 239, 172)"
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

                {/* Y-axis ticks and labels (power) */}
                {powerYTicks.map((tick, index) => {
                    const y =
                        margin.top +
                        chartHeight -
                        ((tick - powerMinValue) / powerValueRange) *
                            chartHeight;
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
                                fill="rgb(59, 130, 246)"
                            >
                                {tick.toFixed(0)}
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
                {powerYTicks.slice(1, -1).map((tick, index) => {
                    const y =
                        margin.top +
                        chartHeight -
                        ((tick - powerMinValue) / powerValueRange) *
                            chartHeight;
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

                {/* Power line chart */}
                <polyline
                    fill="none"
                    stroke={
                        loading
                            ? "rgb(107, 114, 128)"
                            : error
                            ? "rgb(239, 68, 68)"
                            : `url(#${powerGradientId})`
                    }
                    strokeWidth="1.5"
                    points={powerPoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={loading ? "0.5" : "1"}
                />

                {/* Current line chart */}
                {showCurrent && currentPoints && (
                    <polyline
                        fill="none"
                        stroke={
                            loading
                                ? "rgb(107, 114, 128)"
                                : error
                                ? "rgb(239, 68, 68)"
                                : `url(#${currentGradientId})`
                        }
                        strokeWidth="1.5"
                        points={currentPoints}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="3,3"
                        opacity={loading ? "0.5" : "1"}
                    />
                )}

                {/* Power data points */}
                {powerDataPoints.map((point, index) => {
                    const x =
                        margin.left +
                        (index / (powerDataPoints.length - 1)) * chartWidth;
                    const y =
                        margin.top +
                        chartHeight -
                        ((point.value - powerMinValue) / powerValueRange) *
                            chartHeight;

                    const showDot =
                        index % 4 === 0 || index === powerDataPoints.length - 1;

                    if (!showDot) return null;

                    return (
                        <circle
                            key={`power-${index}`}
                            cx={x}
                            cy={y}
                            r={
                                index === powerDataPoints.length - 1
                                    ? "1.5"
                                    : "0.8"
                            }
                            fill={
                                index === powerDataPoints.length - 1
                                    ? "rgb(147, 197, 253)"
                                    : "rgb(59, 130, 246)"
                            }
                            opacity={
                                index === powerDataPoints.length - 1
                                    ? "1"
                                    : "0.8"
                            }
                        />
                    );
                })}

                {/* Current data points */}
                {showCurrent &&
                    currentDataPoints.map((point, index) => {
                        const x =
                            margin.left +
                            (index / (currentDataPoints.length - 1)) *
                                chartWidth;
                        const y =
                            margin.top +
                            chartHeight -
                            ((point.value - currentMinValue) /
                                currentValueRange) *
                                chartHeight;

                        const showDot =
                            index % 4 === 0 ||
                            index === currentDataPoints.length - 1;

                        if (!showDot) return null;

                        return (
                            <circle
                                key={`current-${index}`}
                                cx={x}
                                cy={y}
                                r={
                                    index === currentDataPoints.length - 1
                                        ? "1.5"
                                        : "0.8"
                                }
                                fill={
                                    index === currentDataPoints.length - 1
                                        ? "rgb(134, 239, 172)"
                                        : "rgb(34, 197, 94)"
                                }
                                opacity={
                                    index === currentDataPoints.length - 1
                                        ? "1"
                                        : "0.8"
                                }
                            />
                        );
                    })}

                {/* Legend */}
                <g>
                    <line
                        x1={width - 45}
                        y1={12}
                        x2={width - 35}
                        y2={12}
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="1.5"
                    />
                    <text
                        x={width - 33}
                        y={14}
                        fontSize="8"
                        fill="rgb(59, 130, 246)"
                    >
                        {powerUnit}
                    </text>
                    {showCurrent && (
                        <>
                            <line
                                x1={width - 45}
                                y1={22}
                                x2={width - 35}
                                y2={22}
                                stroke="rgb(34, 197, 94)"
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                            />
                            <text
                                x={width - 33}
                                y={24}
                                fontSize="8"
                                fill="rgb(34, 197, 94)"
                            >
                                {currentUnit}
                            </text>
                        </>
                    )}
                </g>
            </svg>
            <div className="text-[9px] text-gray-400 font-medium">
                {loading
                    ? "Loading..."
                    : error
                    ? "Data unavailable"
                    : powerDataPoints.length <= 1 &&
                      (!showCurrent || currentDataPoints.length <= 1)
                    ? "Current values"
                    : showCurrent
                    ? "Power & current trends"
                    : "Power consumption trend"}
            </div>
        </div>
    );
}
