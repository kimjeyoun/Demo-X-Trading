// frontend/src/App.tsx

import { TradingPage } from './pages/TradingPage';
import { createGlobalStyle } from 'styled-components';

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #131722;
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <TradingPage />
    </>
  );
}

export default App;