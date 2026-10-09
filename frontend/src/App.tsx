import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { ScannerPage } from './pages/ScannerPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ThreatNewsPage } from './pages/ThreatNewsPage';
import { CommunityPage } from './pages/CommunityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssistantPage } from './pages/AssistantPage';
import { LearnLabPage } from './pages/LearnLabPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 lg:pl-64 flex flex-col justify-between">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<OverviewDashboard />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/results/:id" element={<ResultsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/threat-news" element={<ThreatNewsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/learn" element={<LearnLabPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
