import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navigation/Navbar';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { useAppStore } from '../store/useAppStore';
import { DriverProfile, Booking } from '@easyride/shared-types';
import { Power, Flame, Star, CheckCircle, Navigation, Phone } from 'lucide-react';

export const DriverDashboard = () => {
  const { driverProfile, setOnlineDrivers, demandZones } = useAppStore();

  const [isOnline, setIsOnline] = useState(driverProfile?.status === 'ONLINE');
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
  const [earnings, setEarnings] = useState(driverProfile?.totalEarnings || 1240);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    // Poll for incoming jobs when online
    if (isOnline) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/v1/drivers/jobs?driverId=drv-demo');
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0 && !activeJob && !incomingRequest) {
            const req = data.data[0];
            if (req.status === 'SEARCHING' || req.status === 'REQUESTED') {
              setIncomingRequest({
                bookingId: req.id,
                pickup: req.pickup,
                dropoff: req.dropoff,
                distanceKm: req.distanceKm,
                estimatedEarning: Math.round(req.fare.finalFare * 0.85),
                etaToPickup: 4,
                otp: req.otp,
              });
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOnline, activeJob, incomingRequest]);

  const toggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    const endpoint = nextStatus ? '/api/v1/drivers/go-online' : '/api/v1/drivers/go-offline';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: driverProfile?.id || 'drv-demo' }),
    });
  };

  const handleAcceptJob = async () => {
    if (!incomingRequest) return;
    try {
      const res = await fetch(`/api/v1/drivers/jobs/${incomingRequest.bookingId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driverProfile?.id || 'drv-demo' }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveJob(data.data);
        setIncomingRequest(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleArrive = async () => {
    if (!activeJob) return;
    const res = await fetch(`/api/v1/drivers/jobs/${activeJob.id}/arrived`, { method: 'POST' });
    const data = await res.json();
    if (data.success) setActiveJob(data.data);
  };

  const handleStartTrip = async () => {
    if (!activeJob) return;
    const res = await fetch(`/api/v1/drivers/jobs/${activeJob.id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: otpInput || activeJob.otp }),
    });
    const data = await res.json();
    if (data.success) setActiveJob(data.data);
  };

  const handleCompleteTrip = async () => {
    if (!activeJob) return;
    const res = await fetch(`/api/v1/drivers/jobs/${activeJob.id}/complete`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setEarnings((prev) => prev + Math.round(activeJob.fare.finalFare * 0.85));
      setActiveJob(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Driver Controls & Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Online Switch */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Good day, Vikram</h2>
              <p className="text-xs text-slate-500 font-medium">Honda City • KA-01-AB-1234</p>
            </div>

            <button
              onClick={toggleOnline}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs shadow-md transition-transform active:scale-95 ${
                isOnline ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Power className="w-4 h-4" /> {isOnline ? '● ONLINE' : 'OFFLINE'}
            </button>
          </div>

          {/* Earnings & Performance KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Today's Earnings</span>
              <span className="text-xl sm:text-2xl font-black text-black">₹{earnings}</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Acceptance Rate</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">94%</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Trips Today</span>
              <span className="text-xl sm:text-2xl font-black text-black">8</span>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Driver Utilization</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">72%</span>
            </div>
          </div>

          {/* Repositioning Recommendation Banner */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-amber-900">High Demand Hotspot Nearby</h4>
              <p className="text-xs text-amber-800 mt-1">
                Move toward <span className="font-extrabold text-black">Whitefield Zone</span>. Demand supply ratio is 1.8x with high surge earnings!
              </p>
            </div>
          </div>

          {/* Active Job Controls */}
          {activeJob && (
            <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-full">{activeJob.status}</span>
                <span className="text-xs font-semibold text-slate-400">Earning: ₹{Math.round(activeJob.fare.finalFare * 0.85)}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Pickup</span>
                  <p className="font-bold text-white text-sm">{activeJob.pickup.address}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Dropoff</span>
                  <p className="font-bold text-white text-sm">{activeJob.dropoff.address}</p>
                </div>
              </div>

              {activeJob.status === 'DRIVER_ASSIGNED' && (
                <button onClick={handleArrive} className="w-full bg-white text-black py-3 rounded-xl font-black text-xs hover:bg-slate-100">
                  Arrived at Pickup Location
                </button>
              )}

              {activeJob.status === 'DRIVER_ARRIVED' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter Customer 4-Digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-center font-bold tracking-widest text-sm"
                  />
                  <button onClick={handleStartTrip} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-black text-xs hover:bg-emerald-600">
                    Verify & Start Trip
                  </button>
                </div>
              )}

              {activeJob.status === 'IN_PROGRESS' && (
                <button onClick={handleCompleteTrip} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-black text-xs hover:bg-emerald-600">
                  Complete Trip & Collect Payment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Driver Map */}
        <div className="lg:col-span-7 h-[320px] sm:h-[450px] lg:h-[600px] relative">
          <InteractiveMap
            pickup={activeJob?.pickup}
            dropoff={activeJob?.dropoff}
            zones={demandZones}
            className="h-full w-full rounded-3xl border border-border shadow-xl"
          />

          {/* Incoming Job Request Modal Popup */}
          {incomingRequest && (
            <div className="absolute inset-x-2 sm:inset-x-4 bottom-2 sm:bottom-4 bg-white p-4 sm:p-6 rounded-3xl shadow-2xl border-2 border-black z-30 space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="bg-black text-white font-bold text-xs px-3 py-1 rounded-full">New Job Offer</span>
                <span className="text-xl font-black text-emerald-600">₹{incomingRequest.estimatedEarning}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Pickup</span>
                  <p className="font-bold text-black">{incomingRequest.pickup.address}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Dropoff</span>
                  <p className="font-bold text-black">{incomingRequest.dropoff.address}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setIncomingRequest(null)} className="flex-1 bg-secondary text-slate-700 py-3 rounded-xl font-bold text-xs hover:bg-slate-200">
                  Reject
                </button>
                <button onClick={handleAcceptJob} className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 shadow-lg">
                  Accept Job
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
