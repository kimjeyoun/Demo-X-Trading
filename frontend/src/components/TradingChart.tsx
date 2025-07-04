// frontend/src/components/TradingChart.tsx
// lightweight-charts v4.1.0 기준

import {
  createChart,
  ColorType,
  type CandlestickData,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { socket } from '../services/socket';
import debounce from 'lodash.debounce';

interface BinanceKlineData {
  k: {
    t: number; o: string; h: string; l: string; c: string;
  };
}

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export const TradingChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2b2b43' },
        horzLines: { color: '#2b2b43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });
    chart.timeScale().fitContent();

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const handleKlineData = (kline: BinanceKlineData) => {
      const candleData: CandlestickData = {
        time: (kline.k.t / 1000) as UTCTimestamp,
        open: parseFloat(kline.k.o),
        high: parseFloat(kline.k.h),
        low: parseFloat(kline.k.l),
        close: parseFloat(kline.k.c),
      };
      candlestickSeries.update(candleData);
    };

    socket.connect();
    socket.on('kline', handleKlineData);

    const handleResize = debounce(() => {
    if (chartContainerRef.current) {
      chart.resize(
        chartContainerRef.current.clientWidth,
        chartContainerRef.current.clientHeight,
      );
    }
  }, 100);

  window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('kline', handleKlineData);
      socket.disconnect();
      chart.remove();
    };
  }, []);

  return <ChartWrapper ref={chartContainerRef} />;
};