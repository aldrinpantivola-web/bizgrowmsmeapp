import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  ArrowRight, 
  AlertTriangle,
  Lightbulb,
  History,
  RotateCcw,
  Zap,
  Info,
  ChefHat,
  Truck,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';

import { BusinessState } from './types';
import { 
  INITIAL_CASH, 
  BASE_PRODUCT_COST, 
  INITIAL_PRODUCT_PRICE,
  UPGRADES 
} from './constants';
import { getBusinessAdvice } from './services/advisor';

export default function App() {
  const [state, setState] = useState<BusinessState>(() => {
    return {
      cash: INITIAL_CASH,
      inventory: 30,
      maxInventory: 100,
      reputation: 50,
      day: 1,
      dailyRent: 25,
      dailyStaffCost: 15,
      productPrice: INITIAL_PRODUCT_PRICE,
      marketingLevel: 1,
      qualityLevel: 1,
      isGameOver: false,
      history: [{ day: 1, cash: INITIAL_CASH, sales: 0 }],
      logs: ["Welcome to BizGrow! Your goal is to grow your small business. Watch your cash flow!"],
    };
  });

  const [advice, setAdvice] = useState<string>("Small businesses often fail due to poor cash management. Maintain at least 2 days worth of expenses in cash.");
  const [isSimulating, setIsSimulating] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdvice();
  }, [state.day]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.logs]);

  const fetchAdvice = async () => {
    if (state.day === 1) return;
    try {
      const tip = await getBusinessAdvice(state);
      if (tip) setAdvice(tip);
    } catch (e) {
      console.error("Advice fetch failed", e);
    }
  };

  const addLog = (msg: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-49), msg]
    }));
  };

  const buyInventory = (amount: number) => {
    const cost = amount * BASE_PRODUCT_COST;
    if (state.cash < cost) {
      addLog("⚠️ Insufficient funds for inventory!");
      return;
    }
    if (state.inventory + amount > state.maxInventory) {
      addLog("⚠️ Storage limit reached! Upgrade your facility.");
      return;
    }

    setState(prev => ({
      ...prev,
      cash: prev.cash - cost,
      inventory: prev.inventory + amount
    }));
    addLog(`📦 Procured ${amount} units for $${cost}.`);
  };

  const upgradeMarketing = () => {
    const cost = UPGRADES.MARKETING.baseCost * state.marketingLevel;
    if (state.cash < cost) {
      addLog("⚠️ Can't afford marketing campaign!");
      return;
    }
    setState(prev => ({
      ...prev,
      cash: prev.cash - cost,
      marketingLevel: prev.marketingLevel + 1
    }));
    addLog("📣 Marketing level increased! Customer traffic boosted.");
  };

  const nextDay = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    
    // Quick animation delay
    setTimeout(() => {
      setState(prev => {
        // Demand Calculation
        const baseTraffic = 10 + (prev.marketingLevel * 8);
        const repFactor = prev.reputation / 50;
        const totalTraffic = Math.floor(baseTraffic * repFactor);
        
        // Price Sensitivity: Higher price = lower demand
        const priceSensitivity = prev.productPrice > 50 ? (prev.productPrice - 50) / 70 : 0;
        const purchaseRate = Math.max(0.1, 0.8 - priceSensitivity);
        
        const possibleSales = Math.floor(totalTraffic * purchaseRate);
        const actualSales = Math.min(prev.inventory, possibleSales);
        
        const revenue = actualSales * prev.productPrice;
        const expenses = prev.dailyRent + prev.dailyStaffCost;
        const netProfit = revenue - expenses;
        const newCash = prev.cash + netProfit;

        // Reputation change based on pricing and availability
        let repChange = 0;
        if (prev.productPrice > 100) repChange -= 3;
        else if (prev.productPrice > 70) repChange -= 1;
        else if (prev.productPrice < 40) repChange += 2;
        
        // Stockout penalty
        if (possibleSales > prev.inventory) repChange -= 2; 

        const newRep = Math.min(100, Math.max(0, prev.reputation + repChange));
        const newDay = prev.day + 1;
        const newHistory = [...prev.history, { day: newDay, cash: newCash, sales: actualSales }];
        
        const gameOver = newCash <= 0;

        return {
          ...prev,
          cash: newCash,
          inventory: Math.max(0, prev.inventory - actualSales),
          day: newDay,
          reputation: newRep,
          history: newHistory,
          isGameOver: gameOver,
          logs: [...prev.logs, `Day ${prev.day}: 💰 Rev: $${revenue} | 💸 Exp: $${expenses} | 📈 Sales: ${actualSales}.`]
        };
      });
      setIsSimulating(false);
    }, 800);
  };

  const resetGame = () => {
    setState({
      cash: INITIAL_CASH,
      inventory: 30,
      maxInventory: 100,
      reputation: 50,
      day: 1,
      dailyRent: 25,
      dailyStaffCost: 15,
      productPrice: INITIAL_PRODUCT_PRICE,
      marketingLevel: 1,
      qualityLevel: 1,
      isGameOver: false,
      history: [{ day: 1, cash: INITIAL_CASH, sales: 0 }],
      logs: ["Business restarted. Focus on balancing supply and demand!"],
    });
  };

  if (state.isGameOver) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-slate-700"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">BANKRUPT</h1>
          <p className="text-slate-400 mb-8 font-mono">Your business survived for {state.day} days.</p>
          <button 
            onClick={resetGame}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <RotateCcw className="w-6 h-6" />
            START OVER
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-200">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">BIZGROW</h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-1">MSME Business Simulation v1.2</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Current Capital</span>
            <span className="text-2xl font-mono font-black text-emerald-600">${state.cash.toFixed(2)}</span>
          </div>
          <div className="w-px h-10 bg-slate-100 hidden md:block" />
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Business Day</span>
            <span className="text-2xl font-mono font-black text-slate-800">{state.day}</span>
          </div>
        </div>
      </header>

      {/* Main Bento Grid */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 grid-rows-none md:grid-rows-6 gap-6 overflow-y-auto custom-scrollbar">
        
        {/* Marketplace Performance (Bento Large) */}
        <div className="md:col-span-8 md:row-span-4 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-black tracking-tight">Market Performance</h2>
              <p className="text-xs text-slate-400 mt-1">Daily unit sales vs. cash balance</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase text-slate-400">Cash Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold uppercase text-slate-400">Unit Sales</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <ChartTooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  labelFormatter={(val) => `Business Day ${val}`}
                />
                <Line type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={4} dot={false} animationDuration={1000} />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} dot={false} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-6 relative z-10">
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:scale-105 transition-transform">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Reputation</span>
              <p className="text-2xl font-black text-indigo-600 font-mono">{state.reputation}%</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:scale-105 transition-transform">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Conversion</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">{(state.reputation * 0.8).toFixed(1)}%</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:scale-105 transition-transform">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Inventory</span>
              <p className="text-2xl font-black text-slate-800 font-mono">{state.inventory}</p>
            </div>
          </div>
        </div>

        {/* Pricing Strategy (Bento Medium) */}
        <div className="md:col-span-4 md:row-span-3 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Zap className="w-5 h-5" /></div>
            <h2 className="text-lg font-black tracking-tight">Price Control</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Price Per Unit</p>
              <div className="text-6xl font-mono font-black text-slate-800 tracking-tighter">${state.productPrice}</div>
            </div>
            
            <input 
              type="range" 
              min="10" 
              max="200" 
              step="5"
              value={state.productPrice}
              onChange={(e) => setState(prev => ({ ...prev, productPrice: parseInt(e.target.value) }))}
              className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-6"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase px-1">
              <span>Budget ($10)</span>
              <span>Premium ($200)</span>
            </div>
          </div>
        </div>

        {/* Supply Chain (Bento Medium) */}
        <div className="md:col-span-4 md:row-span-3 bg-slate-900 border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 text-white flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-xl text-white"><Package className="w-5 h-5" /></div>
            <h2 className="text-lg font-black tracking-tight">Procurement</h2>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 gap-4">
              {[10, 25, 50].map(qty => (
                <button 
                  key={qty}
                  onClick={() => buyInventory(qty)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl flex items-center justify-between px-6 transition-all group active:scale-95"
                >
                  <div className="text-left">
                    <span className="block text-xl font-black font-mono">+{qty} Units</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Inventory Stock</span>
                  </div>
                  <div className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-xs font-black">
                    ${qty * BASE_PRODUCT_COST}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Tip (Bento Small) */}
        <div className="md:col-span-5 md:row-span-2 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-8 flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
            <Lightbulb className="w-20 h-20 text-amber-600" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><Lightbulb className="w-5 h-5" /></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-800">Strategy Advisor</h2>
          </div>
          <p className="text-sm font-medium text-amber-900 leading-relaxed relative z-10 italic">
            "{advice}"
          </p>
        </div>

        {/* Operational Log (Bento Medium) */}
        <div className="md:col-span-4 md:row-span-2 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-200 rounded-xl text-slate-500"><History className="w-5 h-5" /></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Log</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] custom-scrollbar pr-2">
            {[...state.logs].reverse().map((log, i) => (
              <div key={i} className="text-slate-600 border-l-2 border-slate-200 pl-3 py-0.5">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Execute Day (Bento Medium/CTA) */}
        <div className="md:col-span-3 md:row-span-2 bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-200 flex flex-col justify-center items-center text-white text-center cursor-pointer hover:bg-slate-900 hover:shadow-slate-200 group transition-all active:scale-95"
          onClick={nextDay}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            {isSimulating ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-8 h-8 text-white" />
            )}
          </div>
          <h3 className="text-xl font-black mb-1">
            {isSimulating ? 'Processing...' : `Start Day ${state.day}`}
          </h3>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Complete Strategy Phase</p>
        </div>

      </main>

      {/* Footer Utility */}
      <footer className="px-8 py-5 bg-white border-t border-slate-100 flex justify-between items-center z-20">
        <div className="flex gap-4">
          <button onClick={resetGame} className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900">
            <RotateCcw className="w-3 h-3" />
            RESTART SIMULATION
          </button>
        </div>
        <div className="flex items-center gap-2 opacity-30 group">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900 transition-colors">BIZGROW CORE SYSTEM</span>
          <div className="w-2 h-2 rounded-full bg-slate-400" />
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
        
        /* Modern Range Input Styling */
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #6366f1;
          border-radius: 50%;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
}
