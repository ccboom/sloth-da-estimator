'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, TrendingDown, Database, AlertCircle, ArrowDown, Layers, Leaf } from 'lucide-react';
// 引入 Image 组件用于全屏背景
import Image from 'next/image';

// ============================================
// 常量定义
// ============================================
const BLOB_SIZE_BYTES = 128 * 1024; 
const GAS_PER_BLOB = 131072; 
const BLOB_BASE_COST = 8192; 

const CELESTIA_SHARE_SIZE = 512;
const CELESTIA_GAS_PER_SHARE = 80;
const CELESTIA_FIXED_GAS = 65000;

// 工具函数
const formatGwei = (wei: number) => (Number(wei) / 1e9).toFixed(2);
const formatEther = (wei: number) => Number(wei) / 1e18;

export default function App() {
  // 状态管理
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataSizeKB, setDataSizeKB] = useState(1024);
  const [unit, setUnit] = useState<'MB' | 'KB'>('MB');
  
  const [marketData, setMarketData] = useState({
    ethPrice: 3500,
    tiaPrice: 5.0,
    ethBaseFee: 15000000000,
    blobMarketPrice: 1,
    tiaGasPrice: 0.004,
    lastUpdated: null as string | null,
  });

  // ============================================
  // 数据获取逻辑
  // ============================================
  const fetchLocalData = useCallback(async (isRefreshBtn = false) => {
    if (isRefreshBtn) {
        setLoading(true);
    }
    try {
      const res = await fetch('/api/market-data');
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      }
    } catch (e) {
      console.error("Failed to fetch backend data", e);
    } finally {
      setLoading(false);
      // 模拟一点延迟，让用户能欣赏到你的背景图 (可选，如果不想要延迟可以去掉 setTimeout)
      setTimeout(() => setInitialLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchLocalData();
  }, [fetchLocalData]);

  // ============================================
  // 计算逻辑
  // ============================================
  const reservePrice = Math.floor((BLOB_BASE_COST * marketData.ethBaseFee) / GAS_PER_BLOB);
  const effectiveBlobPrice = Math.max(marketData.blobMarketPrice, reservePrice);

  const dataBytes = dataSizeKB * 1024;
  const blobCount = Math.ceil(dataBytes / BLOB_SIZE_BYTES);
  const ethCostWei = blobCount * GAS_PER_BLOB * effectiveBlobPrice;
  const ethCostEth = formatEther(ethCostWei);
  const ethCostUsd = ethCostEth * marketData.ethPrice;

  const celestiaShareCount = Math.ceil(dataBytes / CELESTIA_SHARE_SIZE);
  const celestiaTotalGas = celestiaShareCount * CELESTIA_GAS_PER_SHARE + CELESTIA_FIXED_GAS;
  const celestiaCostUtia = celestiaTotalGas * marketData.tiaGasPrice;
  const celestiaCostTia = celestiaCostUtia / 1_000_000;
  const celestiaCostUsd = celestiaCostTia * marketData.tiaPrice;

  const savingsUsd = ethCostUsd - celestiaCostUsd;
  const savingsPercent = ethCostUsd > 0 ? (savingsUsd / ethCostUsd) * 100 : 0;
  const multiplier = celestiaCostUsd > 0 ? ethCostUsd / celestiaCostUsd : 0;

  // ============================================
  // 滑块逻辑
  // ============================================
  const isMB = unit === 'MB';
  const sliderMax = isMB ? 128 : 2048; 
  const sliderValue = isMB ? dataSizeKB / 1024 : dataSizeKB;
  const sliderStep = 1; 

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const safeVal = val > 0 ? val : 1;
    if (isMB) {
      setDataSizeKB(safeVal * 1024);
    } else {
      setDataSizeKB(safeVal);
    }
  };

  const formatMoney = (val: number) => {
    if (val < 0.0001) return `$${val.toFixed(6)}`;
    if (val < 0.01) return `$${val.toFixed(4)}`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-700 selection:text-white p-4 md:p-8 flex flex-col items-center relative">
      
      {/* ================= 改动1: 全屏背景加载蒙版 ================= */}
      {initialLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700">
            {/* 1. 背景图片层 */}
            <div className="absolute inset-0 z-0">
                {/* 请确保在 public 文件夹下有一张名为 bg.jpg 的图片 
                   brightness-[0.25] 会让图片变暗，确保文字清晰
                */}
                 {/* 如果报错 Image 未找到，请检查 import { Image } form 'next/image'
                   或者直接用 <img src="/bg.jpg" className="w-full h-full object-cover brightness-[0.25]" />
                 */}
                 <img 
                   src="/home.gif" 
                   alt="Sloth Background" 
                   className="w-full h-full object-cover brightness-[0.25]"
                 />
            </div>

            {/* 2. 内容层 (浮在背景之上) */}
            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-32 h-32 mb-6 rounded-full bg-stone-800/50 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                   <span className="text-6xl animate-bounce">🦥</span>
                </div>
                <h2 className="text-4xl font-bold text-amber-100 tracking-wide drop-shadow-lg">Sloth Estimator</h2>
                <div className="mt-4 flex items-center gap-3 text-stone-300 bg-stone-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-stone-700/50">
                  <RefreshCw size={18} className="animate-spin text-amber-500" />
                  <span className="text-sm font-medium tracking-wider">Loading Market Data...</span>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl w-full mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-500 flex items-center gap-3 drop-shadow-sm">
            <Leaf className="text-amber-500" size={32} />
            Sloth DA Cost Estimator
          </h1>
          <p className="text-stone-400 text-sm mt-2 flex items-center gap-2">
            <span className="bg-stone-800 px-3 py-1 rounded-full text-xs border border-stone-700 text-amber-200/80">Live Prices</span>
            <span className="bg-stone-800 px-3 py-1 rounded-full text-xs border border-stone-700 text-amber-200/80">Max 128MB</span>
          </p>
        </div>
        
        <button 
          onClick={() => fetchLocalData(true)}
          disabled={loading || initialLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 rounded-xl transition-all border border-stone-700 text-sm font-medium text-amber-100/90 hover:text-white hover:border-amber-700/50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={(loading || initialLoading) ? "animate-spin" : ""} />
          {(loading || initialLoading) ? "Updating..." : "Refresh Prices"}
        </button>
      </div>

      {/* Market Ticker */}
      <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <TickerItem icon="Ξ" color="text-amber-500" label="ETH Price" value={`$${marketData.ethPrice.toLocaleString()}`} />
        <TickerItem icon="T" color="text-orange-500" label="TIA Price" value={`$${marketData.tiaPrice.toLocaleString()}`} />
        <TickerItem 
          icon="⛽"
          label="ETH Base Fee" 
          value={`${formatGwei(marketData.ethBaseFee)} gwei`} 
          subValue={`Reserve: ${formatGwei(reservePrice)} gwei`}
        />
        <TickerItem icon="🔥" label="TIA Gas" value={`${marketData.tiaGasPrice} utia`} />
      </div>

      {/* Main Calculation Area */}
      <div className="max-w-5xl w-full flex flex-col gap-6 relative flex-grow">
        
        {/* Savings Badge */}
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 md:top-32 z-20 flex justify-center my-4 md:my-0">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-6 py-2 rounded-full shadow-[0_4px_20px_rgba(5,150,105,0.4)] flex items-center gap-3 border-2 border-stone-900 transform hover:scale-105 transition-transform">
             <ArrowDown size={20} strokeWidth={3} className="animate-bounce" />
             <span className="text-lg tracking-wider">SAVE {savingsPercent.toFixed(0)}%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {/* Left: Ethereum */}
            <div className="rounded-3xl border border-amber-900/30 shadow-2xl overflow-hidden relative bg-gradient-to-br from-stone-950 to-amber-950/20">
                <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-amber-700/30 text-amber-300 flex items-center justify-center font-bold text-xl border border-amber-600/50">Ξ</div>
                        <h2 className="font-bold text-2xl text-amber-100">Ethereum Blob</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="text-stone-400 text-sm mb-1 flex items-center gap-1">
                                <Layers size={16} /> Required Blobs
                            </div>
                            <div className="text-3xl font-mono text-white font-bold">{blobCount}</div>
                        </div>
                        <div className="pt-6 border-t border-amber-900/30">
                            <div className="text-stone-400 text-sm mb-1">Estimated Cost</div>
                            <div className="text-4xl md:text-5xl font-bold text-amber-200 tracking-tight truncate">
                                {formatMoney(ethCostUsd)}
                            </div>
                             <div className="text-amber-500/70 font-mono text-sm mt-2">
                                ≈ {Number(ethCostEth).toFixed(6)} ETH
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Celestia */}
            <div className="rounded-3xl border border-orange-900/30 shadow-2xl overflow-hidden relative bg-gradient-to-bl from-stone-950 to-orange-950/20">
                <div className="p-6 md:p-8 md:text-right flex flex-col items-end">
                    <div className="flex items-center gap-3 mb-6 md:flex-row-reverse">
                        <div className="w-10 h-10 rounded-full bg-orange-700/30 text-orange-300 flex items-center justify-center font-bold text-sm border border-orange-600/50">TIA</div>
                        <h2 className="font-bold text-2xl text-orange-100">Celestia DA</h2>
                    </div>
                    <div className="space-y-6 w-full">
                        <div>
                            <div className="text-stone-400 text-sm mb-1 flex items-center gap-1 justify-end">
                                <Database size={16} /> Total Shares
                            </div>
                            <div className="text-3xl font-mono text-white font-bold">{celestiaShareCount.toLocaleString()}</div>
                        </div>
                        <div className="pt-6 border-t border-orange-900/30">
                            <div className="text-stone-400 text-sm mb-1">Estimated Cost</div>
                            <div className="text-4xl md:text-5xl font-bold text-emerald-400 tracking-tight truncate">
                                {formatMoney(celestiaCostUsd)}
                            </div>
                            <div className="text-orange-500/70 font-mono text-sm mt-2">
                                ≈ {celestiaCostTia.toFixed(6)} TIA
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls Section */}
        <div className="bg-stone-950/80 rounded-3xl p-6 md:p-8 border border-stone-800 shadow-xl flex flex-col items-center z-30">
          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                 <label className="text-stone-300 font-medium flex items-center gap-2">
                    <Database size={18} className="text-amber-500"/> 
                    Data Size to Post
                 </label>
                <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800">
                    <button
                    onClick={() => setUnit('KB')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        !isMB ? 'bg-amber-700 text-white shadow-md' : 'text-stone-500 hover:text-stone-300'
                    }`}
                    >
                    KB
                    </button>
                    <button
                    onClick={() => setUnit('MB')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        isMB ? 'bg-orange-700 text-white shadow-md' : 'text-stone-500 hover:text-stone-300'
                    }`}
                    >
                    MB
                    </button>
                </div>
            </div>

            <div className="w-full relative h-14 flex items-center justify-center group">
                 <div className="absolute w-full h-4 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-150"
                        style={{ width: `${(sliderValue / sliderMax) * 100}%` }}
                    ></div>
                 </div>
                 <input
                    type="range"
                    min="1"
                    max={sliderMax}
                    step={sliderStep}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-full h-4 absolute opacity-0 cursor-pointer z-10"
                />
                 <div 
                    className="absolute h-8 w-8 bg-stone-100 rounded-full border-4 border-amber-600 shadow-[0_2px_10px_rgba(217,119,6,0.5)] top-1/2 -translate-y-1/2 -ml-4 pointer-events-none transition-all duration-150 group-hover:scale-110 flex items-center justify-center"
                    style={{ left: `${(sliderValue / sliderMax) * 100}%` }}
                >
                    <div className="w-2 h-2 bg-amber-800 rounded-full"></div>
                </div>
            </div>
            
            <div className="text-center mt-4 flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-white font-mono tracking-tighter">
                {sliderValue.toLocaleString()}
                </span>
                <span className="text-amber-400 font-bold text-xl">{unit}</span>
                <span className="text-sm text-stone-500 ml-3 border-l border-stone-700 pl-3">
                ≈ {isMB ? (dataSizeKB).toLocaleString() + ' KB' : (dataSizeKB / 1024).toFixed(2) + ' MB'}
                </span>
            </div>
          </div>
        </div>

        {/* Summary Boxes */}
        <div className="w-full grid md:grid-cols-2 gap-4">
            <FooterItem 
                icon={<TrendingDown size={24} />}
                bgColor="bg-emerald-500/10"
                iconColor="text-emerald-400"
                label="Total Savings per Post"
                value={formatMoney(savingsUsd)}
            />
            <FooterItem 
                icon={<AlertCircle size={24} />}
                bgColor="bg-amber-500/10"
                iconColor="text-amber-400"
                label="Efficiency Ratio"
                value={multiplier > 1000 ? "> 1,000x Cheaper" : `${multiplier.toFixed(1)}x Cheaper`}
            />
        </div>
      </div>

      {/* ================= 改动2: 社区署名 Footer ================= */}
      <footer className="mt-12 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-6 py-6 border-t border-stone-800/50">
          
          {/* Logo / Name */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦥</span>
            <span className="text-stone-400 text-sm font-medium tracking-wide">
              Made by ccboomer_ in  <span className="text-amber-500 font-bold">CelestineSloths</span> Community
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-4 bg-stone-700"></div>

          {/* Social Icons (使用 SVG 确保图标准确) */}
          <div className="flex items-center gap-4">
             {/* Twitter (X) Link */}
             <a 
               href="https://x.com/CelestineSloths" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-stone-500 hover:text-amber-400 transition-colors"
               aria-label="Twitter"
             >
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
               </svg>
             </a>

             {/* Discord Link */}
             <a 
               href="https://discord.gg/EfSaAtZH" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-stone-500 hover:text-indigo-400 transition-colors"
               aria-label="Discord"
             >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.46 13.46 0 0 0-.589 1.222 18.375 18.375 0 0 0-5.526 0 13.46 13.46 0 0 0-.59-1.222.074.074 0 0 0-.078-.037 19.782 19.782 0 0 0-4.885 1.515.071.071 0 0 0-.03.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
             </a>
          </div>
      </footer>

    </div>
  );
}

// 子组件保持不变
function TickerItem({ label, value, subValue, icon, color }: any) {
  return (
    <div className="bg-stone-950/50 rounded-2xl p-4 border border-stone-800/50 backdrop-blur-sm hover:bg-stone-900/80 transition-colors flex flex-col gap-1">
      <div className="text-xs text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className={color}>{icon}</span>}
        {label}
      </div>
      <div className="font-mono text-xl font-bold text-stone-100">{value}</div>
      {subValue && <div className="text-[11px] text-stone-500 font-medium">{subValue}</div>}
    </div>
  );
}

function FooterItem({ icon, bgColor, iconColor, label, value }: any) {
    return (
        <div className="bg-stone-950/50 rounded-2xl p-5 border border-stone-800/50 flex items-center gap-5 relative overflow-hidden">
            <div className={`p-4 rounded-full ${bgColor} ${iconColor} relative z-10`}>
              {icon}
            </div>
            <div className="relative z-10">
              <div className="text-sm text-stone-400 mb-1">{label}</div>
              <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            </div>
            <div className={`absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-${iconColor.split('-')[1]}-900/10 to-transparent opacity-50 pointer-events-none`}></div>
         </div>
    )
}