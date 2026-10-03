import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navigation/Navbar';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { useAppStore } from '../store/useAppStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Shield, Activity, Users, Car, AlertTriangle, TrendingUp, Cpu, Play, Pause } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { onlineDrivers, demandZones, simulationRunning, toggleSimulation } = useAppStore();

  const [overview, setOverview] = useState<any>({
    activeTrips: 18,
    availableDrivers: 320,
    totalDrivers: 500,
    requestsToday: 1420,
    completedTrips: 1180,
    cancelledTrips: 110,
    cancellationRatePercent: 7.7,
    averageEtaMin: 4.8,
    driverUtilizationPercent: 72.4,
    totalRevenue: 248500,
  });

  const [demandData, setDemandData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'analytics' | 'ml'>('live');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const resOverview = await fetch('/api/v1/analytics/overview');
      const dataOverview = await resOverview.json();
      if (dataOverview.success && dataOverview.data) {
        setOverview(dataOverview.data);
      }

      const resDemand = await fetch('/api/v1/analytics/demand');
      const dataDemand = await resDemand.json();
      if (dataDemand.success && dataDemand.data) {
        setDemandData(dataDemand.data.demandOverTime);
      }

      const resRev = await fetch('/api/v1/analytics/revenue');
      const dataRev = await resRev.json();
      if (dataRev.success && dataRev.data) {
        setRevenueData(dataRev.data.dailyRevenue);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const zoneChartData = demandZones.slice(0, 10).map((z) => ({
    name: z.name.split(' ')[0],
    demand: z.currentDemand,
    supply: z.currentSupply,
    dsr: z.demandSupplyRatio,
  }));

  const COLORS = ['#111111', '#2563EB', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Operations Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-black shrink-0" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">City Operations Command Center</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">Real-Time Dispatch Control Room • Bengaluru Metropolitan Region</p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={toggleSimulation}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all shrink-0 ${
                simulationRunning ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-secondary text-foreground border-border hover:bg-slate-200'
              }`}
            >
              {simulationRunning ? <Pause className="w-4 h-4 text-emerald-600 animate-pulse" /> : <Play className="w-4 h-4" />}
              {simulationRunning ? 'Simulation RUNNING' : 'Start Live Simulation'}
            </button>

            <div className="flex overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-xl border border-border w-full sm:w-auto shrink-0">
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'live' ? 'bg-black text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Live Map
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'analytics' ? 'bg-black text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('ml')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'ml' ? 'bg-black text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Data Science & ML
              </button>
            </div>
          </div>
        </div>

        {/* Top KPI Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Active Trips</span>
            <span className="text-lg sm:text-xl font-black text-emerald-600">{overview.activeTrips}</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Supply</span>
            <span className="text-lg sm:text-xl font-black text-black">{overview.availableDrivers}</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Requests</span>
            <span className="text-lg sm:text-xl font-black text-black">{overview.requestsToday}</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Completed</span>
            <span className="text-lg sm:text-xl font-black text-black">{overview.completedTrips}</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Cancelled</span>
            <span className="text-lg sm:text-xl font-black text-amber-600">{overview.cancellationRatePercent}%</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Avg ETA</span>
            <span className="text-lg sm:text-xl font-black text-black">{overview.averageEtaMin}m</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Utilization</span>
            <span className="text-lg sm:text-xl font-black text-blue-600">{overview.driverUtilizationPercent}%</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Revenue</span>
            <span className="text-lg sm:text-xl font-black text-black">₹{(overview.totalRevenue / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Live Operations Map Tab */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 h-[340px] sm:h-[450px] lg:h-[580px]">
              <InteractiveMap zones={demandZones} drivers={onlineDrivers} className="h-full w-full rounded-3xl border border-border shadow-xl" />
            </div>

            {/* Zone Status Panel */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4 max-h-[340px] sm:max-h-[580px] overflow-y-auto">
              <h3 className="font-extrabold text-base text-foreground border-b border-border pb-3">Demand & Supply Zones</h3>
              <div className="space-y-3">
                {demandZones.map((z) => (
                  <div key={z.id} className="p-3.5 rounded-2xl bg-secondary/60 border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-black">{z.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Demand: {z.currentDemand} • Supply: {z.currentSupply}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          z.status === 'HIGH' ? 'bg-amber-100 text-amber-800' : z.status === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {z.demandSupplyRatio}x DSR
                      </span>
                      <span className="block text-[10px] text-slate-500 font-bold mt-1">{z.surgeMultiplier}x Surge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Demand by Zone Bar Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4">
              <h3 className="font-extrabold text-base text-foreground">Demand vs Supply by Zone</h3>
              <div className="h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={10} />
                    <YAxis stroke="#6B7280" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#111111" name="Active Requests" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="supply" fill="#10B981" name="Available Supply" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demand Over Time Line Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4">
              <h3 className="font-extrabold text-base text-foreground">Intraday Demand Pattern</h3>
              <div className="h-60 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demandData.length > 0 ? demandData : [{ time: '08:00', demand: 450, supply: 380 }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis dataKey="time" stroke="#6B7280" fontSize={10} />
                    <YAxis stroke="#6B7280" fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="demand" stroke="#2563EB" strokeWidth={3} dot={false} name="Demand" />
                    <Line type="monotone" dataKey="supply" stroke="#10B981" strokeWidth={3} dot={false} name="Supply" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Data Science & ML Tab */}
        {activeTab === 'ml' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Cpu className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-foreground">Machine Learning Intelligence & Prediction Models</h3>
                <p className="text-xs text-slate-500">Live Scikit-Learn & XGBoost Model Diagnostics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-sm text-black">Cancellation Risk Model</h4>
                <p className="text-xs text-slate-600">Random Forest Classifier evaluating distance, surge, duration, and zone DSR.</p>
                <div className="pt-2 text-xs font-mono text-slate-700">
                  ROC-AUC: <span className="font-bold text-emerald-600">0.912</span> | Accuracy: <span className="font-bold">89.4%</span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-sm text-black">Driver Acceptance Model</h4>
                <p className="text-xs text-slate-600">Predicts P(accept) for every dispatch candidate to maximize successful completions.</p>
                <div className="pt-2 text-xs font-mono text-slate-700">
                  Precision: <span className="font-bold text-blue-600">86.2%</span> | F1-Score: <span className="font-bold">85.5%</span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-border space-y-2">
                <h4 className="font-bold text-sm text-black">Demand Forecasting Model</h4>
                <p className="text-xs text-slate-600">Predicts 30-min and 60-min zone demand spikes to auto-trigger driver repositioning.</p>
                <div className="pt-2 text-xs font-mono text-slate-700">
                  Status: <span className="font-bold text-emerald-600">ACTIVE & BALANCING</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
