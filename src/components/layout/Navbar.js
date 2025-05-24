import React from 'react';
import { Home, LogIn } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = ({ setCurrentPage, currentUser, handleLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => setCurrentPage(currentUser ? 'dashboard' : 'login')}
          >
            <Home size={26} className="mr-2 text-primary-600 group-hover:text-primary-700 transition-colors"/>
            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">TenantFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="text-sm hidden sm:inline text-gray-600">
                  Welcome, <span className="font-medium text-gray-900">{currentUser.profile?.name || currentUser.email}</span>
                  <span className="text-gray-500 ml-1">({currentUser.profile?.role})</span>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setCurrentPage('login')}
                icon={LogIn}
                variant="primary"
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