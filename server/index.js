import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import Database from 'better-sqlite3';
import { google } from 'googleapis';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.API_PORT || 3001);
const isProduction = process.env.NODE_ENV === 'production';
const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'SESSION_SECRET', 'TOKEN_ENCRYPTION_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}
if (!/^[a-f0-9]{64}$/i.test(process.env.TOKEN_ENCRYPTION_KEY)) {
  throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as 64 hexadecimal characters.');
}

const db = new Database(process.env.DATABASE_PATH || path.join(__dirname, 'ecomind.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL, avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS google_tokens (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    encrypted_token TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS user_consent (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, scope TEXT NOT NULL, status TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, feature)
  );
  CREATE TABLE IF NOT EXISTS storage_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, used_bytes INTEGER NOT NULL, capacity_bytes INTEGER,
    measured_at TEXT NOT NULL, energy_kwh REAL NOT NULL, co2_kg REAL NOT NULL, factor TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS storage_measurements_user_time ON storage_measurements(user_id, measured_at);
  CREATE TABLE IF NOT EXISTS activity_records (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL, quantity REAL NOT NULL, unit TEXT NOT NULL, source TEXT NOT NULL,
    measured_at TEXT NOT NULL, energy_kwh REAL NOT NULL, co2_kg REAL NOT NULL, methodology TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS activity_records_user_time ON activity_records(user_id, measured_at);
`);

const SQLiteStore = SQLiteStoreFactory(session);
app.set('trust proxy', isProduction ? 1 : 0);
app.use(express.json({ limit: '100kb' }));
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.dirname(process.env.DATABASE_PATH || path.join(__dirname, 'ecomind.sqlite')) }),
  name: 'ecomind.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'ecomind.sqlite');
const redirectUri = process.env.GOOGLE_REDIRECT_URI;
const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex');
const factors = {
  cloudKwhPerGbMonth: Number(process.env.CLOUD_KWH_PER_GB_MONTH || 0.02),
  gridKgPerKwh: Number(process.env.GRID_KG_PER_KWH || 0.475)
};
const loginScopes = ['openid', 'email', 'profile'];
const driveScopes = [...loginScopes, 'https://www.googleapis.com/auth/drive.metadata.readonly'];
const encrypt = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64')).join('.');
};
const decrypt = (value) => {
  const [iv, tag, ciphertext] = value.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
};
const oauthClient = () => new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri);
const requireUser = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Sign in required.' });
  next();
};
const setConsent = db.prepare(`INSERT INTO user_consent(user_id, feature, scope, status, updated_at)
  VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(user_id, feature) DO UPDATE SET scope=excluded.scope, status=excluded.status, updated_at=CURRENT_TIMESTAMP`);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/auth/google', (req, res) => {
  const oauth = oauthClient();
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthFlows = { ...(req.session.oauthFlows || {}), [state]: 'login' };
  const url = oauth.generateAuthUrl({ access_type: 'online', scope: loginScopes, state, include_granted_scopes: false });
  res.redirect(url);
});
app.get('/api/google/drive/connect', requireUser, (req, res) => {
  const oauth = oauthClient();
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthFlows = { ...(req.session.oauthFlows || {}), [state]: 'drive' };
  res.redirect(oauth.generateAuthUrl({
    access_type: 'offline', prompt: 'consent', scope: driveScopes, state,
    include_granted_scopes: true
  }));
});
app.get('/api/auth/callback', async (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    const flow = req.session.oauthFlows?.[state];
    if (!state || !flow || error) return res.redirect('/#/auth');
    delete req.session.oauthFlows[state];
    const oauth = oauthClient();
    const { tokens } = await oauth.getToken(code);
    oauth.setCredentials(tokens);

    if (flow === 'login') {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth });
      const { data } = await oauth2.userinfo.get();
      if (!data.id || !data.email || !data.verified_email) return res.redirect('/#/auth?google=failed');
      db.prepare(`INSERT INTO users(id,email,name,avatar_url) VALUES(?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name,avatar_url=excluded.avatar_url,updated_at=CURRENT_TIMESTAMP`)
        .run(data.id, data.email, data.name || data.email, data.picture || null);
      await new Promise((resolve, reject) => req.session.regenerate((err) => err ? reject(err) : resolve()));
      req.session.userId = data.id;
      req.session.user = { id: data.id, name: data.name || data.email, email: data.email, avatarUrl: data.picture || undefined };
      return req.session.save((err) => err ? next(err) : res.redirect('/#/dashboard'));
    }

    if (!req.session.userId) return res.redirect('/#/auth');
    const existing = db.prepare('SELECT encrypted_token FROM google_tokens WHERE user_id=?').get(req.session.userId);
    const prior = existing ? decrypt(existing.encrypted_token) : {};
    const secureTokens = { ...prior, ...tokens, refresh_token: tokens.refresh_token || prior.refresh_token };
    db.prepare(`INSERT INTO google_tokens(user_id, encrypted_token) VALUES(?,?)
      ON CONFLICT(user_id) DO UPDATE SET encrypted_token=excluded.encrypted_token,updated_at=CURRENT_TIMESTAMP`)
      .run(req.session.userId, encrypt(secureTokens));
    setConsent.run(req.session.userId, 'google_drive_storage', 'drive.metadata.readonly', 'granted');
    return res.redirect('/#/profile?drive=connected');
  } catch (error) { next(error); }
});
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: req.session.user || null });
});
app.post('/api/auth/logout', (req, res, next) => req.session.destroy((err) => {
  if (err) return next(err);
  res.clearCookie('ecomind.sid');
  res.json({ ok: true });
}));
app.get('/api/google/drive/status', requireUser, (req, res) => {
  const token = db.prepare('SELECT 1 FROM google_tokens WHERE user_id=?').get(req.session.userId);
  const consent = db.prepare('SELECT status,updated_at FROM user_consent WHERE user_id=? AND feature=?')
    .get(req.session.userId, 'google_drive_storage');
  const lastSync = db.prepare('SELECT measured_at FROM storage_measurements WHERE user_id=? ORDER BY measured_at DESC LIMIT 1')
    .get(req.session.userId);
  res.json({ connected: Boolean(token), status: consent?.status || 'not_connected', lastSyncAt: lastSync?.measured_at || null });
});
app.post('/api/google/drive/sync', requireUser, async (req, res, next) => {
  try {
    const row = db.prepare('SELECT encrypted_token FROM google_tokens WHERE user_id=?').get(req.session.userId);
    if (!row) return res.status(409).json({ error: 'Connect Google Drive storage access first.' });
    const oauth = oauthClient();
    oauth.setCredentials(decrypt(row.encrypted_token));
    const drive = google.drive({ version: 'v3', auth: oauth });
    const { data } = await drive.about.get({ fields: 'storageQuota' });
    const usedBytes = Number(data.storageQuota?.usage || 0);
    const capacityBytes = data.storageQuota?.limit ? Number(data.storageQuota.limit) : null;
    const measuredAt = new Date().toISOString();
    const usedGb = usedBytes / (1024 ** 3);
    const energyKwh = usedGb * factors.cloudKwhPerGbMonth;
    const co2Kg = energyKwh * factors.gridKgPerKwh;
    db.prepare(`INSERT INTO storage_measurements(user_id,provider,used_bytes,capacity_bytes,measured_at,energy_kwh,co2_kg,factor)
      VALUES(?,?,?,?,?,?,?,?)`).run(req.session.userId, 'Google account storage quota', usedBytes, capacityBytes, measuredAt,
      energyKwh, co2Kg, `${factors.cloudKwhPerGbMonth} kWh/GB/month × ${factors.gridKgPerKwh} kgCO2e/kWh`);
    setConsent.run(req.session.userId, 'google_drive_storage', 'drive.metadata.readonly', 'granted');
    res.json({ provider: 'Google account storage quota', usedBytes, capacityBytes, measuredAt,
      method: 'API measurement', energyKwh, co2Kg,
      note: 'Google reports account-wide storage quota. It may include Drive, Gmail, and Photos usage.' });
  } catch (error) {
    if (error.code === 401 || error.code === 403) return res.status(502).json({ error: 'Google Drive access expired or was denied. Reconnect this data source.' });
    next(error);
  }
});
app.get('/api/google/drive/history', requireUser, (req, res) => {
  const rows = db.prepare('SELECT provider,used_bytes,capacity_bytes,measured_at,energy_kwh,co2_kg,factor FROM storage_measurements WHERE user_id=? ORDER BY measured_at DESC LIMIT 180')
    .all(req.session.userId);
  res.json({ measurements: rows });
});
app.post('/api/google/drive/disconnect', requireUser, async (req, res, next) => {
  try {
    const row = db.prepare('SELECT encrypted_token FROM google_tokens WHERE user_id=?').get(req.session.userId);
    if (row) {
      const tokens = decrypt(row.encrypted_token);
      const oauth = oauthClient();
      try { await oauth.revokeToken(tokens.refresh_token || tokens.access_token); } catch { /* local revocation still clears credentials */ }
    }
    db.prepare('DELETE FROM google_tokens WHERE user_id=?').run(req.session.userId);
    setConsent.run(req.session.userId, 'google_drive_storage', 'drive.metadata.readonly', 'revoked');
    res.json({ ok: true });
  } catch (error) { next(error); }
});
app.get('/api/activities', requireUser, (req, res) => {
  const rows = db.prepare('SELECT * FROM activity_records WHERE user_id=? ORDER BY measured_at DESC LIMIT 1000').all(req.session.userId);
  res.json({ activities: rows });
});
app.post('/api/activities', requireUser, (req, res) => {
  const { category, quantity, unit, source = 'manual' } = req.body || {};
  const allowed = ['ai', 'cloud', 'transfer', 'compute'];
  if (!allowed.includes(category) || !Number.isFinite(quantity) || quantity < 0 || typeof unit !== 'string') {
    return res.status(400).json({ error: 'Provide a valid category, non-negative quantity, and unit.' });
  }
  const rateByCategory = { ai: Number(process.env.AI_KWH_PER_QUERY || 0.002), cloud: factors.cloudKwhPerGbMonth,
    transfer: Number(process.env.TRANSFER_KWH_PER_GB || 0.03), compute: Number(process.env.COMPUTE_KWH_PER_HOUR || 0.05) };
  const energyKwh = quantity * rateByCategory[category];
  const co2Kg = energyKwh * factors.gridKgPerKwh;
  const id = crypto.randomUUID();
  const measuredAt = new Date().toISOString();
  db.prepare(`INSERT INTO activity_records(id,user_id,category,quantity,unit,source,measured_at,energy_kwh,co2_kg,methodology)
    VALUES(?,?,?,?,?,?,?,?,?,?)`).run(id, req.session.userId, category, quantity, unit, source, measuredAt, energyKwh, co2Kg,
    `configurable factor × ${factors.gridKgPerKwh} kgCO2e/kWh`);
  res.status(201).json({ id, category, quantity, unit, source, measuredAt, energyKwh, co2Kg });
});
app.delete('/api/activities', requireUser, (req, res) => {
  const activities = db.prepare('DELETE FROM activity_records WHERE user_id=?').run(req.session.userId).changes;
  const measurements = db.prepare('DELETE FROM storage_measurements WHERE user_id=?').run(req.session.userId).changes;
  res.json({ deletedActivities: activities, deletedMeasurements: measurements });
});
app.delete('/api/account', requireUser, async (req, res, next) => {
  try {
    const id = req.session.userId;
    const row = db.prepare('SELECT encrypted_token FROM google_tokens WHERE user_id=?').get(id);
    if (row) {
      const tokens = decrypt(row.encrypted_token);
      try { await oauthClient().revokeToken(tokens.refresh_token || tokens.access_token); } catch { /* continue with deletion */ }
    }
    db.prepare('DELETE FROM users WHERE id=?').run(id);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('ecomind.sid');
      res.json({ ok: true });
    });
  } catch (error) { next(error); }
});

if (isProduction) {
  const distDir = path.resolve(__dirname, '../dist');
  app.use(express.static(distDir));
  app.get('*path', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'EcoMind could not complete this request.' });
});
app.listen(port, () => console.log(`EcoMind API listening on port ${port}`));
