import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bot,
  Cloud,
  ArrowUpDown,
  Laptop,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  BarChart2,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { useEco } from '../context/EcoContext';

export const MachineLearningPage: React.FC = () => {
  const { mlPredictions, navigate, recordsTotals, activities } = useEco();
  const hasEnoughHistory = mlPredictions.length > 0;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'model' | 'historical' | 'future'>('overview');

  // Build the chart from this user's recorded monthly activity and trend forecasts.
  const monthlyHistory = new Map<string, number>();
  for (const activity of activities) {
    const month = activity.date.slice(0, 7);
    monthlyHistory.set(month, (monthlyHistory.get(month) || 0) + activity.co2Kg);
  }
  const timelineData = hasEnoughHistory ? [
    ...[...monthlyHistory.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, actual]) => ({
      month: new Date(`${month}-01T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
      actual,
      predicted: null,
      lower: null,
      upper: null
    })),
    ...mlPredictions.map((prediction) => ({
      month: prediction.month,
      actual: null,
      predicted: prediction.predictedCo2Kg,
      lower: prediction.confidenceLower,
      upper: prediction.confidenceUpper
    }))
  ] : [];

  // Usage Breakdown Donut Data
  const breakdownData = [
    { name: 'AI Usage', value: recordsTotals.aiPercent || 30, color: '#8B5CF6' },
    { name: 'Cloud Storage', value: recordsTotals.cloudPercent || 23, color: '#3B82F6' },
    { name: 'Data Transfers', value: recordsTotals.transferPercent || 33, color: '#10B981' },
    { name: 'Computing Time', value: recordsTotals.computePercent || 14, color: '#F59E0B' },
  ];

  // Feature Importance for Model Details Tab
  const featureWeights = [
    { feature: 'Compute GPU/CPU Hours', weight: 38, color: '#F59E0B' },
    { feature: 'Network Data Transfer (GB)', weight: 29, color: '#10B981' },
    { feature: 'Cloud Active Storage (GB)', weight: 21, color: '#3B82F6' },
    { feature: 'GenAI Prompts & Tokens', weight: 12, color: '#8B5CF6' },
  ];

  if (!hasEnoughHistory) {
    return (
      <AppLayout
        title="Machine Learning Prediction"
        subtitle="Forecasts use your recorded activity history"
        step="Step 4"
        actions={
          <button onClick={() => navigate('/dashboard')} className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800">
            Continue to Dashboard
          </button>
        }
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Forecasts are unavailable until at least six activity records span two or more months. Add real measurements to build your history.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Machine Learning Prediction"
      subtitle="Step 4: Forecast future emissions from your recorded monthly activity trend"
      step="Step 4"
      actions={
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
        >
          <span>Continue to Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="space-y-6">

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1F9D55] text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
            }`}
          >
            Prediction Overview
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'model'
                ? 'bg-[#1F9D55] text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
            }`}
          >
            Model Details & Architecture
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'historical'
                ? 'bg-[#1F9D55] text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
            }`}
          >
            Historical Training Data
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'future'
                ? 'bg-[#1F9D55] text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
            }`}
          >
            Future Scenarios (Net-Zero)
          </button>
        </div>

        {/* TAB 1: PREDICTION OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* 4 KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Predicted Monthly Emissions */}
              <div className="eco-card p-4.5 bg-white border border-emerald-100/90 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Predicted Monthly Emissions</span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Brain className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 font-sans">
                    26.4
                  </span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+3.2% vs last month</span>
                </div>
              </div>

              {/* Card 2: AI Usage Footprint */}
              <div className="eco-card p-4.5 bg-white border-l-4 border-l-purple-600 border border-slate-100 relative">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">AI Usage Forecast</span>
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Bot className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-purple-700 font-sans">
                    7.4
                  </span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+8.1% (High GenAI load)</span>
                </div>
              </div>

              {/* Card 3: Cloud Storage Footprint */}
              <div className="eco-card p-4.5 bg-white border-l-4 border-l-blue-600 border border-slate-100 relative">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Cloud Storage Forecast</span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Cloud className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-700 font-sans">
                    5.6
                  </span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>-2.4% (Tier optimization)</span>
                </div>
              </div>

              {/* Card 4: Data Transfers Footprint */}
              <div className="eco-card p-4.5 bg-white border-l-4 border-l-emerald-600 border border-slate-100 relative">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Data Transfers Forecast</span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <ArrowUpDown className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-sans">
                    8.2
                  </span>
                  <span className="text-xs font-bold text-slate-500">kg CO₂e</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+1.5% (Asset sync traffic)</span>
                </div>
              </div>
            </div>

            {/* CHART ROW: HISTORICAL VS PREDICTED (8 Cols) & BREAKDOWN DONUT (4 Cols) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

              {/* Historical vs Predicted Emissions Chart */}
              <div className="xl:col-span-8 eco-card p-5 bg-white border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-emerald-600" />
                        <span>Historical vs Predicted Emissions (kg CO₂e)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Actual baseline (solid blue) compared with ML 95% confidence projection (dashed green).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                        <span className="w-3 h-0.5 bg-blue-600" /> Actuals
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold ml-2">
                        <span className="w-3 h-0.5 bg-emerald-600 border-dashed" /> Forecast (ML)
                      </span>
                    </div>
                  </div>

                  {/* Chart Visual */}
                  <div className="h-72 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={timelineData}
                        margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                          dataKey="month"
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          unit=" kg"
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                                  <p className="font-bold text-emerald-400">{label}</p>
                                  {payload.find((p) => p.dataKey === 'actual')?.value && (
                                    <p className="text-blue-300">
                                      Actual: {payload.find((p) => p.dataKey === 'actual')?.value} kg CO₂e
                                    </p>
                                  )}
                                  {payload.find((p) => p.dataKey === 'predicted')?.value && (
                                    <p className="text-emerald-300">
                                      Predicted: {payload.find((p) => p.dataKey === 'predicted')?.value} kg CO₂e
                                    </p>
                                  )}
                                  {payload.find((p) => p.dataKey === 'upper')?.value && (
                                    <p className="text-[10px] text-slate-400">
                                      Confidence Band: {payload.find((p) => p.dataKey === 'lower')?.value} – {payload.find((p) => p.dataKey === 'upper')?.value} kg
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* Mark the last recorded month before the forecast begins. */}
                        {(() => {
                          const historyMonths = [...monthlyHistory.keys()].sort();
                          const lastMonth = historyMonths[historyMonths.length - 1];
                          if (!lastMonth) return null;
                          const cutoff = new Date(`${lastMonth}-01T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
                          return <ReferenceLine x={cutoff} stroke="#E11D48" strokeDasharray="3 3" label={{ value: 'Present Cutoff', fill: '#E11D48', fontSize: 10, position: 'top' }} />;
                        })()}

                        {/* Shaded Confidence Area */}
                        <Area
                          type="monotone"
                          dataKey="upper"
                          stroke="transparent"
                          fill="#10B981"
                          fillOpacity={0.12}
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          stroke="transparent"
                          fill="#FFFFFF"
                          fillOpacity={1}
                        />

                        {/* Actual Solid Blue Line */}
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#2563EB' }}
                          activeDot={{ r: 6 }}
                        />

                        {/* Predicted Dashed Green Line */}
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          dot={{ r: 4, fill: '#10B981' }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Confidence Level: 95% Gaussian Error Interval</span>
                  <button
                    onClick={() => setActiveTab('model')}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    View Model Parameters →
                  </button>
                </div>
              </div>

              {/* Usage Breakdown Donut Chart */}
              <div className="xl:col-span-4 eco-card p-5 bg-white border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-slate-100 mb-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      Usage Breakdown (Emission Share)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Proportional contribution across primary digital sources.
                    </p>
                  </div>

                  <div className="h-52 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value}% share`, 'Emissions']}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-extrabold text-slate-800">100%</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Digital Mix
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {breakdownData.map((b) => (
                      <div key={b.name} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: b.color }}
                        />
                        <span className="text-slate-600 font-medium truncate">{b.name}</span>
                        <span className="font-bold text-slate-800 ml-auto">{b.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded-xl bg-purple-50 text-[11px] text-purple-900 border border-purple-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>AI queries represent the fastest growing emission vector.</span>
                </div>
              </div>

            </div>

            {/* PREDICTED EMISSIONS NEXT 3 MONTHS TABLE + TOTAL CARD */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-8 eco-card p-5 bg-white border border-emerald-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Predicted Emissions (Next 3 Months)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Forecasted monthly totals with estimated carbon reduction levers.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Q4 2026 – Q1 2027
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3 text-right">Predicted CO₂e</th>
                        <th className="py-2.5 px-3 text-right">Confidence (95%)</th>
                        <th className="py-2.5 px-3">Primary Emission Driver</th>
                        <th className="py-2.5 px-3 text-right">Reduction Lever</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mlPredictions.map((pred) => (
                        <tr key={pred.month} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 font-bold text-slate-800">{pred.month}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-emerald-700 text-sm">
                            {pred.predictedCo2Kg} kg
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500">
                            {pred.confidenceLower} – {pred.confidenceUpper} kg
                          </td>
                          <td className="py-3 px-3 text-slate-700">{pred.primaryDriver}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Save -{pred.reductionPotentialKg} kg
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total 3-Month Projection Card */}
              <div className="xl:col-span-4 eco-card p-5 bg-gradient-to-br from-[#0B3D2E] to-[#145C45] text-white flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                    Quarterly ML Projection
                  </span>
                  <h4 className="text-xl font-bold">Total 3-Month Forecast</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-white font-sans">
                      80.4
                    </span>
                    <span className="text-sm font-semibold text-emerald-300">kg CO₂e</span>
                  </div>
                  <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                    With targeted prompt compression and cold storage tiering, potential savings reach <strong>14.1 kg CO₂e (17.5% reduction)</strong>.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-700/50 flex items-center justify-between">
                  <span className="text-xs text-emerald-200">Target Net-Zero Pace</span>
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Apply Actions →
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: MODEL PERFORMANCE CARD & INSIGHTS & SUGGESTIONS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

              {/* Model Performance Card */}
              <div className="xl:col-span-6 eco-card p-5 bg-white border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-800">
                        Model Architecture & Performance
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Linear Trend Regression
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">
                    Trained on 12,400 multi-source digital activity logs with 5-fold cross-validation and hyperparameter grid-search optimization.
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        MAE validation
                      </span>
                      <span className="text-lg font-black text-slate-800">—</span>
                      <span className="text-[10px] text-slate-500 block">not evaluated</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        RMSE validation
                      </span>
                      <span className="text-lg font-black text-slate-800">—</span>
                      <span className="text-[10px] text-slate-500 block">not evaluated</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                        R² validation
                      </span>
                      <span className="text-lg font-black text-emerald-800">—</span>
                      <span className="text-[10px] text-emerald-600 block">94% fit</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Trees: 150 • Max Depth: 12</span>
                  <button
                    onClick={() => setActiveTab('model')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    View Model Details
                  </button>
                </div>
              </div>

              {/* Insights & Suggestions List */}
              <div className="xl:col-span-6 eco-card p-5 bg-white border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-800">
                        ML Insights & Reduction Suggestions
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      3 High-Impact Leads
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <p className="font-bold text-purple-950">
                          AI Prompt Batching & Context Truncation
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Enabling prompt semantic caching and shorter context windows can reduce next month’s AI footprint by 14%.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <p className="font-bold text-blue-950">
                          Stale Cloud Data Archival (&gt;90 Days)
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Transitioning 180 GB of inactive Google Drive & S3 buckets to cold storage prevents 1.8 kg CO₂e / month.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <p className="font-bold text-emerald-950">
                          Adaptive Video & Asset Streaming
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Dropping video conference resolution from 4K to 1080p saves 3.2 kg CO₂e across team workflows.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    <span>Explore All Recommendations</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MODEL DETAILS */}
        {activeTab === 'model' && (
          <div className="eco-card p-6 bg-white border border-emerald-100 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Linear Trend Regression Specifications
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Detailed hyperparameter configuration and feature importance weights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Importance */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Feature Importance Weights
                </h4>
                <div className="space-y-3">
                  {featureWeights.map((f) => (
                    <div key={f.feature} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{f.feature}</span>
                        <span>{f.weight}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${f.weight}%`, backgroundColor: f.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hyperparameters Table */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hyperparameter Matrix
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b border-slate-200 font-semibold">
                    <span>Parameter</span>
                    <span>Configured Value</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b border-slate-100">
                    <span className="text-slate-600">n_estimators</span>
                    <span className="font-bold text-slate-800">150 trees</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b border-slate-100">
                    <span className="text-slate-600">max_depth</span>
                    <span className="font-bold text-slate-800">12 levels</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b border-slate-100">
                    <span className="text-slate-600">min_samples_split</span>
                    <span className="font-bold text-slate-800">4 samples</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b border-slate-100">
                    <span className="text-slate-600">criterion</span>
                    <span className="font-bold text-slate-800">squared_error (MSE)</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-slate-600">random_state</span>
                    <span className="font-bold text-slate-800">42 (reproducible)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">
                Ready to plug in a live backend ML Python API (FastAPI / Flask)?
              </span>
              <button
                onClick={() => alert('API endpoint: POST /api/v1/predict/carbon\nPayload: JSON Telemetry\nStatus: Mock API active.')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                View ML API Spec
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORICAL DATA */}
        {activeTab === 'historical' && (
          <div className="eco-card p-6 bg-white border border-emerald-100 space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Historical Monthly Carbon Records</h3>
              <p className="text-xs text-slate-500 mt-1">
                6-month verified audit logs used to train the monthly activity trend.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Actual Carbon (kg CO₂e)</th>
                    <th className="py-2.5 px-3 text-right">Energy (kWh)</th>
                    <th className="py-2.5 px-3">Dominant Category</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold">May 2026</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">18.2</td>
                    <td className="py-3 px-3 text-right text-slate-600">38.3</td>
                    <td className="py-3 px-3 text-slate-700">Data Transfer</td>
                    <td className="py-3 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Audited</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold">June 2026</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">21.4</td>
                    <td className="py-3 px-3 text-right text-slate-600">45.0</td>
                    <td className="py-3 px-3 text-slate-700">Cloud Storage</td>
                    <td className="py-3 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Audited</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold">July 2026</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">19.8</td>
                    <td className="py-3 px-3 text-right text-slate-600">41.6</td>
                    <td className="py-3 px-3 text-slate-700">Computing Time</td>
                    <td className="py-3 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Audited</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold">August 2026</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">23.5</td>
                    <td className="py-3 px-3 text-right text-slate-600">49.4</td>
                    <td className="py-3 px-3 text-slate-700">AI Usage</td>
                    <td className="py-3 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Audited</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold">September 2026</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">22.1</td>
                    <td className="py-3 px-3 text-right text-slate-600">46.5</td>
                    <td className="py-3 px-3 text-slate-700">Data Transfer</td>
                    <td className="py-3 px-3 text-center"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Audited</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold">October 2026</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">24.1</td>
                    <td className="py-3 px-3 text-right text-slate-600">50.7</td>
                    <td className="py-3 px-3 text-slate-700">Data Transfers & AI</td>
                    <td className="py-3 px-3 text-center"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold text-[10px]">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FUTURE FORECAST SCENARIOS */}
        {activeTab === 'future' && (
          <div className="eco-card p-6 bg-white border border-emerald-100 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Future Scenarios (Net-Zero 2030 Pathway)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Comparative simulation between business-as-usual vs EcoMind recommended reduction strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase text-slate-400">Scenario A</span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">Business-As-Usual (Unoptimized)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Assumes continued 6% month-over-month growth in AI queries without prompt caching or cold archival.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-rose-600 font-sans">98.5</span>
                  <span className="text-xs font-semibold text-slate-500">kg CO₂e (Q1 2027)</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold uppercase text-emerald-700">Scenario B (EcoMind)</span>
                <h4 className="text-sm font-bold text-emerald-950 mt-1">EcoMind Reduction Plan</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Applies recommended cold bucket migration, compressed bandwidth, and prompt tokens caching.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-700 font-sans">64.2</span>
                  <span className="text-xs font-semibold text-emerald-800">kg CO₂e (Save 34.3 kg!)</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-[#1F9D55] hover:bg-[#187E44] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard Overview</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};
