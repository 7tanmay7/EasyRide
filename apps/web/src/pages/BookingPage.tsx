import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navigation/Navbar';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { useAppStore } from '../store/useAppStore';
import { LocationPoint, Booking, ServiceCategory } from '@easyride/shared-types';
import { SERVICE_CATEGORIES } from '@easyride/config';
import { Car, Package, Zap, Building2, Wrench, Search, ShieldCheck, CheckCircle2, Star, Navigation, CreditCard, Phone, AlertCircle, Bot, Sparkles, Send, X } from 'lucide-react';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedServiceCategory, setSelectedServiceCategory, activeBooking, setActiveBooking, onlineDrivers, demandZones } = useAppStore();

  const [pickupText, setPickupText] = useState(searchParams.get('pickup') || 'Koramangala 5th Block, Bengaluru');
  const [dropText, setDropText] = useState(searchParams.get('drop') || 'Indiranagar 100ft Road, Bengaluru');

  const [pickupLocation, setPickupLocation] = useState<LocationPoint>({
    address: 'Koramangala 5th Block, Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    placeId: 'place-koramangala',
  });

  const [dropLocation, setDropLocation] = useState<LocationPoint>({
    address: 'Indiranagar 100ft Road, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    placeId: 'place-indiranagar',
  });

  const [selectedServiceId, setSelectedServiceId] = useState('service-ride-go');
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // GenAI Copilot State
  const [showAiCopilot, setShowAiCopilot] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskGenAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/v1/genai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiQuery, serviceCategory: selectedServiceCategory }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiResponse(data.data.answer);
      }
    } catch (err) {
      setAiResponse('🤖 EasyRide GenAI Assistant: Recommended service option is EasyGo Cab for comfortable city transport.');
    } finally {
      setAiLoading(false);
    }
  };

  // Fetch pricing estimates whenever locations or service category change
  useEffect(() => {
    fetchEstimates();
  }, [selectedServiceCategory, pickupLocation, dropLocation]);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/pricing/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCategory: selectedServiceCategory,
          pickup: pickupLocation,
          dropoff: dropLocation,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEstimates(data.data);
        if (data.data.length > 0) {
          setSelectedServiceId(data.data[0].serviceId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBooking = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTypeId: selectedServiceId,
          serviceCategory: selectedServiceCategory,
          pickup: pickupLocation,
          dropoff: dropLocation,
          customerId: 'usr-cust-demo',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveBooking(data.data);
        pollBookingStatus(data.data.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pollBookingStatus = (bookingId: string) => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setActiveBooking(data.data);
          if (data.data.status === 'COMPLETED') {
            clearInterval(timer);
            setShowRatingModal(true);
          } else if (data.data.status === 'CANCELLED') {
            clearInterval(timer);
          }
        }
      } catch (e) {
        clearInterval(timer);
      }
    }, 2000);
  };

  const handleCancelBooking = async () => {
    if (!activeBooking) return;
    try {
      await fetch(`/api/v1/bookings/${activeBooking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation' }),
      });
      setActiveBooking(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Booking Controls & Active Trip Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Trip Card when booking is in progress */}
          {activeBooking ? (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-border shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                    {activeBooking.status}
                  </span>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Booking ID: {activeBooking.id}</p>
                </div>
                {activeBooking.otp && (
                  <div className="bg-secondary px-3 py-1.5 rounded-xl border border-border text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Start OTP</span>
                    <span className="text-lg font-black text-black tracking-widest">{activeBooking.otp}</span>
                  </div>
                )}
              </div>

              {/* Driver Details Card */}
              {activeBooking.driver ? (
                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
                      {activeBooking.driver.user?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{activeBooking.driver.user?.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {activeBooking.driver.vehicle?.brand} {activeBooking.driver.vehicle?.model} •{' '}
                        <span className="font-bold text-black">{activeBooking.driver.vehicle?.registrationNumber}</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {activeBooking.driver.rating} rating
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <a href={`tel:${activeBooking.driver.user?.phone}`} className="p-2.5 bg-white border border-border rounded-xl hover:bg-slate-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-black" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center gap-3 text-amber-900">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0"></div>
                  <p className="text-xs font-semibold">EasyRide Dispatch Engine searching top scored nearby drivers...</p>
                </div>
              )}

              {/* Route Summary */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-black mt-1 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Pickup</span>
                    <p className="font-medium text-slate-800">{activeBooking.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-600 mt-1 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Drop-off</span>
                    <p className="font-medium text-slate-800">{activeBooking.dropoff.address}</p>
                  </div>
                </div>
              </div>

              {/* Fare Summary */}
              <div className="bg-secondary p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Estimated Total</span>
                  <p className="text-xl font-black text-black">₹{activeBooking.fare.finalFare}</p>
                </div>
                <button
                  onClick={handleCancelBooking}
                  className="w-full sm:w-auto px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors"
                >
                  Cancel Trip
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form Panel */
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-border shadow-xl space-y-5">
              <h2 className="text-xl font-extrabold tracking-tight">Book a Service</h2>

              {/* Service Category Buttons */}
              <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 gap-1.5 p-1.5 bg-secondary rounded-xl text-center">
                <button
                  onClick={() => setSelectedServiceCategory('RIDE')}
                  className={`py-2 px-3 sm:px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center sm:flex-col gap-1.5 shrink-0 ${
                    selectedServiceCategory === 'RIDE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Car className="w-4 h-4 shrink-0" /> Ride
                </button>
                <button
                  onClick={() => setSelectedServiceCategory('PACKAGE')}
                  className={`py-2 px-3 sm:px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center sm:flex-col gap-1.5 shrink-0 ${
                    selectedServiceCategory === 'PACKAGE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" /> Package
                </button>
                <button
                  onClick={() => setSelectedServiceCategory('QUICK_COMMERCE')}
                  className={`py-2 px-3 sm:px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center sm:flex-col gap-1.5 shrink-0 ${
                    selectedServiceCategory === 'QUICK_COMMERCE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" /> Delivery
                </button>
                <button
                  onClick={() => setSelectedServiceCategory('BUSINESS')}
                  className={`py-2 px-3 sm:px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center sm:flex-col gap-1.5 shrink-0 ${
                    selectedServiceCategory === 'BUSINESS' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" /> Business
                </button>
                <button
                  onClick={() => setSelectedServiceCategory('SERVICE')}
                  className={`py-2 px-3 sm:px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center sm:flex-col gap-1.5 shrink-0 ${
                    selectedServiceCategory === 'SERVICE' ? 'bg-black text-white shadow-sm' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <Wrench className="w-4 h-4 shrink-0" /> Service
                </button>
              </div>

              {/* Connected Address Form */}
              <div className="space-y-4">
                <div className="relative pl-6 sm:pl-7 space-y-3">
                  <div className="absolute left-2.5 top-3.5 bottom-3.5 w-0.5 bg-slate-300 flex flex-col justify-between items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-black -ml-1"></div>
                    <div className="w-2.5 h-2.5 bg-emerald-600 -ml-1"></div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Pickup Location</label>
                    <input
                      type="text"
                      value={pickupText}
                      onChange={(e) => setPickupText(e.target.value)}
                      className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Drop-off Destination</label>
                    <input
                      type="text"
                      value={dropText}
                      onChange={(e) => setDropText(e.target.value)}
                      className="w-full bg-secondary border border-border px-3.5 py-2.5 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Available Vehicle Options & Fares */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Choose Option</label>
                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-semibold">Calculating routes and transparent fares...</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {estimates.map((est) => (
                      <div
                        key={est.serviceId}
                        onClick={() => setSelectedServiceId(est.serviceId)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          selectedServiceId === est.serviceId ? 'border-black bg-slate-50 shadow-sm' : 'border-border hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                            {est.serviceName.includes('Bike') ? '🛵' : est.serviceName.includes('Auto') ? '🛺' : '🚗'}
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-sm text-foreground truncate">{est.serviceName}</h4>
                            <p className="text-xs text-slate-500 truncate">{est.description} • ETA {est.etaMinutes} min</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-black">₹{est.fareBreakdown.finalFare}</span>
                          {est.fareBreakdown.surgeMultiplier > 1.0 && (
                            <span className="block text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {est.fareBreakdown.surgeMultiplier}x Surge
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleRequestBooking}
                disabled={loading}
                className="w-full bg-black text-white hover:bg-slate-800 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
              >
                Confirm Booking & Dispatch <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Route Map */}
        <div className="lg:col-span-7 h-[320px] sm:h-[450px] lg:h-[600px]">
          <InteractiveMap
            pickup={pickupLocation}
            dropoff={dropLocation}
            drivers={onlineDrivers}
            zones={demandZones}
            className="h-full w-full rounded-3xl border border-border shadow-xl"
          />
        </div>
      </main>

      {/* FLOATING GENAI COPILOT BUTTON */}
      <button
        onClick={() => setShowAiCopilot(!showAiCopilot)}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 bg-slate-900 text-white p-3 sm:p-3.5 rounded-full shadow-2xl z-40 border border-slate-700 hover:scale-105 transition-transform flex items-center gap-2 font-bold text-xs"
      >
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="inline">GenAI Assistant</span>
      </button>

      {/* GENAI COPILOT MODAL */}
      {showAiCopilot && (
        <div className="fixed bottom-16 left-4 right-4 sm:right-auto sm:left-6 w-auto sm:w-80 max-w-full bg-white rounded-3xl shadow-2xl border border-border z-50 overflow-hidden flex flex-col">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-xs">EasyRide GenAI Copilot</h4>
                <p className="text-[10px] text-slate-400">Powered by Google Gemini 1.5 Flash</p>
              </div>
            </div>
            <button onClick={() => setShowAiCopilot(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex-1 space-y-3 max-h-72 overflow-y-auto text-xs">
            {aiResponse ? (
              <div className="bg-slate-50 p-3 rounded-2xl border border-border space-y-1">
                <span className="font-bold text-emerald-600 text-[10px] block uppercase">GenAI Response</span>
                <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{aiResponse}</p>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-6 text-xs">
                Ask Gemini GenAI anything about optimal vehicle types, package shipping guidelines, or route ETAs!
              </div>
            )}
          </div>

          <form onSubmit={handleAskGenAI} className="p-3 border-t border-border bg-slate-50 flex gap-2">
            <input
              type="text"
              placeholder="Ask EasyRide GenAI AI Copilot..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 bg-white border border-border px-3 py-2 rounded-xl text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="bg-black text-white p-2 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
