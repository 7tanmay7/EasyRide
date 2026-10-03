import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navigation/Navbar';
import { Building2, Package, Plus, Upload, Code2, CheckCircle2, Clock, BarChart2 } from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalDeliveries: 142,
    activeDeliveries: 12,
    completedDeliveries: 128,
    avgDeliveryTimeMin: 21,
    apiKeyPrefix: 'er_live_apex01',
  });

  const [orderRef, setOrderRef] = useState('');
  const [pickupAddr, setPickupAddr] = useState('Koramangala Dark Store #4, Bengaluru');
  const [dropAddr, setDropAddr] = useState('HSR Layout Sector 1, Bengaluru');
  const [csvText, setCsvText] = useState('ORD-101,Koramangala,HSR Layout,MEDIUM,HIGH\nORD-102,Indiranagar,Whitefield,SMALL,EXPRESS');
  const [activeTab, setActiveTab] = useState<'deliveries' | 'csv' | 'api'>('deliveries');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/v1/businesses/deliveries?businessId=biz-demo');
      const data = await res.json();
      if (data.success && data.data) {
        setDeliveries(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/businesses/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: orderRef || `ORD-${Date.now().toString().slice(-4)}`,
          priority: 'HIGH',
          packageSize: 'MEDIUM',
          packageWeightKg: 2.5,
          pickup: { address: pickupAddr, lat: 12.9352, lng: 77.6245 },
          dropoff: { address: dropAddr, lat: 12.9121, lng: 77.6446 },
          businessId: 'biz-demo',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDeliveries();
        setOrderRef('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-black shrink-0" />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Apex Quick Commerce Portal</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">B2B Delivery Dispatch & API Management</p>
          </div>

          <div className="flex overflow-x-auto no-scrollbar items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'deliveries' ? 'bg-black text-white' : 'bg-secondary text-slate-700 hover:bg-slate-200'
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'csv' ? 'bg-black text-white' : 'bg-secondary text-slate-700 hover:bg-slate-200'
              }`}
            >
              Bulk CSV
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'api' ? 'bg-black text-white' : 'bg-secondary text-slate-700 hover:bg-slate-200'
              }`}
            >
              API Credentials
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Total Deliveries</span>
            <span className="text-xl sm:text-2xl font-black text-black">{stats.totalDeliveries}</span>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Active Dispatches</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600">{stats.activeDeliveries}</span>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Completion Rate</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">99.2%</span>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Avg Time</span>
            <span className="text-xl sm:text-2xl font-black text-black">{stats.avgDeliveryTimeMin} min</span>
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'deliveries' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Create Single Delivery Form */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4">
              <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" /> Create Dispatch Job
              </h3>

              <form onSubmit={handleCreateDelivery} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Order Reference</label>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder="e.g. ORD-9921"
                    className="w-full bg-secondary border border-border p-2.5 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Pickup Dark Store</label>
                  <input
                    type="text"
                    value={pickupAddr}
                    onChange={(e) => setPickupAddr(e.target.value)}
                    className="w-full bg-secondary border border-border p-2.5 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Customer Dropoff Address</label>
                  <input
                    type="text"
                    value={dropAddr}
                    onChange={(e) => setDropAddr(e.target.value)}
                    className="w-full bg-secondary border border-border p-2.5 rounded-xl font-medium"
                  />
                </div>
                <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-extrabold text-xs shadow-md">
                  Dispatch Business Delivery
                </button>
              </form>
            </div>

            {/* Delivery Jobs Table */}
            <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4">
              <h3 className="font-extrabold text-base sm:text-lg text-foreground">Recent Delivery Orders</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-secondary uppercase text-[10px] font-extrabold text-slate-500">
                    <tr>
                      <th className="p-3">Order Ref</th>
                      <th className="p-3">Pickup → Drop</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {deliveries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500 font-medium">
                          No delivery dispatches yet. Use the form to create your first business delivery.
                        </td>
                      </tr>
                    ) : (
                      deliveries.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50 font-medium">
                          <td className="p-3 font-bold text-black">{j.orderReference}</td>
                          <td className="p-3">
                            <span className="block text-slate-800 font-semibold">{j.pickup.address}</span>
                            <span className="text-[10px] text-slate-500">to {j.dropoff.address}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{j.priority}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{j.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CSV Bulk Upload Simulator */}
        {activeTab === 'csv' && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4 max-w-3xl">
            <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4" /> Bulk CSV Delivery Dispatch
            </h3>
            <p className="text-xs text-slate-500">Paste delivery orders CSV format (order_id, pickup, drop, size, priority):</p>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-secondary border border-border p-3 rounded-2xl font-mono text-xs focus:outline-none"
            />
            <button
              onClick={() => alert('Bulk CSV uploaded! 2 delivery dispatches scheduled via EasyRide Dispatch Engine.')}
              className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold text-xs"
            >
              Process & Dispatch Bulk Orders
            </button>
          </div>
        )}

        {/* API Credentials */}
        {activeTab === 'api' && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl space-y-4 max-w-3xl">
            <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600 shrink-0" /> EasyRide B2B Dispatch API Key
            </h3>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 font-mono text-xs overflow-x-auto">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-slate-400">
                <span>API Endpoint:</span>
                <span className="text-emerald-400 font-semibold break-all">POST /api/v1/businesses/deliveries</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-slate-400">
                <span>API Key Prefix:</span>
                <span className="text-amber-400 font-semibold">er_live_apex01_4982****</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
