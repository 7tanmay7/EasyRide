import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navigation/Navbar';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { useAppStore } from '../store/useAppStore';
import { Car, Package, Zap, Building2, Wrench, ArrowRight, ShieldCheck, Cpu, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedServiceCategory, onlineDrivers, demandZones } = useAppStore();

  const [pickupInput, setPickupInput] = useState('Koramangala 5th Block, Bengaluru');
  const [dropInput, setDropInput] = useState('Indiranagar 100ft Road, Bengaluru');
  const [activeTab, setActiveTab] = useState<'RIDE' | 'PACKAGE' | 'QUICK_COMMERCE' | 'BUSINESS' | 'SERVICE'>('RIDE');

  const handleSearchDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedServiceCategory(activeTab);
    navigate(`/book?pickup=${encodeURIComponent(pickupInput)}&drop=${encodeURIComponent(dropInput)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Task-First Booking Interface */}
          <div className="lg:col-span-6 z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-semibold text-xs border border-white/10">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" /> Unified Intelligent Urban Dispatch Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Move anything.<br />
              <span className="text-emerald-400">Anywhere in your city.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl">
              One intelligent supply network for rides, packages, quick commerce, and business deliveries. Reduced idle time, faster ETAs.
            </p>

            {/* Main Booking Card */}
            <div className="bg-white text-foreground p-6 rounded-3xl shadow-2xl border border-border">
              {/* Service Switcher Tabs */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-secondary rounded-xl mb-5 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('RIDE')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'RIDE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Car className="w-4 h-4" /> Ride
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('PACKAGE')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'PACKAGE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Package className="w-4 h-4" /> Package
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('QUICK_COMMERCE')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'QUICK_COMMERCE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500" /> Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('BUSINESS')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'BUSINESS' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Business
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SERVICE')}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeTab === 'SERVICE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Wrench className="w-4 h-4" /> Service
                </button>
              </div>

              {/* Connected Pickup / Drop Inputs */}
              <form onSubmit={handleSearchDriver} className="space-y-4">
                <div className="relative pl-7 space-y-3">
                  {/* Visual Connection Line */}
                  <div className="absolute left-2.5 top-3.5 bottom-3.5 w-0.5 bg-slate-300 flex flex-col justify-between items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-black -ml-1"></div>
                    <div className="w-2.5 h-2.5 bg-emerald-600 -ml-1"></div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Pickup Location</label>
                    <input
                      type="text"
                      value={pickupInput}
                      onChange={(e) => setPickupInput(e.target.value)}
                      placeholder="Enter pickup address"
                      className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Drop-off Location</label>
                    <input
                      type="text"
                      value={dropInput}
                      onChange={(e) => setDropInput(e.target.value)}
                      placeholder="Enter destination address"
                      className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Pickup now (ETA ~ 4 min)
                  </span>
                  <button
                    type="submit"
                    className="bg-black text-white hover:bg-slate-800 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    Find a Driver <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Network Map */}
          <div className="lg:col-span-6 h-[460px] relative">
            <InteractiveMap zones={demandZones} drivers={onlineDrivers} className="h-full w-full rounded-3xl shadow-2xl border-4 border-white/10" />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur text-white p-4 rounded-2xl border border-white/10 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live City Network</p>
                <p className="text-sm font-bold text-slate-100">Bengaluru Metropolitan Dispatch Layer</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white">{onlineDrivers.length || 500}+</span>
                <span className="text-[10px] block text-slate-400 font-medium">Active Online Drivers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENT DISPATCH EXPLANATION SECTION */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Powered by the EasyRide Intelligent Dispatch Engine
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Unlike traditional single-purpose apps, EasyRide dynamically routes supply across passenger trips, package express, and quick commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-Metric Driver Scoring</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Rather than selecting the nearest driver blindly, our algorithm balances proximity, ETA, driver acceptance probability, utilization rates, and destination demand.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Demand & Supply Hotspots</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Real-time spatial DSR (Demand-Supply Ratio) monitoring automatically triggers driver repositioning recommendations to high-demand areas before shortages happen.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-bold mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">ML Cancellation Prediction</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Predictive Random Forest and XGBoost models evaluate cancellation risks in real-time, helping optimize pricing transparently and protect partner earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-black text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white text-black font-black rounded-lg flex items-center justify-center text-base">E</div>
              <span className="font-extrabold text-xl tracking-tight">EasyRide</span>
            </div>
            <p className="text-slate-400 text-xs mt-2">One intelligent network for rides, deliveries and urban logistics.</p>
          </div>
          <div className="flex gap-6 text-xs font-semibold text-slate-400">
            <button onClick={() => navigate('/book')} className="hover:text-white">Customer Booking</button>
            <button onClick={() => navigate('/driver')} className="hover:text-white">Driver Portal</button>
            <button onClick={() => navigate('/business')} className="hover:text-white">Business Deliveries</button>
            <button onClick={() => navigate('/admin')} className="hover:text-white">Operations Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
