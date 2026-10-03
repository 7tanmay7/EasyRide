import React from 'react';
import { Navbar } from '../components/Navigation/Navbar';
import { useAppStore } from '../store/useAppStore';
import { User, Wallet, CreditCard, Shield, Mail, Phone } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAppStore();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-border shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black text-white rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">{currentUser.name}</h1>
            <p className="text-xs text-slate-500 font-semibold">{currentUser.role} Account</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 shrink-0" /> {currentUser.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0" /> {currentUser.phone}</span>
            </div>
          </div>
        </div>

        {/* EasyRide Wallet */}
        <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-3xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <h3 className="font-extrabold text-base sm:text-lg">EasyRide Pay Wallet</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Available Balance</span>
            <span className="text-2xl sm:text-3xl font-black text-white">₹1,450.00</span>
          </div>
          <div className="pt-2 flex flex-col xs:flex-row gap-3 text-xs">
            <button className="w-full xs:w-auto bg-white text-black px-4 py-2.5 rounded-xl font-bold hover:bg-slate-100 text-center">Add Money (UPI / Razorpay)</button>
          </div>
        </div>
      </main>
    </div>
  );
};
