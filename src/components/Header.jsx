import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, FileText, Users, Globe, LogIn, UserPlus, Home, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';

export default function Header() {
  const { activeTab, setActiveTab, language, setLanguage } = useApp();
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isClerkAvailable = typeof window !== 'undefined' && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.startsWith('pk_');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'voice', label: 'Voice App', icon: Mic },
    { id: 'schemes', label: 'Public Schemes', icon: FileText },
    { id: 'intel', label: 'Community Intel', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                LokVani AI
              </h1>
              <span className="text-xs font-black text-blue-600 tracking-wider">
                BHARAT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Inclusive Voice Intelligence
            </p>
          </div>
        </div>

        {/* Center Navigation - Pill Menu (Desktop) */}
        {(!isClerkAvailable || isSignedIn) && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200 shadow-inner">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions: Language Selector & User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(l => l === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Clerk Auth Integration */}
          {isClerkAvailable ? (
            <div className="flex items-center gap-2">
              <SignedOut>
                <div className="hidden sm:flex items-center gap-2">
                  <button className="btn-secondary !rounded-full !px-3 !py-1.5 !text-xs" onClick={() => setActiveTab('auth')}>
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                  <button className="btn-primary !rounded-full !px-3 !py-1.5 !text-xs" onClick={() => setActiveTab('auth')}>
                    <UserPlus className="w-3.5 h-3.5" /> Sign Up
                  </button>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="p-0.5 bg-slate-100 rounded-full border border-slate-200">
                  <UserButton showName={false} />
                </div>
              </SignedIn>
            </div>
          ) : (
            <button className="btn-primary !rounded-full !px-3.5 !py-1.5 !text-xs" onClick={() => setActiveTab('auth')}>
              <LogIn className="w-4 h-4" /> Guest Mode
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          {(!isClerkAvailable || isSignedIn) && (
            <button 
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (!isClerkAvailable || isSignedIn) && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 pb-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
