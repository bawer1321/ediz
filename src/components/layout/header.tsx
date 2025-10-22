'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Heart, 
  BarChart3, 
  Play,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getUserDisplayName } from '@/lib/utils';
import type { User } from '@/types';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onUserChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Play },
    { name: 'Keşfet', href: '/discover', icon: Search },
    { name: 'İstatistikler', href: '/stats', icon: BarChart3 },
    { name: 'Favoriler', href: '/favorites', icon: Heart },
    { name: 'İzleme Listesi', href: '/watchlist', icon: Clock },
  ];

  const users = [
    { id: 'irem' as const, name: 'İrem', avatar: '👩‍💼' },
    { id: 'yusuf' as const, name: 'Yusuf', avatar: '👨‍💼' },
    { id: 'both' as const, name: 'İkimiz', avatar: '💑' },
  ];

  const currentUserData = users.find(user => user.id === currentUser);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                Film Evi
              </h1>
              <p className="text-xs text-gray-400">İrem & Yusuf</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-red-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Switcher & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User Switcher */}
            <div className="flex items-center space-x-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onUserChange(user.id)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all",
                    currentUser === user.id 
                      ? "bg-red-600 text-white scale-110" 
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  )}
                >
                  {user.avatar}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-red-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;