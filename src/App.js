import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Sidebar';
import { EnrollmentDashboardPage } from './pages/EnrollmentDashboardPage';
import { CourseListPage } from './pages/CourseListPage';
import { DemographicProfile } from './pages/DemographicProfile'; // <-- CORRIGIDO AQUI
import { DropoutAnalysisPage } from './pages/DropoutAnalysisPage';
import { useUI } from './context/UIContext';
import { FiSun, FiMoon } from 'react-icons/fi';

function App() {
  const { theme, toggleTheme } = useUI();

  return (
    <BrowserRouter>
      <div className="relative">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:scale-105 transition-transform z-50"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DemographicProfile />} /> 
            <Route path="enrollments" element={<EnrollmentDashboardPage />} />
            <Route path="courses" element={<CourseListPage />} />
            <Route path="dropout" element={<DropoutAnalysisPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;