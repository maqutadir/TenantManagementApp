import React from 'react';
import { Home, LogIn } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = ({ setCurrentPage, currentUser, handleLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'login')}
          >
            <Home size={26} className="mr-2 text-sky-400 group-hover:text-sky-300 transition-colors"/>
            <span className="font-bold text-xl tracking-tight group-hover:text-sky-300 transition-colors">TenantFlow</span>
          </div>
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <>
                <span className="text-sm hidden sm:inline">
                  Welcome, {currentUser.profile?.name || currentUser.email}! ({currentUser.profile?.role})
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-sky-400 hover:bg-slate-700 hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setCurrentPage('login')}
                icon={LogIn}
                variant="primary"
                className="bg-sky-500 hover:bg-sky-600 focus:ring-sky-400"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;