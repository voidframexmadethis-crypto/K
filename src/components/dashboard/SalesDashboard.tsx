import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, TrendingUp, Clock, PieChart, FileText, AlertCircle, RefreshCcw, CheckCircle2, ChevronRight, X, MessageSquare, Send } from 'lucide-react';
import { Sale, Offer } from '../../types';
import { cn } from '../../lib/utils';

const mockSales: Sale[] = [
  { id: 's1', beatId: 'b1', customerId: 'c1', licenseType: 'basic', grossAmount: 29.99, netAmount: 26.50, fees: 3.49, currency: 'USD', status: 'completed', createdAt: '2026-10-02T14:30:00Z' },
  { id: 's2', beatId: 'b2', customerId: 'c2', licenseType: 'premium', grossAmount: 49.99, netAmount: 44.20, fees: 5.79, currency: 'USD', status: 'completed', createdAt: '2026-10-01T10:15:00Z' },
  { id: 's3', beatId: 'b1', customerId: 'c3', licenseType: 'unlimited', grossAmount: 99.99, netAmount: 88.50, fees: 11.49, currency: 'USD', status: 'completed', createdAt: '2026-09-30T18:45:00Z' },
  { id: 's4', beatId: 'b3', customerId: 'c4', licenseType: 'exclusive', grossAmount: 499.99, netAmount: 442.00, fees: 57.99, currency: 'USD', status: 'completed', createdAt: '2026-09-28T12:00:00Z' },
];

const mockOffers: Offer[] = [
  { id: 'o1', beatId: 'b1', customerId: 'c5', amount: 350.00, status: 'pending', message: 'I love this vibe, can we do $350 for exclusive?', createdAt: '2026-10-03T09:00:00Z' },
];

export const SalesDashboard = () => {
  const [currency, setCurrency] = useState('USD');
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [sales] = useState<Sale[]>(mockSales);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Subscriptions'>('Overview');

  const totalGross = sales.reduce((acc, sale) => acc + sale.grossAmount, 0);
  const totalNet = sales.reduce((acc, sale) => acc + sale.netAmount, 0);
  const totalFees = sales.reduce((acc, sale) => acc + sale.fees, 0);

  const licenseBreakdown = sales.reduce((acc, sale) => {
    acc[sale.licenseType] = (acc[sale.licenseType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleOfferAction = (id: string, action: Offer['status']) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: action } : o));
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Financial Command</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Sales, Revenue & Licensing Management</p>
        </div>
        <div className="flex gap-4">
           <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-sm">
              {['Overview', 'Subscriptions'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={cn(
                     "px-6 py-2 text-[8px] font-black uppercase tracking-widest transition-all",
                     activeTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
                   )}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <div className="h-full w-px bg-white/10 mx-4" />
           {['USD', 'EUR', 'GBP'].map(c => (
              <button 
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all",
                  currency === c ? "bg-white text-black border-white" : "border-white/10 text-white/40 hover:text-white"
                )}
              >
                {c}
              </button>
           ))}
        </div>
      </div>

      {activeTab === 'Overview' ? (
        <>
          {/* Primary Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Gross Revenue</span>
                <TrendingUp size={16} className="text-white/20 group-hover:text-white transition-colors" />
              </div>
              <span className="text-4xl font-black text-white tracking-tighter relative z-10">${totalGross.toFixed(2)}</span>
              <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest relative z-10">
                <ArrowUpRight size={10} className="text-emerald-500" /> +12% from last month
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={80} />
              </div>
            </div>

            <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Net Take-Home</span>
                <CheckCircle2 size={16} className="text-white/20 group-hover:text-white transition-colors" />
              </div>
              <span className="text-4xl font-black text-white tracking-tighter relative z-10">${totalNet.toFixed(2)}</span>
              <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest relative z-10">
                 Fees deducted: ${totalFees.toFixed(2)}
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={80} />
              </div>
            </div>

            <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Active Subscriptions</span>
                <Clock size={16} className="text-white/20 group-hover:text-white transition-colors" />
              </div>
              <span className="text-4xl font-black text-white tracking-tighter relative z-10">14</span>
              <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest relative z-10">
                $249.00 MRR (Recurring)
              </div>
            </div>

            <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Payout Status</span>
                <RefreshCcw size={16} className="text-white/20 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter relative z-10 uppercase">Processing</span>
              <div className="flex items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest relative z-10">
                Estimated arrival: Oct 05
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* License Breakdown */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">License Performance</h3>
                <PieChart size={18} className="text-white/20" />
              </div>
              <div className="p-10 border border-white/10 bg-white/[0.01] flex flex-col gap-8">
                <div className="space-y-6">
                  {(Object.entries(licenseBreakdown) as [Sale['licenseType'], number][]).map(([type, count]) => (
                    <div key={type} className="flex flex-col gap-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-white/40">{type}</span>
                          <span className="text-white">{count} Units</span>
                       </div>
                       <div className="h-1 bg-white/5 w-full">
                          <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(count / sales.length) * 100}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/5">
                   <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                      Data analyzed from {sales.length} transactions across 30 days.
                   </p>
                </div>
              </div>
            </div>

            {/* Sales Log */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Recent Transactions</h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">View All</button>
              </div>
              <div className="border border-white/10 bg-white/[0.01] overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                          <th className="p-6">Beat</th>
                          <th className="p-6">License</th>
                          <th className="p-6">Amount</th>
                          <th className="p-6">Status</th>
                          <th className="p-6">Date</th>
                       </tr>
                    </thead>
                    <tbody className="text-[10px] font-bold uppercase tracking-widest">
                       {sales.map(sale => (
                          <tr key={sale.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                             <td className="p-6 text-white">{sale.beatId === 'b1' ? 'APOLLO' : sale.beatId === 'b2' ? 'NIGHTFALL' : 'VALKYRIE'}</td>
                             <td className="p-6 text-white/60">{sale.licenseType}</td>
                             <td className="p-6 text-white">${sale.grossAmount}</td>
                             <td className="p-6">
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black">{sale.status}</span>
                             </td>
                             <td className="p-6 text-white/20">{new Date(sale.createdAt).toLocaleDateString()}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Pending Offers */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Pending Offers</h3>
                <span className="px-2 py-1 bg-white text-black text-[10px] font-black">{offers.filter(o => o.status === 'pending').length}</span>
              </div>
              <div className="space-y-4">
                 {offers.filter(o => o.status === 'pending').map(offer => (
                    <div key={offer.id} className="p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-6">
                       <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Beat: APOLLO</span>
                             <span className="text-2xl font-black text-white tracking-tighter">${offer.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                             <MessageSquare size={12} /> User #C5
                          </div>
                       </div>
                       <p className="text-[10px] text-white/60 leading-relaxed italic border-l border-white/20 pl-4">"{offer.message}"</p>
                       <div className="flex gap-4 pt-4 border-t border-white/5">
                          <button 
                            onClick={() => handleOfferAction(offer.id, 'accepted')}
                            className="flex-1 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleOfferAction(offer.id, 'countered')}
                            className="flex-1 py-3 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
                          >
                            Counter
                          </button>
                          <button 
                            onClick={() => handleOfferAction(offer.id, 'declined')}
                            className="p-3 border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X size={16} />
                          </button>
                       </div>
                    </div>
                 ))}
                 {offers.filter(o => o.status === 'pending').length === 0 && (
                    <div className="py-20 border border-dashed border-white/10 text-center">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">No active offers</span>
                    </div>
                 )}
              </div>
            </div>

            {/* Administration & Legal */}
            <div className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tighter text-white">Administration</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col gap-4 text-left group">
                     <FileText size={24} className="text-white/20 group-hover:text-white" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Tax Documents</span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">2026 Yearly Summary</span>
                     </div>
                  </button>
                  <button className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col gap-4 text-left group">
                     <AlertCircle size={24} className="text-white/20 group-hover:text-red-500" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Refund Log</span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">0 Active Disputes</span>
                     </div>
                  </button>
               </div>

               <div className="p-8 bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-white flex items-center justify-center">
                        <Clock size={24} className="text-black" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Hourly Sales Velocity</span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Peak buying hours analysis</span>
                     </div>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:translate-x-2 transition-transform" />
               </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
           <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col gap-4">
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Subscription Management</h3>
                 <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">Monitor and manage recurring revenue from artist memberships and custom sound kit plans.</p>
              </div>

              <div className="border border-white/10 bg-white/[0.01] overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                          <th className="p-6">Subscriber</th>
                          <th className="p-6">Plan</th>
                          <th className="p-6">MRR</th>
                          <th className="p-6">Next Billing</th>
                          <th className="p-6 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="text-[10px] font-bold uppercase tracking-widest">
                       {[
                         { user: 'Artist #A12', plan: 'Gold Producer', mrr: 29.99, next: '2026-10-15', status: 'Active' },
                         { user: 'Studio #S4', plan: 'Platinum Bundle', mrr: 59.99, next: '2026-10-18', status: 'Active' },
                         { user: 'DrillKing', plan: 'Gold Producer', mrr: 29.99, next: '2026-11-02', status: 'Pending' },
                       ].map((sub, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                             <td className="p-6 text-white uppercase">{sub.user}</td>
                             <td className="p-6 text-white/60">{sub.plan}</td>
                             <td className="p-6 text-white">${sub.mrr}</td>
                             <td className="p-6 text-white/20">{sub.next}</td>
                             <td className="p-6 text-right">
                                <span className={cn("px-2 py-1 text-[8px] font-black", sub.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>{sub.status}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="p-10 border border-white/10 bg-white/[0.01] flex flex-col gap-6">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Subscription Health</span>
                 <div className="flex items-end justify-between">
                    <span className="text-4xl font-black text-white">92%</span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">+2.1% Retention</span>
                 </div>
                 <div className="h-1 bg-white/5 w-full">
                    <div className="h-full bg-white w-[92%]" />
                 </div>
              </div>

              <button className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all">Export Subscription Data</button>
           </div>
        </div>
      )}
    </div>
  );
};
