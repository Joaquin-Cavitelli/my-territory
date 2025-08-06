
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TerritoryListPage from './pages/TerritoryListPage';
import TerritoryViewPage from './pages/TerritoryViewPage';
import StreetViewPage from './pages/StreetViewPage';
import VisitHistoryPage from './pages/VisitHistoryPage';

const App: React.FC = () => {
  return (
    <div className="min-h-[--doc-height]">
      <Routes>
        <Route path="/" element={<TerritoryListPage />} />
        <Route path="/territory/:territoryId" element={<TerritoryViewPage />} />
        <Route path="/territory/:territoryId/street/:streetId" element={<StreetViewPage />} />
        <Route path="/territory/:territoryId/history" element={<VisitHistoryPage />} />
      </Routes>
    </div>
  );
};

export default App;