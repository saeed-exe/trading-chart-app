// src/components/ChartControls.tsx (updated with OHLC)
import React from 'react';
import styled from 'styled-components';
import { FiZoomIn, FiZoomOut, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

const ControlsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  align-items: center;
  height: 5rem;
  min-height: 5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.$active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 4px;
  padding: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.05)'};
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const Separator = styled.div`
  width: 1px;
  background-color: var(--border-color);
  margin: 0 0.5rem;
  height: 2rem;
`;

const OHLCContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-left: auto;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
`;

const OHLCItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
`;

const OHLCLabel = styled.span`
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const OHLCValue = styled.span<{ $type?: 'high' | 'low' }>`
  font-size: 0.85rem;
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: ${props =>
    props.$type === 'high' ? 'var(--success-color)' :
      props.$type === 'low' ? 'var(--danger-color)' :
        'var(--text-color)'
  };
`;

interface ChartControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleTrendLine: () => void;
  onReset: () => void;
  trendLineActive: boolean;
  ohlcData?: {
    open: number;
    high: number;
    low: number;
    close: number;
  } | null;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onToggleTrendLine,
  onReset,
  trendLineActive,
  ohlcData
}) => {
  return (
    <ControlsContainer>
      <ButtonGroup>
        <ControlButton onClick={onZoomIn} title="Zoom In">
          <FiZoomIn />
        </ControlButton>
        <ControlButton onClick={onZoomOut} title="Zoom Out">
          <FiZoomOut />
        </ControlButton>
      </ButtonGroup>

      <Separator />

      <ButtonGroup>
        <ControlButton
          onClick={onToggleTrendLine}
          $active={trendLineActive}
          title="Toggle Trend Line"
        >
          <FiTrendingUp />
        </ControlButton>
      </ButtonGroup>

      <Separator />

      <ButtonGroup>
        <ControlButton onClick={onReset} title="Reset View">
          <FiRefreshCw />
        </ControlButton>
      </ButtonGroup>

      {ohlcData && (
        <>
          <Separator />
          <OHLCContainer>
            <OHLCItem>
              <OHLCLabel>O</OHLCLabel>
              <OHLCValue>${ohlcData.open.toFixed(2)}</OHLCValue>
            </OHLCItem>
            <OHLCItem>
              <OHLCLabel>H</OHLCLabel>
              <OHLCValue $type="high">${ohlcData.high.toFixed(2)}</OHLCValue>
            </OHLCItem>
            <OHLCItem>
              <OHLCLabel>L</OHLCLabel>
              <OHLCValue $type="low">${ohlcData.low.toFixed(2)}</OHLCValue>
            </OHLCItem>
            <OHLCItem>
              <OHLCLabel>C</OHLCLabel>
              <OHLCValue>${ohlcData.close.toFixed(2)}</OHLCValue>
            </OHLCItem>
          </OHLCContainer>
        </>
      )}
    </ControlsContainer>
  );
};

export default ChartControls;