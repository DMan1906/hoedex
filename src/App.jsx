import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { account } from './appwrite';
import Auth from './components/Auth';
import FriendsFeed from './components/FriendsFeed';
import Friends from './components/Friends';
import UserProfile from './components/UserProfile';
import AddCatch from './components/AddCatch';
import MyCatches from './components/MyCatches';
import Navbar from './components/Navbar';
import Header from './components/Header';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
        <Header />
        <Routes>
          <Route path="/" element={<FriendsFeed />} />
          <Route path="/add" element={<AddCatch />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/my-catches" element={<MyCatches />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navbar onLogout={() => setIsAuthenticated(false)} />
      </div>
    </Router>
  );
}
