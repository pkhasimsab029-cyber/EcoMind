import React, { useCallback, useEffect, useState } from 'react';
import { Cloud, LoaderCircle, RefreshCw, ShieldCheck, Trash2, Unplug } from 'lucide-react';
import { useEco } from '../context/EcoContext';

type DriveStatus = { connected: boolean; status: string; lastSyncAt: string | null };
type Measurement = {
  provider: string; usedBytes: number; capacityBytes: number | null; measuredAt: string;
  method: string; energyKwh: number; co2Kg: number; note: string;
};

export const DataSourcesCard: React.FC = () => {
  const { deleteCollectedData } = useEco();
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refreshStatus = useCallback(async () => {
    try {
      const authResponse = await fetch('/api/auth/me', { credentials: 'same-origin' });
      const auth = authResponse.ok ? await authResponse.json() : { user: null };
      const hasGoogleSession = Boolean(auth.user);
      setGoogleSignedIn(hasGoogleSession);
      if (!hasGoogleSession) { setStatus(null); setMeasurement(null); return; }
      const response = await fetch('/api/google/drive/status', { credentials: 'same-origin' });
      if (!response.ok) { setStatus(null); return; }
      const current: DriveStatus = await response.json();
      setStatus(current);
      if (current.connected) {
        const historyResponse = await fetch('/api/google/drive/history', { credentials: 'same-origin' });
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          const latest = history.measurements?.[0];
          if (latest) setMeasurement({
            provider: latest.provider,
            usedBytes: Number(latest.used_bytes),
            capacityBytes: latest.capacity_bytes == null ? null : Number(latest.capacity_bytes),
            measuredAt: latest.measured_at,
            method: 'API measurement',
            energyKwh: Number(latest.energy_kwh),
            co2Kg: Number(latest.co2_kg),
            note: 'Google reports account-wide storage quota. It may include Drive, Gmail, and Photos usage.'
          });
        }
      }
    } catch { setStatus(null); }
  }, []);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  const sync = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/google/drive/sync', { method: 'POST', credentials: 'same-origin' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Storage sync failed.');
      setMeasurement(data);
      setMessage('Storage quota synchronized.');
      await refreshStatus();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Storage sync failed.'); }
    finally { setBusy(false); }
  };

  const disconnect = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/google/drive/disconnect', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Could not disconnect Google storage.');
      setMeasurement(null);
      setMessage('Google storage access disconnected.');
      await refreshStatus();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Disconnect failed.'); }
    finally { setBusy(false); }
  };

  const clearData = async () => {
    if (!window.confirm('Delete EcoMind activity records and Google storage measurement history for this account?')) return;
    setBusy(true); setMessage('');
    try {
      await deleteCollectedData();
      setMeasurement(null);
      setMessage('Collected activity records and storage history deleted.');
      await refreshStatus();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete collected data.'); }
    finally { setBusy(false); }
  };

  const formatGb = (bytes: number) => (bytes / (1024 ** 3)).toFixed(2);
  const connected = status?.connected === true;

  return (
    <section className="eco-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Cloud className="h-5 w-5" /></div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Data Sources</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
              Google sign-in and Google storage access are separate. Storage permission reads account-wide quota only; it does not read file contents.
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {connected ? 'Connected' : googleSignedIn ? 'Permission Required' : 'Google sign-in required'}
        </span>
      </div>

      {measurement && (
        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-3">
          <div><span className="text-slate-500">Google account storage used</span><p className="mt-1 font-bold text-slate-800">{formatGb(measurement.usedBytes)} GB</p></div>
          <div><span className="text-slate-500">Estimated energy / CO₂</span><p className="mt-1 font-bold text-slate-800">{measurement.energyKwh.toFixed(3)} kWh · {measurement.co2Kg.toFixed(3)} kg</p></div>
          <div><span className="text-slate-500">Last synchronized</span><p className="mt-1 font-bold text-slate-800">{new Date(measurement.measuredAt).toLocaleString()}</p></div>
          <p className="text-slate-500 sm:col-span-3">{measurement.note}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!connected ? (
          <a href={googleSignedIn ? '/api/google/drive/connect' : '/api/auth/google'} className="inline-flex items-center gap-2 rounded-xl bg-[#1F9D55] px-4 py-2 text-xs font-semibold text-white hover:bg-[#187E44]">
            <ShieldCheck className="h-4 w-4" /> {googleSignedIn ? 'Connect Google storage' : 'Continue with Google'}
          </a>
        ) : (
          <>
            <button onClick={sync} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#1F9D55] px-4 py-2 text-xs font-semibold text-white hover:bg-[#187E44] disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Synchronize storage
            </button>
            <button onClick={disconnect} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
              <Unplug className="h-4 w-4" /> Disconnect
            </button>
          </>
        )}
        {googleSignedIn && (
          <button onClick={clearData} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
            <Trash2 className="h-4 w-4" /> Delete collected data
          </button>
        )}
      </div>
      {message && <p role="status" className="mt-3 text-xs text-slate-600">{message}</p>}
    </section>
  );
};
