import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { OrderRecord, recordStoreOrder } from '../../services/analyticsService';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const SpreadsheetLedger = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // New Manual Order Form
  const [manualForm, setManualForm] = useState({
    customerEmail: '',
    beatTitle: '',
    licenseType: 'Basic Lease',
    amount: '29.99',
    paymentGateway: 'PayPal' as const,
    status: 'Completed' as const,
  });

  // Subscribe to real-time orders collection in Firestore
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: OrderRecord[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrderRecord[];
      setOrders(fetched);
      setLoading(false);
    }, (error) => {
      console.warn('Orders snapshot fallback:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.beatTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.downloadKey || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLicense = licenseFilter === 'ALL' || order.licenseType === licenseFilter;
    return matchesSearch && matchesLicense;
  });

  // Aggregate stats
  const totalGross = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalCompleted = orders.filter(o => o.status === 'Completed').length;
  const avgOrderValue = orders.length > 0 ? (totalGross / orders.length).toFixed(2) : '0.00';

  // Export ledger to CSV
  const exportToCSV = () => {
    if (orders.length === 0) {
      alert('No ledger records available to export.');
      return;
    }

    const headers = ['Order ID', 'Date/Time', 'Customer Email', 'Beat Title', 'License Type', 'Amount ($)', 'Gateway', 'Status', 'Download Key'];
    const rows = orders.map(o => [
      o.id || '',
      o.timestamp?.toDate ? o.timestamp.toDate().toISOString() : new Date().toISOString(),
      `"${o.customerEmail || ''}"`,
      `"${o.beatTitle || ''}"`,
      `"${o.licenseType || ''}"`,
      o.amount || 0,
      o.paymentGateway || '',
      o.status || '',
      o.downloadKey || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kraezelvbeatz_store_sales_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import handler
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) return;

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 4) {
            await recordStoreOrder({
              customerEmail: cols[2] || cols[0] || 'imported_client@kraezelvbeatz.com',
              beatId: 'imported_beat',
              beatTitle: cols[3] || cols[1] || 'Imported Track',
              licenseType: cols[4] || 'Basic Lease',
              amount: parseFloat(cols[5] || cols[2] || '29.99') || 29.99,
              paymentGateway: 'PayPal',
              status: 'Completed',
              downloadKey: `IMP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            });
            importedCount++;
          }
        }
        setImportStatus(`Successfully imported ${importedCount} transaction rows into live store ledger.`);
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        alert('Failed to parse CSV file. Please ensure valid columns.');
      }
    };
    reader.readAsText(file);
  };

  // Submit manual transaction
  const handleAddManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordStoreOrder({
        customerEmail: manualForm.customerEmail || 'direct_sale@kraezelvbeatz.com',
        beatId: 'manual_entry',
        beatTitle: manualForm.beatTitle || 'Custom Lease Track',
        licenseType: manualForm.licenseType,
        amount: parseFloat(manualForm.amount) || 0,
        paymentGateway: manualForm.paymentGateway,
        status: manualForm.status,
        downloadKey: `KZB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      });
      setShowAddModal(false);
      setManualForm({
        customerEmail: '',
        beatTitle: '',
        licenseType: 'Basic Lease',
        amount: '29.99',
        paymentGateway: 'PayPal',
        status: 'Completed',
      });
    } catch (err) {
      alert('Error recording transaction.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Quick Financial Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileSpreadsheet className="text-emerald-400" size={28} />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Live Store Sales Ledger</h2>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
              Real-Time Firestore Grid
            </span>
          </div>
          <p className="text-white/50 text-xs tracking-wider">
            Real sales records, direct spreadsheet views, transaction keys, and automated accounting exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all">
            <Upload size={15} className="text-emerald-400" />
            Import CSV
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>

          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all"
          >
            <Download size={15} />
            Export CSV
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-white/90 transition-all"
          >
            <Plus size={15} />
            New Transaction
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-3">
          <CheckCircle2 size={18} />
          {importStatus}
        </div>
      )}

      {/* Real-time Financial Ledger Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border border-white/10 bg-black/60 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gross Store Revenue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 tabular-nums">${totalGross.toFixed(2)}</span>
            <span className="text-[9px] text-white/40 uppercase">Real Ledger</span>
          </div>
        </div>

        <div className="p-5 border border-white/10 bg-black/60 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Completed Orders</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tabular-nums">{totalCompleted}</span>
            <span className="text-[9px] text-emerald-500 uppercase font-bold">Verified</span>
          </div>
        </div>

        <div className="p-5 border border-white/10 bg-black/60 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Avg Order Value (AOV)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tabular-nums">${avgOrderValue}</span>
            <span className="text-[9px] text-white/40 uppercase">Per Cart</span>
          </div>
        </div>

        <div className="p-5 border border-white/10 bg-black/60 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Database Status</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Firestore Live Sync</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-white/10 bg-white/[0.02]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text"
            placeholder="Search email, beat title, download key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/80 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Filter size={15} className="text-white/40" />
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="bg-black/80 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
          >
            <option value="ALL">All License Types</option>
            <option value="Basic Lease">Basic Lease ($29.99)</option>
            <option value="Premium WAV">Premium WAV ($79.99)</option>
            <option value="Unlimited Stems">Unlimited Stems ($199.99)</option>
            <option value="Exclusive Rights">Exclusive Rights ($499.99)</option>
          </select>
        </div>
      </div>

      {/* Interactive Spreadsheet Grid View */}
      <div className="border border-white/10 bg-black/90 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/15 bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-white/60 select-none">
              <th className="p-3 border-r border-white/10 w-12 text-center text-white/30">#</th>
              <th className="p-3 border-r border-white/10 min-w-[140px]">Transaction ID</th>
              <th className="p-3 border-r border-white/10 min-w-[180px]">Customer Email</th>
              <th className="p-3 border-r border-white/10 min-w-[200px]">Beat / Item Title</th>
              <th className="p-3 border-r border-white/10 min-w-[140px]">License Tier</th>
              <th className="p-3 border-r border-white/10 min-w-[110px] text-right">Amount ($)</th>
              <th className="p-3 border-r border-white/10 min-w-[120px]">Gateway</th>
              <th className="p-3 border-r border-white/10 min-w-[120px]">Status</th>
              <th className="p-3 min-w-[140px]">Download Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs text-white/90">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-white/40 text-xs uppercase tracking-widest">
                  Loading store sales ledger from Firestore...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-white/40 text-xs uppercase tracking-widest">
                  {orders.length === 0 ? 'Ledger empty. New store purchases and manual entries will appear here in real-time.' : 'No matching sales records found.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, idx) => (
                <tr key={order.id || idx} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-3 border-r border-white/10 text-center text-white/30 font-bold">{idx + 1}</td>
                  <td className="p-3 border-r border-white/10 text-white/70 text-[11px] truncate max-w-[140px]">{order.id || 'OFFLINE-001'}</td>
                  <td className="p-3 border-r border-white/10 text-emerald-400 font-semibold">{order.customerEmail}</td>
                  <td className="p-3 border-r border-white/10 font-bold text-white">{order.beatTitle}</td>
                  <td className="p-3 border-r border-white/10">
                    <span className="px-2 py-0.5 bg-white/10 border border-white/20 text-[10px] uppercase tracking-wider text-white">
                      {order.licenseType}
                    </span>
                  </td>
                  <td className="p-3 border-r border-white/10 text-right font-black text-emerald-400">${Number(order.amount).toFixed(2)}</td>
                  <td className="p-3 border-r border-white/10 text-white/70 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-white/40" />
                    {order.paymentGateway}
                  </td>
                  <td className="p-3 border-r border-white/10">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                      order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-white/50 text-[10px] uppercase font-mono tracking-wider">
                    {order.downloadKey}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Order Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-black border border-white/20 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Plus size={20} className="text-emerald-400" />
                Record Manual Sale / Custom Invoice
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddManualOrder} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Customer Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="artist@recordlabel.com"
                  value={manualForm.customerEmail}
                  onChange={(e) => setManualForm({...manualForm, customerEmail: e.target.value})}
                  className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Beat / Item Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Midnight Phantom (BPM 140)"
                  value={manualForm.beatTitle}
                  onChange={(e) => setManualForm({...manualForm, beatTitle: e.target.value})}
                  className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">License Tier</label>
                  <select
                    value={manualForm.licenseType}
                    onChange={(e) => setManualForm({...manualForm, licenseType: e.target.value})}
                    className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Basic Lease">Basic Lease ($29.99)</option>
                    <option value="Premium WAV">Premium WAV ($79.99)</option>
                    <option value="Unlimited Stems">Unlimited Stems ($199.99)</option>
                    <option value="Exclusive Rights">Exclusive Rights ($499.99)</option>
                    <option value="Custom Contract">Custom Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({...manualForm, amount: e.target.value})}
                    className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Payment Gateway</label>
                  <select
                    value={manualForm.paymentGateway}
                    onChange={(e) => setManualForm({...manualForm, paymentGateway: e.target.value as any})}
                    className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-white"
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Apple Pay">Apple Pay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({...manualForm, status: e.target.value as any})}
                    className="w-full bg-black border border-white/20 p-2.5 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/20 text-white font-bold uppercase text-[10px] hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-500 text-black font-black uppercase text-[10px] hover:bg-emerald-400"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
