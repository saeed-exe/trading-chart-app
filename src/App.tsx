// src/App.tsx (fixed version)
import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useChartData } from './hooks/useChartData';
import TradingChart from './components/TradingChart';
import ChartControls from './components/ChartControls';
import TrendLine from './components/TrendLine';
import { GlobalStyles } from './styles/GlobalStyles';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const ChartSection = styled.section`
  margin-top: 1rem;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

function App() {
  const { data, loading } = useChartData(150);
  const [trendLineActive, setTrendLineActive] = useState(false);
  const [trendLineData, setTrendLineData] = useState<{
    start: { price: number; time: string } | null;
    end: { price: number; time: string } | null;
  }>({
    start: null,
    end: null
  });
  const [ohlcData, setOhlcData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  const chartRef = useRef<any>(null);

  const handleZoomIn = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.zoomOut();
    }
  }, []);

  const handleToggleTrendLine = useCallback(() => {
    setTrendLineActive(prev => !prev);
    // Clear trend line data when deactivating
    if (trendLineActive) {
      setTrendLineData({ start: null, end: null });
    }
  }, [trendLineActive]);

  const handleReset = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.resetView();
    }
    setTrendLineData({ start: null, end: null });
  }, []);

  const handleTrendLineUpdated = useCallback((
    start: { price: number; time: string } | null,
    end: { price: number; time: string } | null
  ) => {
    setTrendLineData({ start, end });
  }, []);

  const handlePriceUpdate = useCallback((
    ohlc: { open: number; high: number; low: number; close: number } | null
  ) => {
    setOhlcData(ohlc);
  }, []);

  return (
    <AppContainer>
      <GlobalStyles />

      <MainContent>
        <h1>Trading Chart</h1>

        <ChartSection>
          <ChartControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleTrendLine={handleToggleTrendLine}
            onReset={handleReset}
            trendLineActive={trendLineActive}
            ohlcData={ohlcData}
          />

          {loading ? (
            <LoadingIndicator>Loading chart data...</LoadingIndicator>
          ) : (
            <TradingChart
              ref={chartRef}
              data={data}
              trendLineActive={trendLineActive}
              onTrendLineUpdated={handleTrendLineUpdated}
              onPriceUpdate={handlePriceUpdate}
            />
          )}

          <TrendLine
            startPoint={trendLineData.start}
            endPoint={trendLineData.end}
            visible={trendLineActive && trendLineData.start !== null && trendLineData.end !== null}
          />
        </ChartSection>
      </MainContent>
    </AppContainer>
  );
}

export default App;