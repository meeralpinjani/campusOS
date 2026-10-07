import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Marketplace } from './pages/Marketplace';
import { AcademicCalendarPage } from './pages/AcademicCalendarPage';
import { ChatDrawer } from './components/ChatDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { PostDetailModal } from './components/PostDetailModal';

export function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-[#F4F2EE] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
            <Navbar
              onOpenChat={() => setIsChatOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onSearchQueryChange={setSearchQuery}
            />
            <main className="flex-1">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home searchQuery={searchQuery} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketplace"
                  element={
                    <ProtectedRoute>
                      <Marketplace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/academic-calendar"
                  element={
                    <ProtectedRoute>
                      <AcademicCalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <UserProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              onOpenDetail={setSelectedPostDetail}
            />
            {selectedPostDetail && (
              <PostDetailModal
                post={selectedPostDetail}
                isOpen={!!selectedPostDetail}
                onClose={() => setSelectedPostDetail(null)}
              />
            )}
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
