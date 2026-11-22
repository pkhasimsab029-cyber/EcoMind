import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ActivityCategory, ActivityRecord, MLPrediction, UserProfile, UserAccount } from '../types';

interface AiUsageInput {
  mode: 'queries' | 'hours';
  value: number;
  tool: string;
}

interface CloudStorageInput {
  gb: number;
  days: number;
  provider: string;
}

interface DataTransferInput {
  gb: number;
  transferType: 'Upload' | 'Download' | 'Streaming' | 'Sync';
}

interface ComputingInput {
  hours: number;
  resourceType: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  saveKgCo2: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  isApplied: boolean;
  impactPercent: number;
}

interface EcoContextType {
  // Navigation & Route
  currentRoute: string;
  navigate: (route: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  // Auth & Accounts
  user: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: UserProfile[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  logout: () => void;

  // Digital Activity Inputs (Page 2 Live Form)
  aiInput: AiUsageInput;
  setAiInput: React.Dispatch<React.SetStateAction<AiUsageInput>>;
  cloudInput: CloudStorageInput;
  setCloudInput: React.Dispatch<React.SetStateAction<CloudStorageInput>>;
  transferInput: DataTransferInput;
  setTransferInput: React.Dispatch<React.SetStateAction<DataTransferInput>>;
  computeInput: ComputingInput;
  setComputeInput: React.Dispatch<React.SetStateAction<ComputingInput>>;

  // Real-time calculated emissions for Page 2 inputs
  calculatedEmissions: {
    ai: { kwh: number; co2: number };
    cloud: { kwh: number; co2: number };
    transfer: { kwh: number; co2: number };
    compute: { kwh: number; co2: number };
    totalKwh: number;
    totalCo2: number;
  };

  // Activity Records (Page 3 & Page 5)
  activities: ActivityRecord[];
  addCurrentActivitiesAsRecords: () => void;
  deleteActivity: (id: string) => void;
  deleteCollectedData: () => Promise<void>;
  resetToDefaults: () => void;

  // Aggregate Totals across all records
  recordsTotals: {
    totalKwh: number;
    totalCo2: number;
    aiCo2: number;
    cloudCo2: number;
    transferCo2: number;
    computeCo2: number;
    aiPercent: number;
    cloudPercent: number;
    transferPercent: number;
    computePercent: number;
  };

  // Recommendations
  recommendations: RecommendationItem[];
  toggleRecommendation: (id: string) => void;

  // ML Predictions
  mlPredictions: MLPrediction[];

  // Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const EcoContext = createContext<EcoContextType | undefined>(undefined);

// Standard peer-reviewed emission factors
const FACTOR_AI_KWH_PER_QUERY = 0.002;
const FACTOR_AI_KWH_PER_HOUR = 0.04;
const FACTOR_CLOUD_KWH_PER_GB_MONTH = 0.02;
const FACTOR_TRANSFER_KWH_PER_GB = 0.03;
const FACTOR_COMPUTE_KWH_PER_HOUR = 0.05;
const GRID_INTENSITY_KG_CO2_PER_KWH = 0.475; // Global average grid factor

const BENCHMARK_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1',
    date: '2026-10-28',
    type: 'ai',
    typeName: 'AI Usage',
    details: 'ChatGPT-4o (Research & Code Gen)',
    quantity: 150,
    unit: 'queries',
    energyUsedKwh: 0.30,
    co2Kg: 0.142,
    emissionFactor: '0.002 kWh / query',
    source: 'OpenAI / MIT Life-Cycle Study'
  },
  {
    id: 'act-2',
    date: '2026-10-27',
    type: 'cloud',
    typeName: 'Cloud Storage',
    details: 'Google Drive Active Workspace Backup',
    quantity: 250,
    unit: 'GB / 30d',
    energyUsedKwh: 5.00,
    co2Kg: 2.375,
    emissionFactor: '0.02 kWh / GB / mo',
    source: 'Cloud Carbon Footprint Standard'
  },
  {
    id: 'act-3',
    date: '2026-10-27',
    type: 'transfer',
    typeName: 'Data Transfer',
    details: 'High-Res Asset Downloads & Sync',
    quantity: 120,
    unit: 'GB',
    energyUsedKwh: 3.60,
    co2Kg: 1.710,
    emissionFactor: '0.03 kWh / GB',
    source: 'The Shift Project & IEA 2024'
  },
  {
    id: 'act-4',
    date: '2026-10-26',
    type: 'compute',
    typeName: 'Computing Time',
    details: 'High-Performance Cloud GPU Cluster',
    quantity: 45,
    unit: 'hours',
    energyUsedKwh: 2.25,
    co2Kg: 1.068,
    emissionFactor: '0.05 kWh / hour',
    source: 'Green Software Foundation'
  },
  {
    id: 'act-5',
    date: '2026-10-25',
    type: 'ai',
    typeName: 'AI Usage',
    details: 'GitHub Copilot Pair Programming',
    quantity: 240,
    unit: 'queries',
    energyUsedKwh: 0.48,
    co2Kg: 0.228,
    emissionFactor: '0.002 kWh / query',
    source: 'GitHub / Microsoft Research'
  },
  {
    id: 'act-6',
    date: '2026-10-24',
    type: 'cloud',
    typeName: 'Cloud Storage',
    details: 'AWS S3 Cold Storage Archive',
    quantity: 500,
    unit: 'GB / 30d',
    energyUsedKwh: 4.50,
    co2Kg: 2.137,
    emissionFactor: '0.009 kWh / GB / mo',
    source: 'AWS Sustainability Report'
  },
  {
    id: 'act-7',
    date: '2026-10-23',
    type: 'transfer',
    typeName: 'Data Transfer',
    details: '4K Team Video Conferencing & Stream',
    quantity: 85,
    unit: 'GB',
    energyUsedKwh: 2.55,
    co2Kg: 1.211,
    emissionFactor: '0.03 kWh / GB',
    source: 'IEA Digital Energy Hub'
  }
];

const INITIAL_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-1',
    title: 'Migrate Inactive Cloud Buckets to Glacier Deep Archive',
    description: 'Compress and transition 150GB of static files unaccessed for over 90 days to low-energy cold storage tiers.',
    category: 'cloud',
    saveKgCo2: 2.4,
    difficulty: 'Easy',
    isApplied: false,
    impactPercent: 18
  },
  {
    id: 'rec-2',
    title: 'Streamline AI Prompting & Enable Semantic Prompt Caching',
    description: 'Use token-efficient system prompts and enable server-side caching to avoid repetitive context re-evaluation.',
    category: 'ai',
    saveKgCo2: 3.1,
    difficulty: 'Medium',
    isApplied: true,
    impactPercent: 24
  },
  {
    id: 'rec-3',
    title: 'Enforce Client-Side WebP/AVIF Compression for Transfers',
    description: 'Automatically compress images and batch archives before uploading to reduce network payload by up to 45%.',
    category: 'transfer',
    saveKgCo2: 1.8,
    difficulty: 'Easy',
    isApplied: false,
    impactPercent: 14
  },
  {
    id: 'rec-4',
    title: 'Automate Idle Compute Shutdown with Spot Scheduling',
    description: 'Configure auto-sleep scripts for cloud GPU development servers when CPU/GPU utilization drops below 5% for 15 mins.',
    category: 'compute',
    saveKgCo2: 4.5,
    difficulty: 'Advanced',
    isApplied: false,
    impactPercent: 32
  }
];

const buildActivityPredictions = (records: ActivityRecord[]): MLPrediction[] => {
  if (records.length < 6) return [];
  const byMonth = new Map<string, number>();
  const driverTotals: Record<ActivityCategory, number> = { ai: 0, cloud: 0, transfer: 0, compute: 0 };
  for (const record of records) {
    const month = record.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) || 0) + record.co2Kg);
    driverTotals[record.type] += record.co2Kg;
  }
  const history = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (history.length < 2) return [];
  const meanX = (history.length - 1) / 2;
  const meanY = history.reduce((sum, [, value]) => sum + value, 0) / history.length;
  const denominator = history.reduce((sum, _point, index) => sum + (index - meanX) ** 2, 0);
  const slope = denominator ? history.reduce((sum, [, value], index) => sum + (index - meanX) * (value - meanY), 0) / denominator : 0;
  const intercept = meanY - slope * meanX;
  const residual = Math.sqrt(history.reduce((sum, [, value], index) => sum + (value - (intercept + slope * index)) ** 2, 0) / history.length);
  const driver = (Object.entries(driverTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ai') as ActivityCategory;
  const driverNames: Record<ActivityCategory, string> = { ai: 'AI usage', cloud: 'cloud storage', transfer: 'data transfers', compute: 'computing activity' };
  return [1, 2, 3].map((offset) => {
    const projected = Math.max(0, intercept + slope * (history.length - 1 + offset));
    const date = new Date(`${history[history.length - 1][0]}-01T00:00:00.000Z`);
    date.setUTCMonth(date.getUTCMonth() + offset);
    const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const margin = Math.max(0.1, residual * 1.96);
    return {
      month,
      predictedCo2Kg: Number(projected.toFixed(2)),
      confidenceLower: Number(Math.max(0, projected - margin).toFixed(2)),
      confidenceUpper: Number((projected + margin).toFixed(2)),
      primaryDriver: `Recorded ${driverNames[driver]} trend`,
      reductionPotentialKg: Number((projected * 0.1).toFixed(2))
    };
  });
};

export const EcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync router with hash URL
  const getInitialRoute = (): string => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['/auth', '/add-activity', '/processing', '/machine-learning', '/dashboard', '/activities', '/analytics', '/recommendations', '/profile'].includes(hash)) {
      return hash;
    }
    return '/dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Registered Accounts in LocalStorage
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem('ecomind_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current Active User Session
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const active = localStorage.getItem('ecomind_active_user');
      if (active) {
        return JSON.parse(active);
      }
      return null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;

  // Restore the backend-authenticated Google session from its HTTP-only cookie.
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : { user: null })
      .then((result: { user: { id: string; name: string; email: string; avatarUrl?: string } | null }) => {
        if (!active || !result.user) return;
        const profile: UserProfile = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          role: 'Digital Sustainability Lead',
          carbonBudgetKg: 40,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
        setUser(profile);
        setCurrentRoute('/dashboard');
        window.location.hash = '/dashboard';
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  // If user is not authenticated and is trying to access protected routes, route to /auth
  useEffect(() => {
    if (!isAuthenticated && currentRoute !== '/auth') {
      setCurrentRoute('/auth');
      window.location.hash = '/auth';
    }
  }, [isAuthenticated, currentRoute]);

  // Input States for Page 2
  const [aiInput, setAiInput] = useState<AiUsageInput>({
    mode: 'queries',
    value: 150,
    tool: 'ChatGPT (GPT-4o)'
  });

  const [cloudInput, setCloudInput] = useState<CloudStorageInput>({
    gb: 250,
    days: 30,
    provider: 'Google Drive'
  });

  const [transferInput, setTransferInput] = useState<DataTransferInput>({
    gb: 120,
    transferType: 'Download'
  });

  const [computeInput, setComputeInput] = useState<ComputingInput>({
    hours: 45,
    resourceType: 'High-Perf Cloud Instance (GPU)'
  });

  // Per-User Recorded Activities (Scoped to user.id)
  const getUserActivities = (userId?: string): ActivityRecord[] => {
    if (!userId) return BENCHMARK_ACTIVITIES;
    const storageKey = `ecomind_activities_${userId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return BENCHMARK_ACTIVITIES;
      }
    }
    // New users start with an empty history; never present sample activity as measured data.
    return [];
  };

  const [activities, setActivities] = useState<ActivityRecord[]>(() => getUserActivities(user?.id));

  // Whenever active user changes, reload their personal activities
  useEffect(() => {
    if (user?.id) {
      setActivities(getUserActivities(user.id));
    }
  }, [user?.id]);

  // Include the latest measured Google account quota in the user's footprint totals.
  useEffect(() => {
    if (!user?.id || user.id.startsWith('user_')) return;
    let active = true;
    fetch('/api/google/drive/history', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : { measurements: [] })
      .then((result: { measurements: Array<{ provider: string; used_bytes: number; measured_at: string; energy_kwh: number; co2_kg: number; factor: string }> }) => {
        if (!active || !result.measurements?.length) return;
        const latest = result.measurements[0];
        const measuredDate = String(latest.measured_at).slice(0, 10);
        const quotaActivity: ActivityRecord = {
          id: 'google-storage-current',
          date: measuredDate,
          type: 'cloud',
          typeName: 'Google account storage quota',
          details: `Google account storage measured on ${measuredDate}`,
          quantity: Number(latest.used_bytes) / (1024 ** 3),
          unit: 'GB snapshot',
          energyUsedKwh: Number(latest.energy_kwh),
          co2Kg: Number(latest.co2_kg),
          emissionFactor: latest.factor,
          source: 'Google storage quota API estimate'
        };
        setActivities((prev) => [quotaActivity, ...prev.filter((activity) => activity.id !== quotaActivity.id)]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [user?.id]);

  // Save activities to user-specific localStorage key
  useEffect(() => {
    if (user?.id) {
      const storageKey = `ecomind_activities_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(activities));
    }
  }, [activities, user?.id]);

  // Save registered users list to localStorage
  useEffect(() => {
    localStorage.setItem('ecomind_users', JSON.stringify(accounts));
  }, [accounts]);

  // Save active user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('ecomind_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecomind_active_user');
    }
  }, [user]);

  // Recommendations
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(INITIAL_RECOMMENDATIONS);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Sync route changes
  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentRoute) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  // AUTH: Register a new account with custom user credentials
  const register = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if account already exists with this email
    const existing = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: `An account with ${cleanEmail} already exists. Please log in instead.`
      };
    }

    // Create unique user account
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAccount: UserAccount = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: 'Digital Sustainability Lead',
      carbonBudgetKg: 40,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    // Update accounts list
    setAccounts((prev) => [...prev, newAccount]);

    // Set active session for this new user
    const profile: UserProfile = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      carbonBudgetKg: newAccount.carbonBudgetKg,
      joinedDate: newAccount.joinedDate
    };
    setUser(profile);

    // Initialize personal activities for this user
    setActivities([]);
    localStorage.setItem(`ecomind_activities_${newUserId}`, JSON.stringify([]));

    showToast(`Welcome to EcoMind, ${cleanName}! Your account is ready.`, 'success');
    navigate('/dashboard');
    return { success: true };
  };

  // AUTH: Login with existing user credentials
  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const found = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: `No account found for "${cleanEmail}". Please check your email or register a new account.`
      };
    }

    if (found.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials and try again.'
      };
    }

    // Successful login: set active session
    const profile: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      avatarUrl: found.avatarUrl,
      carbonBudgetKg: found.carbonBudgetKg,
      joinedDate: found.joinedDate
    };
    setUser(profile);

    showToast(`Welcome back, ${profile.name}! Logged in successfully.`, 'success');
    navigate('/dashboard');
    return { success: true };
  };

  // Update profile details for currently logged-in user
  const updateUserProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...updated
    };
    setUser(updatedUser);

    // Also update in accounts list
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === user.id ? { ...acc, ...updated } : acc))
    );
    showToast('Profile information updated successfully.', 'success');
  };

  // Logout
  const logout = () => {
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
    setUser(null);
    localStorage.removeItem('ecomind_active_user');
    showToast('You have been logged out safely.', 'info');
    navigate('/auth');
  };

  // Real-time calculation for Page 2 inputs
  const aiKwh = aiInput.mode === 'queries'
    ? aiInput.value * FACTOR_AI_KWH_PER_QUERY
    : aiInput.value * FACTOR_AI_KWH_PER_HOUR;
  const aiCo2 = Number((aiKwh * GRID_INTENSITY_KG_CO2_PER_KWH).toFixed(3));

  const cloudKwh = cloudInput.gb * (cloudInput.days / 30) * FACTOR_CLOUD_KWH_PER_GB_MONTH;
  const cloudCo2 = Number((cloudKwh * GRID_INTENSITY_KG_CO2_PER_KWH).toFixed(3));

  const transferKwh = transferInput.gb * FACTOR_TRANSFER_KWH_PER_GB;
  const transferCo2 = Number((transferKwh * GRID_INTENSITY_KG_CO2_PER_KWH).toFixed(3));

  const computeKwh = computeInput.hours * FACTOR_COMPUTE_KWH_PER_HOUR;
  const computeCo2 = Number((computeKwh * GRID_INTENSITY_KG_CO2_PER_KWH).toFixed(3));

  const liveTotalKwh = Number((aiKwh + cloudKwh + transferKwh + computeKwh).toFixed(2));
  const liveTotalCo2 = Number((aiCo2 + cloudCo2 + transferCo2 + computeCo2).toFixed(3));

  const calculatedEmissions = {
    ai: { kwh: Number(aiKwh.toFixed(3)), co2: aiCo2 },
    cloud: { kwh: Number(cloudKwh.toFixed(3)), co2: cloudCo2 },
    transfer: { kwh: Number(transferKwh.toFixed(3)), co2: transferCo2 },
    compute: { kwh: Number(computeKwh.toFixed(3)), co2: computeCo2 },
    totalKwh: liveTotalKwh,
    totalCo2: liveTotalCo2,
  };

  // Add current inputs as saved records (Action in Step 2 -> Step 3)
  const addCurrentActivitiesAsRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    const newItems: ActivityRecord[] = [
      {
        id: `act-${Date.now()}-1`,
        date: today,
        type: 'ai',
        typeName: 'AI Usage',
        details: `${aiInput.tool} (${aiInput.mode === 'queries' ? 'Interactive queries' : 'Session runtime'})`,
        quantity: aiInput.value,
        unit: aiInput.mode === 'queries' ? 'queries' : 'hours',
        energyUsedKwh: calculatedEmissions.ai.kwh,
        co2Kg: calculatedEmissions.ai.co2,
        emissionFactor: aiInput.mode === 'queries' ? '0.002 kWh / query' : '0.04 kWh / hour',
        source: 'OpenAI / MIT Life-Cycle Study'
      },
      {
        id: `act-${Date.now()}-2`,
        date: today,
        type: 'cloud',
        typeName: 'Cloud Storage',
        details: `${cloudInput.provider} (${cloudInput.days} days active)`,
        quantity: cloudInput.gb,
        unit: 'GB',
        energyUsedKwh: calculatedEmissions.cloud.kwh,
        co2Kg: calculatedEmissions.cloud.co2,
        emissionFactor: '0.02 kWh / GB / mo',
        source: 'Cloud Carbon Footprint Standard'
      },
      {
        id: `act-${Date.now()}-3`,
        date: today,
        type: 'transfer',
        typeName: 'Data Transfer',
        details: `${transferInput.transferType} payload traffic`,
        quantity: transferInput.gb,
        unit: 'GB',
        energyUsedKwh: calculatedEmissions.transfer.kwh,
        co2Kg: calculatedEmissions.transfer.co2,
        emissionFactor: '0.03 kWh / GB',
        source: 'The Shift Project & IEA'
      },
      {
        id: `act-${Date.now()}-4`,
        date: today,
        type: 'compute',
        typeName: 'Computing Time',
        details: `${computeInput.resourceType}`,
        quantity: computeInput.hours,
        unit: 'hours',
        energyUsedKwh: calculatedEmissions.compute.kwh,
        co2Kg: calculatedEmissions.compute.co2,
        emissionFactor: '0.05 kWh / hour',
        source: 'Green Software Foundation'
      }
    ];

    setActivities((prev) => [...newItems, ...prev]);
    // Store manual fallback records on the backend when this is a Google-authenticated account.
    if (user?.id && !user.id.startsWith('user_')) {
      void Promise.all(newItems.map((item) => fetch('/api/activities', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: item.type,
          quantity: item.type === 'cloud' ? cloudInput.gb * cloudInput.days / 30 : item.quantity,
          unit: item.type === 'cloud' ? 'GB-month' : item.unit,
          source: 'manual'
        })
      }))).catch(() => undefined);
    }
    showToast('Activities saved successfully! Processing emissions data...', 'success');
    navigate('/processing');
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast('Activity record removed', 'info');
  };

  const deleteCollectedData = async () => {
    if (user?.id && !user.id.startsWith('user_')) {
      const response = await fetch('/api/activities', { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Could not delete collected account data.');
    }
    setActivities([]);
    if (user?.id) localStorage.setItem(`ecomind_activities_${user.id}`, JSON.stringify([]));
    showToast('Collected activity data deleted.', 'info');
  };

  const resetToDefaults = () => {
    setActivities(BENCHMARK_ACTIVITIES);
    showToast('Reset data to initial benchmark logs', 'info');
  };

  const toggleRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const nextState = !rec.isApplied;
          showToast(
            nextState
              ? `Applied: ${rec.title} (-${rec.saveKgCo2} kg CO₂e saved!)`
              : `Unapplied: ${rec.title}`,
            'success'
          );
          return { ...rec, isApplied: nextState };
        }
        return rec;
      })
    );
  };

  // Compute aggregate totals across all records
  const totalKwh = Number(activities.reduce((sum, a) => sum + a.energyUsedKwh, 0).toFixed(2));
  const totalCo2 = Number(activities.reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));

  const recAiCo2 = Number(activities.filter((a) => a.type === 'ai').reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));
  const recCloudCo2 = Number(activities.filter((a) => a.type === 'cloud').reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));
  const recTransferCo2 = Number(activities.filter((a) => a.type === 'transfer').reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));
  const recComputeCo2 = Number(activities.filter((a) => a.type === 'compute').reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));

  const safeTotalCo2 = totalCo2 || 1;
  const recordsTotals = {
    totalKwh,
    totalCo2,
    aiCo2: recAiCo2,
    cloudCo2: recCloudCo2,
    transferCo2: recTransferCo2,
    computeCo2: recComputeCo2,
    aiPercent: Math.round((recAiCo2 / safeTotalCo2) * 100),
    cloudPercent: Math.round((recCloudCo2 / safeTotalCo2) * 100),
    transferPercent: Math.round((recTransferCo2 / safeTotalCo2) * 100),
    computePercent: Math.round((recComputeCo2 / safeTotalCo2) * 100),
  };

  const registeredUsers: UserProfile[] = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    email: acc.email,
    role: acc.role,
    avatarUrl: acc.avatarUrl,
    carbonBudgetKg: acc.carbonBudgetKg,
    joinedDate: acc.joinedDate
  }));

  return (
    <EcoContext.Provider
      value={{
        currentRoute,
        navigate,
        isSidebarOpen,
        setIsSidebarOpen,
        user,
        isAuthenticated,
        registeredUsers,
        login,
        register,
        updateUserProfile,
        logout,
        aiInput,
        setAiInput,
        cloudInput,
        setCloudInput,
        transferInput,
        setTransferInput,
        computeInput,
        setComputeInput,
        calculatedEmissions,
        activities,
        addCurrentActivitiesAsRecords,
        deleteActivity,
        deleteCollectedData,
        resetToDefaults,
        recordsTotals,
        recommendations,
        toggleRecommendation,
        mlPredictions: buildActivityPredictions(activities),
        toast,
        showToast,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = (): EcoContextType => {
  const context = useContext(EcoContext);
  if (!context) {
    throw new Error('useEco must be used within an EcoProvider');
  }
  return context;
};
