import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminView from './views/AdminView';
import PublicView from './views/PublicView';
import PrintView from './views/PrintView';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/print" element={<PrintView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;