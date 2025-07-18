/* frontend/src/components/common/Layout.tsx */
/*
- [리팩토링] 공통 레이아웃 관리를 위해 네비게이션(헤더)과 페이지 컨텐츠를 분리하는 `Layout` 컴포넌트를 생성합니다.
- `Outlet`은 `react-router-dom`의 기능으로, 중첩된 라우트의 자식 컴포넌트(예: TradingPage, HistoryPage)가 렌더링될 위치를 지정합니다.
*/
import { Link, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.header`
  padding: 16px;
  background-color: #1e222d;
  flex-shrink: 0;
`;

const NavLink = styled(Link)`
  margin-right: 16px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  overflow: auto; /* 컨텐츠가 많을 경우 스크롤 생성 */
`;

export const Layout = () => {
  return (
    <AppContainer>
      <Header>
        <nav>
          <NavLink to="/">트레이딩</NavLink>
          <NavLink to="/history">거래 내역</NavLink>
        </nav>
      </Header>
      <MainContent>
        <Outlet />
      </MainContent>
    </AppContainer>
  );
};