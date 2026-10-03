import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Car, Package, Zap, Building2, Wrench, User as UserIcon, Play, Pause, Menu, X, History } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, activeRole, setActiveRole, selectedServiceCategory, setSelectedServiceCategory, simulationRunning, toggleSimulation } = useAppStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleChange = (role: 'CUSTOMER' | 'DRIVER' | 'BUSINESS' | 'ADMIN') => {
    setActiveRole(role);
    setMobileMenuOpen(false);
    if (role === 'CUSTOMER') navigate('/book');
    if (role === 'DRIVER') navigate('/driver');
    if (role === 'BUSINESS') navigate('/business');
    if (role === 'ADMIN') navigate('/admin');
  };

  const handleCategorySelect = (category: 'RIDE' | 'PACKAGE' | 'QUICK_COMMERCE' | 'BUSINESS' | 'SERVICE', targetPath: string) => {
    setSelectedServiceCategory(category);
    setMobileMenuOpen(false);
    navigate(targetPath);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg tracking-wider group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Easy<span className="text-accent">Ride</span>
            </span>
          </Link>

          {/* Service Selector Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-secondary p-1 rounded-xl">
            <button
              onClick={() => handleCategorySelect('RIDE', '/book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'RIDE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Ride
            </button>
            <button
              onClick={() => handleCategorySelect('PACKAGE', '/book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'PACKAGE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Package
            </button>
            <button
              onClick={() => handleCategorySelect('QUICK_COMMERCE', '/book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'QUICK_COMMERCE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick-Commerce
            </button>
            <button
              onClick={() => handleCategorySelect('BUSINESS', '/business')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'BUSINESS' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Business
            </button>
            <button
              onClick={() => handleCategorySelect('SERVICE', '/book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'SERVICE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Technician
            </button>
          </nav>
        </div>

        {/* Right Controls & Desktop Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Simulation Control Button */}
          <button
            onClick={toggleSimulation}
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
              simulationRunning ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-secondary text-foreground border-border hover:bg-slate-200'
            }`}
          >
            {simulationRunning ? <Pause className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
            {simulationRunning ? 'Simulation ACTIVE' : 'Simulate Traffic'}
          </button>

          {/* Role Switcher Pill Container */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-border">
            <button
              onClick={() => handleRoleChange('CUSTOMER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'CUSTOMER' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => handleRoleChange('DRIVER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'DRIVER' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
              }`}
            >
              Driver
            </button>
            <button
              onClick={() => handleRoleChange('BUSINESS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'BUSINESS' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => handleRoleChange('ADMIN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'ADMIN' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
              }`}
            >
              Admin
            </button>
          </div>

          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-2 p-1.5 px-2.5 hover:bg-secondary rounded-xl text-xs font-medium border border-border"
          >
            <UserIcon className="w-4 h-4 text-slate-700" />
            <span className="font-semibold">{currentUser.name.split(' ')[0]}</span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-border bg-secondary hover:bg-slate-200 text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border px-4 pt-3 pb-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* Services Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
              Services & Dispatch
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCategorySelect('RIDE', '/book')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServiceCategory === 'RIDE' ? 'bg-black text-white border-black' : 'bg-secondary border-border text-slate-800'
                }`}
              >
                <Car className="w-4 h-4" /> Ride Booking
              </button>
              <button
                onClick={() => handleCategorySelect('PACKAGE', '/book')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServiceCategory === 'PACKAGE' ? 'bg-black text-white border-black' : 'bg-secondary border-border text-slate-800'
                }`}
              >
                <Package className="w-4 h-4" /> Package Express
              </button>
              <button
                onClick={() => handleCategorySelect('QUICK_COMMERCE', '/book')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServiceCategory === 'QUICK_COMMERCE' ? 'bg-black text-white border-black' : 'bg-secondary border-border text-slate-800'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" /> Quick-Commerce
              </button>
              <button
                onClick={() => handleCategorySelect('BUSINESS', '/business')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServiceCategory === 'BUSINESS' ? 'bg-black text-white border-black' : 'bg-secondary border-border text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" /> B2B Business
              </button>
              <button
                onClick={() => handleCategorySelect('SERVICE', '/book')}
                className={`col-span-2 flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServiceCategory === 'SERVICE' ? 'bg-black text-white border-black' : 'bg-secondary border-border text-slate-800'
                }`}
              >
                <Wrench className="w-4 h-4" /> On-Demand Technician
              </button>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
              Switch Application Mode
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-border">
              <button
                onClick={() => handleRoleChange('CUSTOMER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                  activeRole === 'CUSTOMER' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Customer App
              </button>
              <button
                onClick={() => handleRoleChange('DRIVER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                  activeRole === 'DRIVER' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Driver Portal
              </button>
              <button
                onClick={() => handleRoleChange('BUSINESS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                  activeRole === 'BUSINESS' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Business Portal
              </button>
              <button
                onClick={() => handleRoleChange('ADMIN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                  activeRole === 'ADMIN' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Admin Command
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
            <button
              onClick={() => {
                toggleSimulation();
                setMobileMenuOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                simulationRunning ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-secondary text-foreground border-border'
              }`}
            >
              {simulationRunning ? <Pause className="w-4 h-4 text-emerald-600 animate-pulse" /> : <Play className="w-4 h-4" />}
              {simulationRunning ? 'Simulation ACTIVE' : 'Traffic Simulation'}
            </button>

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-slate-200 rounded-xl text-xs font-bold border border-border"
            >
              <UserIcon className="w-4 h-4 text-slate-700" />
              <span>Account</span>
            </Link>

            <Link
              to="/trips"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-slate-200 rounded-xl text-xs font-bold border border-border"
            >
              <History className="w-4 h-4 text-slate-700" />
              <span>Trips</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

