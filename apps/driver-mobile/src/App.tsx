import React, { useState } from 'react';
import { Power, Flame, Navigation, Phone, DollarSign, Star, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [earnings, setEarnings] = useState(1240);
  const [incomingRequest, setIncomingRequest] = useState<any | null>({
    bookingId: 'bk-demo-101',
    pickup: 'Koramangala 5th Block, Bengaluru',
    dropoff: 'Whitefield Main Rd, Bengaluru',
    distanceKm: 12.4,
    estimatedEarning: 285,
    etaToPickup: 5,
  });
  const [activeJob, setActiveJob] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex justify-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-slate-900 min-h-screen flex flex-col justify-between border-x border-slate-800 shadow-2xl relative">
        {/* Mobile Header */}
        <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur sticky top-0 z-20">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">EasyRide Partner</span>
            <h1 className="font-black text-lg text-white">Vikram Rao</h1>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-extrabold text-xs shadow-md transition-transform active:scale-95 ${
              isOnline ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" /> {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Earnings Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Earnings</span>
              <span className="text-2xl font-black text-emerald-400">₹{earnings}</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Acceptance</span>
              <span className="text-2xl font-black text-white">96%</span>
            </div>
          </div>

          {/* Demand Repositioning Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-amber-300">
            <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-200">High Demand Hotspot Nearby</h4>
              <p className="mt-0.5 text-slate-300">Move toward Whitefield for 1.8x surge earnings opportunity!</p>
            </div>
          </div>
        </main>

        {/* Incoming Job Sheet */}
        {incomingRequest && (
          <div className="p-5 bg-slate-900 border-t-2 border-emerald-500 rounded-t-3xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-full">New Job Dispatch</span>
              <span className="text-xl font-black text-emerald-400">₹{incomingRequest.estimatedEarning}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Pickup (5 min away)</span>
                <p className="font-bold text-white text-sm">{incomingRequest.pickup}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Dropoff</span>
                <p className="font-bold text-white text-sm">{incomingRequest.dropoff}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setIncomingRequest(null)} className="flex-1 bg-slate-800 py-3 rounded-xl font-bold text-xs hover:bg-slate-700">
                Decline
              </button>
              <button
                onClick={() => {
                  setActiveJob(incomingRequest);
                  setIncomingRequest(null);
                }}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-xs hover:bg-emerald-600 shadow-lg"
              >
                Accept Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
