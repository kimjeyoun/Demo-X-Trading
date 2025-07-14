// frontend/src/components/OrderPanel/styles.ts

import styled from 'styled-components';

export const OrderPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #1e222d;
  color: #f0f0f0;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100%;
  box-sizing: border-box;
`;

export const TabWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid #2a2e39;
  margin-bottom: 16px;
`;

export const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  color: ${({ active }) => (active ? '#f0f0f0' : '#888')};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 2px solid ${({ active, children }) =>
    active ? (children?.toString().includes('롱') ? '#089981' : '#f23645') : 'transparent'};
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #f0f0f0;
  }
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 12px;
    color: #888;
    margin-bottom: 8px;
  }
`;

export const Input = styled.input`
  background-color: #2a2e39;
  border: 1px solid #444;
  color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: #5570ff;
  }
`;

export const LeverageSlider = styled(Input)`
  padding: 0;
  height: 4px;
  -webkit-appearance: none;
  background: #444;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #5570ff;
    border-radius: 50%;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #5570ff;
    border-radius: 50%;
    cursor: pointer;
  }
`;


export const InfoGroup = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #aaa;
  padding: 8px 0;
`;

export const ErrorMessage = styled.p`
  color: #f23645; // 숏 포지션(매도)과 동일한 빨간색
  font-size: 12px;
  text-align: center;
  margin: 10px 0 0; // 위쪽 여백 추가
  min-height: 15px; // 에러가 없을 때도 공간을 차지하도록 하여 레이아웃 밀림 방지
`;

export const SubmitButton = styled.button<{ side: 'BUY' | 'SELL' }>`
  margin-top: auto;
  padding: 14px;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ side }) => (side === 'BUY' ? '#089981' : '#f23645')};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;