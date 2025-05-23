// src/components/TrendLine.tsx (updated)
import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp } from 'react-icons/fi';

const CoordinatesBox = styled.div`
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CoordinateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const CoordinateItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
`;

const Value = styled.span`
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
`;

const MarkerInfo = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
`;

const MarkerLabel = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const MarkerLegend = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const MarkerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
`;

const MarkerDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

interface TrendLineProps {
  startPoint: { price: number; time: string } | null;
  endPoint: { price: number; time: string } | null;
  visible: boolean;
}

const TrendLine: React.FC<TrendLineProps> = ({ startPoint, endPoint, visible }) => {
  if (!visible || !startPoint || !endPoint) {
    return null;
  }

  const priceDifference = endPoint.price - startPoint.price;
  const percentChange = (priceDifference / startPoint.price) * 100;

  // Determine which point comes first chronologically
  const startDate = new Date(startPoint.time);
  const endDate = new Date(endPoint.time);
  const isReversed = startDate > endDate;

  const chronologicalStart = isReversed ? endPoint : startPoint;
  const chronologicalEnd = isReversed ? startPoint : endPoint;

  return (
    <CoordinatesBox>
      <Title><FiTrendingUp /> Trend Line Analysis</Title>
      <CoordinateGrid>
        <CoordinateItem>
          <Label>Start Price</Label>
          <Value>${startPoint.price.toFixed(2)}</Value>
        </CoordinateItem>
        <CoordinateItem>
          <Label>End Price</Label>
          <Value>${endPoint.price.toFixed(2)}</Value>
        </CoordinateItem>
        <CoordinateItem>
          <Label>Start Time</Label>
          <Value>{startPoint.time}</Value>
        </CoordinateItem>
        <CoordinateItem>
          <Label>End Time</Label>
          <Value>{endPoint.time}</Value>
        </CoordinateItem>
        <CoordinateItem>
          <Label>Price Change</Label>
          <Value style={{ color: priceDifference >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {priceDifference >= 0 ? '+' : ''}{priceDifference.toFixed(2)} ({percentChange.toFixed(2)}%)
          </Value>
        </CoordinateItem>
        <CoordinateItem>
          <Label>Direction</Label>
          <Value>{isReversed ? 'Backward (End → Start)' : 'Forward (Start → End)'}</Value>
        </CoordinateItem>
      </CoordinateGrid>

      <MarkerInfo>
        <MarkerLabel>Chart Markers:</MarkerLabel>
        <MarkerLegend>
          <MarkerItem>
            <MarkerDot color="#00ff00" />
            <span>Start Point ({chronologicalStart.time})</span>
          </MarkerItem>
          <MarkerItem>
            <MarkerDot color="#ff0000" />
            <span>End Point ({chronologicalEnd.time})</span>
          </MarkerItem>
        </MarkerLegend>
      </MarkerInfo>
    </CoordinatesBox>
  );
};

export default TrendLine;