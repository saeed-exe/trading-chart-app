// src/components/TradingChart.tsx (fixed version)
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { createChart } from 'lightweight-charts';
import type { CandleData } from '../utils/generateDummyData';

const ChartContainer = styled.div`
  height: 500px;
  width: 100%;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const ChartTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
`;

const TimeframeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TimeframeButton = styled.button<{ $active?: boolean }>`
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.$active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const CoordinatesInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  z-index: 100;
  pointer-events: none;
`;

interface TradingChartProps {
    data: CandleData[];
    trendLineActive: boolean;
    onTrendLineUpdated?: (start: { price: number; time: string } | null, end: { price: number; time: string } | null) => void;
    onPriceUpdate?: (ohlc: { open: number; high: number; low: number; close: number } | null) => void;
}

// Helper function to format time values
const formatTimeValue = (time: any): string => {
    if (typeof time === 'string') return time;

    // For BusinessDay objects
    if (typeof time === 'object' && 'day' in time) {
        return `${time.year}-${(time.month).toString().padStart(2, '0')}-${time.day.toString().padStart(2, '0')}`;
    }

    // For timestamp (number)
    if (typeof time === 'number') {
        const date = new Date(time * 1000); // Convert seconds to milliseconds
        return date.toISOString().split('T')[0];
    }

    return String(time);
};

const TradingChart = forwardRef<any, TradingChartProps>((props, ref) => {
    const { data, trendLineActive, onTrendLineUpdated, onPriceUpdate } = props;
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const [coordinates, setCoordinates] = useState<{ price: string; time: string } | null>(null);
    const chartRef = useRef<any>(null);
    const candleSeriesRef = useRef<any>(null);
    const trendLineSeriesRef = useRef<any>(null);
    const startMarkerSeriesRef = useRef<any>(null);
    const endMarkerSeriesRef = useRef<any>(null);
    const isDraggingRef = useRef(false);
    const trendLineStartRef = useRef<{ price: number; time: string } | null>(null);

    // Initialize and set up the chart
    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        // Clean up existing chart
        if (chartRef.current) {
            chartRef.current.remove();
        }

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight - 56, // Subtract header height
            layout: {
                background: { color: '#1e1e1e' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            crosshair: {
                mode: 1,
            },
        });

        // Add candlestick series
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#4caf50',
            downColor: '#f44336',
            borderVisible: false,
            wickUpColor: '#4caf50',
            wickDownColor: '#f44336',
        });

        // Format data for display
        const formattedData = data.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        }));

        candleSeries.setData(formattedData);

        // Add trend line series
        const trendLineSeries = chart.addLineSeries({
            color: '#2962ff',
            lineWidth: 2,
            lineStyle: 0,
        });

        // Add marker series for start and end points using line series with markers
        const startMarkerSeries = chart.addLineSeries({
            color: '#00ff00',
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 2,
            crosshairMarkerBorderColor: '#00ff00',
            crosshairMarkerBackgroundColor: '#00ff00',
        });

        const endMarkerSeries = chart.addLineSeries({
            color: '#ff0000',
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 2,
            crosshairMarkerBorderColor: '#ff0000',
            crosshairMarkerBackgroundColor: '#ff0000',
        });

        // Store references
        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        trendLineSeriesRef.current = trendLineSeries;
        startMarkerSeriesRef.current = startMarkerSeries;
        endMarkerSeriesRef.current = endMarkerSeries;

        // Subscribe to crosshair move to get coordinates and OHLC data
        chart.subscribeCrosshairMove(param => {
            if (!param.point || !param.time) {
                setCoordinates(null);
                if (onPriceUpdate) {
                    onPriceUpdate(null);
                }
                return;
            }

            const price = param.seriesPrices.get(candleSeries);
            if (price && 'close' in price) {
                const closePrice = price.close;
                const timeStr = formatTimeValue(param.time);

                setCoordinates({
                    price: closePrice.toFixed(2),
                    time: timeStr
                });

                // Find the OHLC data for the current time
                const currentData = data.find(d => d.time === timeStr);
                if (currentData && onPriceUpdate) {
                    onPriceUpdate({
                        open: currentData.open,
                        high: currentData.high,
                        low: currentData.low,
                        close: currentData.close
                    });
                }
            } else {
                setCoordinates(null);
                if (onPriceUpdate) {
                    onPriceUpdate(null);
                }
            }
        });

        // Fit content
        chart.timeScale().fitContent();

        // Handle window resize
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight - 56,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, onPriceUpdate]);

    // Set up trend line functionality
    useEffect(() => {
        if (!chartRef.current || !trendLineSeriesRef.current) return;

        // Clear trend line data when deactivated
        if (!trendLineActive) {
            trendLineSeriesRef.current.setData([]);
            startMarkerSeriesRef.current?.setData([]);
            endMarkerSeriesRef.current?.setData([]);
            if (onTrendLineUpdated) {
                onTrendLineUpdated(null, null);
            }
            // Re-enable chart interactions when deactivated
            chartRef.current.applyOptions({
                handleScroll: true,
                handleScale: true,
            });
            return;
        }

        // Disable chart interactions when trend line tool is active
        chartRef.current.applyOptions({
            handleScroll: false,
            handleScale: false,
        });

        // Helper function to convert coordinates to price and time
        const convertCoordinatesToPriceTime = (x: number, y: number) => {
            if (!chartRef.current || !chartContainerRef.current || !candleSeriesRef.current) return null;

            try {
                // Get time from x coordinate using the chart's coordinate system
                const timeCoordinate = chartRef.current.timeScale().coordinateToTime(x);
                if (!timeCoordinate) return null;

                // Convert y coordinate to price using the candlestick series
                const price = candleSeriesRef.current.coordinateToPrice(y);
                if (price === null || price === undefined) return null;

                return {
                    time: timeCoordinate,
                    timeStr: formatTimeValue(timeCoordinate),
                    price: price
                };
            } catch (error) {
                console.error("Error converting coordinates:", error);
                return null;
            }
        };

        // Add mouse handlers for trend line drawing
        const handleMouseDown = (e: MouseEvent) => {
            if (!trendLineActive || !chartContainerRef.current || !chartRef.current) return;

            const rect = chartContainerRef.current.getBoundingClientRect();
            const clickY = e.clientY - rect.top;

            // Skip if clicking on header
            if (clickY <= 56) return;

            console.log("Trend line mousedown triggered");

            // Prevent default chart behavior
            e.preventDefault();
            e.stopPropagation();

            isDraggingRef.current = true;

            const x = e.clientX - rect.left;
            const y = clickY - 56; // Subtract header height

            const coordinates = convertCoordinatesToPriceTime(x, y);
            if (!coordinates) {
                console.log("Failed to convert coordinates");
                return;
            }

            console.log("Starting trend line at:", coordinates);

            trendLineStartRef.current = {
                price: coordinates.price,
                time: coordinates.timeStr
            };

            // Clear existing markers and trend line
            trendLineSeriesRef.current.setData([]);
            startMarkerSeriesRef.current.setData([]);
            endMarkerSeriesRef.current.setData([]);

            // Add start marker
            startMarkerSeriesRef.current.setData([
                { time: coordinates.time, value: coordinates.price }
            ]);

            // Initialize trend line with start point
            trendLineSeriesRef.current.setData([
                { time: coordinates.time, value: coordinates.price }
            ]);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !trendLineActive || !chartContainerRef.current || !chartRef.current || !trendLineStartRef.current) return;

            const rect = chartContainerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top - 56; // Subtract header height

            const coordinates = convertCoordinatesToPriceTime(x, y);
            if (!coordinates) return;

            // Sort the points by time to allow drawing in both directions
            const startTime = new Date(trendLineStartRef.current.time).getTime();
            const endTime = new Date(coordinates.timeStr).getTime();

            let trendLineData;
            if (startTime <= endTime) {
                // Normal direction: start to end
                trendLineData = [
                    { time: trendLineStartRef.current.time, value: trendLineStartRef.current.price },
                    { time: coordinates.time, value: coordinates.price }
                ];
            } else {
                // Reverse direction: end to start
                trendLineData = [
                    { time: coordinates.time, value: coordinates.price },
                    { time: trendLineStartRef.current.time, value: trendLineStartRef.current.price }
                ];
            }

            // Update trend line
            trendLineSeriesRef.current.setData(trendLineData);

            // Update end marker
            endMarkerSeriesRef.current.setData([
                { time: coordinates.time, value: coordinates.price }
            ]);

            // Update callback with coordinates (always pass start as first parameter)
            if (onTrendLineUpdated) {
                onTrendLineUpdated(
                    { price: trendLineStartRef.current.price, time: trendLineStartRef.current.time },
                    { price: coordinates.price, time: coordinates.timeStr }
                );
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (isDraggingRef.current) {
                console.log("Trend line drawing completed");
                e.preventDefault();
                e.stopPropagation();
            }
            isDraggingRef.current = false;
        };

        // Add event listeners with capture to intercept before chart handles them
        const element = chartContainerRef.current;
        if (element) {
            element.addEventListener('mousedown', handleMouseDown, { capture: true, passive: false });
            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp, { passive: false });
        }

        return () => {
            // Re-enable chart interactions when trend line tool is deactivated
            if (chartRef.current) {
                chartRef.current.applyOptions({
                    handleScroll: true,
                    handleScale: true,
                });
            }

            if (element) {
                element.removeEventListener('mousedown', handleMouseDown, { capture: true });
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [trendLineActive, data, onTrendLineUpdated]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        zoomIn: () => {
            if (!chartRef.current) return;

            try {
                const timeScale = chartRef.current.timeScale();
                const range = timeScale.getVisibleLogicalRange();
                if (!range) return;

                const newRange = {
                    from: range.from + Math.round((range.to - range.from) * 0.2),
                    to: range.to - Math.round((range.to - range.from) * 0.2)
                };

                timeScale.setVisibleLogicalRange(newRange);
            } catch (error) {
                console.error("Error zooming in:", error);
            }
        },
        zoomOut: () => {
            if (!chartRef.current) return;

            try {
                const timeScale = chartRef.current.timeScale();
                const range = timeScale.getVisibleLogicalRange();
                if (!range) return;

                const newRange = {
                    from: range.from - Math.round((range.to - range.from) * 0.2),
                    to: range.to + Math.round((range.to - range.from) * 0.2)
                };

                timeScale.setVisibleLogicalRange(newRange);
            } catch (error) {
                console.error("Error zooming out:", error);
            }
        },
        resetView: () => {
            if (!chartRef.current) return;
            chartRef.current.timeScale().fitContent();
            if (trendLineSeriesRef.current) {
                trendLineSeriesRef.current.setData([]);
            }
            if (startMarkerSeriesRef.current) {
                startMarkerSeriesRef.current.setData([]);
            }
            if (endMarkerSeriesRef.current) {
                endMarkerSeriesRef.current.setData([]);
            }
            if (onTrendLineUpdated) {
                onTrendLineUpdated(null, null);
            }
        }
    }));

    return (
        <div style={{ position: 'relative' }}>
            <ChartContainer ref={chartContainerRef}>
                <ChartHeader>
                    <ChartTitle>BTC/USD</ChartTitle>
                    <TimeframeSelector>
                        <TimeframeButton
                            $active={activeTimeframe === '1H'}
                            onClick={() => setActiveTimeframe('1H')}
                        >
                            1H
                        </TimeframeButton>
                        <TimeframeButton
                            $active={activeTimeframe === '4H'}
                            onClick={() => setActiveTimeframe('4H')}
                        >
                            4H
                        </TimeframeButton>
                        <TimeframeButton
                            $active={activeTimeframe === '1D'}
                            onClick={() => setActiveTimeframe('1D')}
                        >
                            1D
                        </TimeframeButton>
                        <TimeframeButton
                            $active={activeTimeframe === '1W'}
                            onClick={() => setActiveTimeframe('1W')}
                        >
                            1W
                        </TimeframeButton>
                    </TimeframeSelector>
                </ChartHeader>
            </ChartContainer>

            {coordinates && (
                <CoordinatesInfo>
                    Price: ${coordinates.price} | Time: {coordinates.time}
                </CoordinatesInfo>
            )}
        </div>
    );
});

export default TradingChart;