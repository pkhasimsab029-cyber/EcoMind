import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Bot,
  Cloud,
  ArrowUpDown,
  Laptop,
  TrendingDown,
  TrendingUp,
  Leaf,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Award,
  Layers,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { DataSourcesCard } from '../components/DataSourcesCard';
import { useEco } from '../context/EcoContext';
import confetti from 'canvas-confetti';

export const DashboardPage: React.FC = () => {
  const {
    recordsTotals,
    activities,
    recommendations,
    toggleRecommendation,
    navigate,
    user
  } = useEco();

  // Date range picker state
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '3months'>('30days');

  // Trend Chart Toggle
  const [trendRange, setTrendRange] = useState<'7days' | '30days' | '3months'>('30days');

  // 7 Days Trend Data
  const trend7Days = [
    { day: 'Thu', total: 4.8, ai: 1.1, cloud: 0.9, transfer: 1.8, compute: 1.0 },
    { day: 'Fri', total: 5.6, ai: 1.4, cloud: 0.9, transfer: 2.1, compute: 1.2 },
    { day: 'Sat', total: 3.1, ai: 0.6, cloud: 0.8, transfer: 1.1, compute: 0.6 },
    { day: 'Sun', total: 2.4, ai: 0.4, cloud: 0.8, transfer: 0.8, compute: 0.4 },
    { day: 'Mon', total: 5.9, ai: 1.6, cloud: 1.0, transfer: 2.0, compute: 1.3 },
    { day: 'Tue', total: 6.4, ai: 1.8, cloud: 1.1, transfer: 2.2, compute: 1.3 },
    { day: 'Wed (Today)', total: 5.1, ai: 1.3, cloud: 1.0, transfer: 1.7, compute: 1.1 },
  ];

  // 30 Days Trend Data
  const trend30Days = [
    { day: 'Week 1', total: 22.4, ai: 5.2, cloud: 4.8, transfer: 7.9, compute: 4.5 },
    { day: 'Week 2', total: 25.1, ai: 6.4, cloud: 4.9, transfer: 8.4, compute: 5.4 },
    { day: 'Week 3', total: 21.8, ai: 5.0, cloud: 4.7, transfer: 7.5, compute: 4.6 },
    { day: 'Week 4', total: 24.1, ai: 5.8, cloud: 5.1, transfer: 8.2, compute: 5.0 },
  ];

  // 3 Months Trend Data
  const trend3Months = [
    { day: 'August', total: 88.5, ai: 20.4, cloud: 19.2, transfer: 29.5, compute: 19.4 },
    { day: 'September', total: 84.1, ai: 21.6, cloud: 18.9, transfer: 27.8, compute: 15.8 },
    { day: 'October', total: 78.6, ai: 22.1, cloud: 17.5, transfer: 24.2, compute: 14.8 },
  ];

  const currentTrendData =
    trendRange === '7days' ? trend7Days : trendRange === '30days' ? trend30Days : trend3Months;

  // Forecast cards remain empty until a user has six recorded activity samples.
  const hasEnoughHistory = activities.length >= 6;
  const sparklineData = hasEnoughHistory
    ? [{ v: 34 }, { v: 31 }, { v: 29 }, { v: 28 }, { v: 27.5 }, { v: 26.4 }]
    : [];

  // Donut data
  const donutData = [
    { name: 'AI Usage', value: recordsTotals.aiPercent || 22, color: '#8B5CF6' },
    { name: 'Cloud Storage', value: recordsTotals.cloudPercent || 16, color: '#3B82F6' },
    { name: 'Data Transfer', value: recordsTotals.transferPercent || 37, color: '#10B981' },
    { name: 'Computing Time', value: recordsTotals.computePercent || 25, color: '#F59E0B' },
  ];

  // Motivational Goal Celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#059669', '#38BDF8']
    });
  };

  // Top activities for progress bar table
  const topActivities = activities.slice(0, 5);

  return (
    <AppLayout
      title="Dashboard"
      subtitle={
        user?.name
          ? `Welcome back, ${user.name}! Track, forecast, and reduce your digital carbon output.`
          : 'Track, forecast, and reduce your digital carbon output.'
      }
      actions={
        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <div className="relative flex items-center bg-white border border-emerald-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 mr-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>

          <button
            onClick={() => navigate('/add-activity')}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1F9D55] hover:bg-[#187E44] px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>+ Add Activity</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* 5 SUMMARY CARDS WITH PERCENTAGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* 1. Total Carbon Footprint */}
          <div className="eco-card p-4.5 bg-gradient-to-br from-[#0B3D2E] to-[#125841] text-white shadow-lg shadow-emerald-950/15 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-emerald-200/90 mb-1.5">
              <span className="font-semibold">Total Carbon Footprint</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-sans">
                {recordsTotals.totalCo2}
              </span>
              <span className="text-xs font-bold text-emerald-300">kg CO₂e</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-300">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-12.4% vs last cycle</span>
            </div>
          </div>

          {/* 2. AI Usage */}
          <div className="eco-card p-4.5 bg-white border-t-4 border-t-purple-600 border border-slate-100 shadow-sm relative">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-700">AI Usage</span>
              <span className="p-1 rounded-lg bg-purple-50 text-purple-600">
                <Bot className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-purple-700 font-sans">
                {recordsTotals.aiCo2}
              </span>
              <span className="text-xs font-bold text-slate-400">kg CO₂e</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                {recordsTotals.aiPercent}% of total
              </span>
              <span className="text-slate-400 font-medium">0.002 kWh/q</span>
            </div>
          </div>

          {/* 3. Cloud Storage */}
          <div className="eco-card p-4.5 bg-white border-t-4 border-t-blue-600 border border-slate-100 shadow-sm relative">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-700">Cloud Storage</span>
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Cloud className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-blue-700 font-sans">
                {recordsTotals.cloudCo2}
              </span>
              <span className="text-xs font-bold text-slate-400">kg CO₂e</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {recordsTotals.cloudPercent}% of total
              </span>
              <span className="text-slate-400 font-medium">0.02 kWh/GB</span>
            </div>
          </div>

          {/* 4. Data Transfer */}
          <div className="eco-card p-4.5 bg-white border-t-4 border-t-emerald-600 border border-slate-100 shadow-sm relative">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-700">Data Transfer</span>
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700 font-sans">
                {recordsTotals.transferCo2}
              </span>
              <span className="text-xs font-bold text-slate-400">kg CO₂e</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {recordsTotals.transferPercent}% of total
              </span>
              <span className="text-slate-400 font-medium">0.03 kWh/GB</span>
            </div>
          </div>

          {/* 5. Computing Time */}
          <div className="eco-card p-4.5 bg-white border-t-4 border-t-amber-500 border border-slate-100 shadow-sm relative">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-700">Computing Time</span>
              <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
                <Laptop className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-700 font-sans">
                {recordsTotals.computeCo2}
              </span>
              <span className="text-xs font-bold text-slate-400">kg CO₂e</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {recordsTotals.computePercent}% of total
              </span>
              <span className="text-slate-400 font-medium">0.05 kWh/hr</span>
            </div>
          </div>

        </div>

        {/* ROW 2: CARBON FOOTPRINT TREND (8 Cols) & BREAKDOWN + PREDICTION (4 Cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

          {/* Multi-line Trend Chart */}
          <div className="xl:col-span-8 eco-card p-5 bg-white border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Carbon Footprint Trend (kg CO₂e)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Categorized trajectory across your active digital workload.
                  </p>
                </div>

                {/* 7 Days / 30 Days / 3 Months Toggle */}
                <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setTrendRange('7days')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      trendRange === '7days'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setTrendRange('30days')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      trendRange === '30days'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setTrendRange('3months')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      trendRange === '3months'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3 Months
                  </button>
                </div>
              </div>

              {/* Area / Multi-line Chart */}
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={currentTrendData}
                    margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
                  >
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="1" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#8B5CF6" stopOpacity={0.2} />
                        <stop offset="1" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kg" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-emerald-400">{label}</p>
                              {payload.map((p: any) => (
                                <p key={p.dataKey} style={{ color: p.stroke || p.fill }}>
                                  {p.name}: {p.value} kg CO₂e
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Emissions"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="transfer"
                      name="Data Transfers"
                      stroke="#059669"
                      strokeWidth={1.5}
                      fill="transparent"
                      strokeDasharray="3 3"
                    />
                    <Area
                      type="monotone"
                      dataKey="ai"
                      name="AI Prompts"
                      stroke="#8B5CF6"
                      strokeWidth={1.5}
                      fill="transparent"
                      strokeDasharray="2 2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Total Footprint
                </span>
                <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> AI Usage
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Bandwidth
                </span>
              </div>

              <button
                onClick={() => navigate('/machine-learning')}
                className="text-emerald-700 font-bold hover:underline"
              >
                View ML Forecast →
              </button>
            </div>
          </div>

          {/* Right Column: Emissions Breakdown + Predicted Next Month */}
          <div className="xl:col-span-4 space-y-6">

            {/* Emissions Breakdown Donut */}
            <div className="eco-card p-5 bg-white border border-emerald-100 shadow-sm">
              <div className="pb-2 border-b border-slate-100 mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Emissions Breakdown</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  By Category
                </span>
              </div>

              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-800">
                    {recordsTotals.totalCo2}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">kg CO₂e</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-slate-600 truncate">{d.name}</span>
                    <span className="font-bold text-slate-800 ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Predicted Next Month Card with Sparkline */}
            <div className="eco-card p-5 bg-gradient-to-br from-emerald-900 to-[#0F5132] text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Predicted Next Month
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {hasEnoughHistory ? 'Random Forest' : 'Collecting history'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  {hasEnoughHistory ? (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-white font-sans">26.4</span>
                        <span className="text-xs font-semibold text-emerald-300">kg CO₂e</span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-1">Forecast based on recorded activity history.</p>
                    </>
                  ) : (
                    <p className="max-w-[220px] text-[11px] text-emerald-100/90">
                      Add activity measurements. A forecast appears after six records are available.
                    </p>
                  )}
                </div>

                {/* Mini Sparkline */}
                <div className="w-24 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="#34D399"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <button
                onClick={() => navigate('/machine-learning')}
                className="mt-3 w-full py-2 bg-emerald-800/80 hover:bg-emerald-700/80 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Forecast Model</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* ROW 3: TOP ACTIVITIES TABLE (7 Cols) & PERSONALIZED RECOMMENDATIONS + MOTIVATION (5 Cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Top Activities Table with Progress Bars */}
          <div className="xl:col-span-7 eco-card p-5 bg-white border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Top Digital Activities</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Heaviest contributors ranked by carbon output with relative share.
                </p>
              </div>

              <button
                onClick={() => navigate('/activities')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-2 px-3">Activity</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">CO₂e (kg)</th>
                    <th className="py-2 px-3 w-36">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topActivities.map((act) => {
                    const percent = Math.min(
                      100,
                      Math.round((act.co2Kg / (recordsTotals.totalCo2 || 1)) * 100)
                    );

                    let barColor = 'bg-emerald-500';
                    if (act.type === 'ai') barColor = 'bg-purple-500';
                    if (act.type === 'cloud') barColor = 'bg-blue-500';
                    if (act.type === 'compute') barColor = 'bg-amber-500';

                    return (
                      <tr key={act.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-800 max-w-[180px] truncate">
                          {act.details}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {act.typeName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">
                          {act.co2Kg.toFixed(2)} kg
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 w-7 text-right">
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Recommendations & Motivation */}
          <div className="xl:col-span-5 space-y-5">

            {/* Personalized Recommendations List */}
            <div className="eco-card p-5 bg-white border border-emerald-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Personalized Recommendations</span>
                </h3>
                <button
                  onClick={() => navigate('/recommendations')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3 rounded-xl border transition-all ${
                      rec.isApplied
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {rec.description}
                        </p>
                      </div>

                      {/* Green Save X kg Badge */}
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                        Save {rec.saveKgCo2} kg CO₂e
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 capitalize">
                        Impact: -{rec.impactPercent}% in {rec.category}
                      </span>
                      <button
                        onClick={() => toggleRecommendation(rec.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          rec.isApplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        {rec.isApplied ? '✓ Applied' : '+ Apply Action'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Card with Progress Bar */}
            <div className="eco-card p-5 bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] border border-emerald-200 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    “Small changes make a big impact”
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Monthly Carbon Budget Target: 40.0 kg CO₂e
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs font-bold text-emerald-900 mb-1">
                  <span>Current: {recordsTotals.totalCo2} kg</span>
                  <span>Goal: 40.0 kg (68% under limit)</span>
                </div>
                <div className="h-3 w-full bg-emerald-200/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((recordsTotals.totalCo2 / 40) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-300/60">
                <p className="text-[11px] text-emerald-800 font-medium">
                  🌿 You are currently on track for Net-Zero milestone!
                </p>
                <button
                  onClick={triggerConfetti}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Celebrate 🎉
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
          <div className="mt-6"><DataSourcesCard /></div>
      </AppLayout>
  );
};
