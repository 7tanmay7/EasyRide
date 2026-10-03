import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navigation/Navbar';
import { Booking } from '@easyride/shared-types';
import { Clock, MapPin, Receipt, Star } from 'lucide-react';

export const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/bookings/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTrips(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Your Trips & Delivery History</h1>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm font-semibold">Loading your activity history...</div>
        ) : trips.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-border text-center text-slate-500 text-sm font-medium">
            No recent trips found. Book your first EasyRide trip!
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((b) => (
              <div key={b.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-black">{b.serviceCategory}</span>
                    <span className="text-xs text-slate-400 font-mono">#{b.id}</span>
                  </div>
                  <span className="text-base font-black text-black shrink-0">₹{b.fare.finalFare}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">From:</span> {b.pickup.address}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">To:</span> {b.dropoff.address}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-[10px] text-slate-500 pt-1 font-medium">
                  <span>{new Date(b.requestedAt).toLocaleString()}</span>
                  <span className="self-start sm:self-auto bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
