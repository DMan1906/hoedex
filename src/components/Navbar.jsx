import { Link, useLocation } from 'react-router-dom';
import { Camera, Globe, User, LogOut, Users } from 'lucide-react';
import { account } from '../appwrite';

export default function Navbar({ onLogout }) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      onLogout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { path: '/', icon: <Globe size={24} />, label: 'Global' },
    { path: '/add', icon: <Camera size={24} />, label: 'Add' },
    { path: '/friends', icon: <Users size={24} />, label: 'Friends' },
    { path: '/my-catches', icon: <User size={24} />, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
      <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={24} />
          <span className="text-[10px] mt-1 font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
