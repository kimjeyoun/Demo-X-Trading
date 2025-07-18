// frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TradingPage } from "./pages/TradingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { Layout } from "./components/common/Layout";
import { GlobalStyle } from "./styles/GlobalStyle";

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route element={<Layout />}>
          {" "}
          {/* Layout을 부모 라우트로 설정 */}
          <Route path="/" element={<TradingPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
