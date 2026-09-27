import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Car, Package, Zap, Building2, Wrench, Shield, User as UserIcon, Play, Pause } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, activeRole, setActiveRole, selectedServiceCategory, setSelectedServiceCategory, simulationRunning, toggleSimulation } = useAppStore();
  const navigate = useNavigate();

  const handleRoleChange = (role: 'CUSTOMER' | 'DRIVER' | 'BUSINESS' | 'ADMIN') => {
    setActiveRole(role);
    if (role === 'CUSTOMER') navigate('/book');
    if (role === 'DRIVER') navigate('/driver');
    if (role === 'BUSINESS') navigate('/business');
    if (role === 'ADMIN') navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-black text-lg tracking-wider group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Easy<span className="text-accent">Ride</span>
            </span>
          </Link>

          {/* Service Selector Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary p-1 rounded-xl">
            <button
              onClick={() => {
                setSelectedServiceCategory('RIDE');
                navigate('/book');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'RIDE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Ride
            </button>
            <button
              onClick={() => {
                setSelectedServiceCategory('PACKAGE');
                navigate('/book');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'PACKAGE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Package
            </button>
            <button
              onClick={() => {
                setSelectedServiceCategory('QUICK_COMMERCE');
                navigate('/book');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'QUICK_COMMERCE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick-Commerce
            </button>
            <button
              onClick={() => {
                setSelectedServiceCategory('BUSINESS');
                navigate('/business');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'BUSINESS' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Business
            </button>
            <button
              onClick={() => {
                setSelectedServiceCategory('SERVICE');
                navigate('/book');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedServiceCategory === 'SERVICE' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-black'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Technician
            </button>
          </nav>
        </div>

        {/* Right Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Live Simulation Control Button */}
          <button
            onClick={toggleSimulation}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
              simulationRunning ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-secondary text-foreground border-border hover:bg-slate-200'
            }`}
          >
            {simulationRunning ? <Pause className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
            {simulationRunning ? 'Simulation ACTIVE' : 'Simulate Traffic'}
          </button>

          {/* Quick Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-border">
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
            className="flex items-center gap-2 p-1.5 hover:bg-secondary rounded-xl text-xs font-medium border border-border"
          >
            <UserIcon className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
