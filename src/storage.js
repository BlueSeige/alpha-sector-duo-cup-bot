const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: {} }, null, 2));
  }
}

function load() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Entry shape:
// { userId, username, brawlhallaId, platform, steamLink,
//   status: 'pending' | 'registered' | 'standby',
//   screenshotUrl, registeredAt, standbyPosition? }

function getEntry(userId) {
  const data = load();
  return data.entries[userId] || null;
}

function hasActiveEntry(userId) {
  return !!getEntry(userId);
}

function addPending({ userId, username, brawlhallaId, platform, steamLink }) {
  const data = load();
  data.entries[userId] = {
    userId,
    username,
    brawlhallaId,
    platform,
    steamLink,
    status: 'pending',
    screenshotUrl: null,
    registeredAt: null,
  };
  save(data);
}

function removeEntry(userId) {
  const data = load();
  delete data.entries[userId];
  save(data);
}

function completeEntry(userId, screenshotUrl, maxSlots) {
  const data = load();
  const entry = data.entries[userId];
  if (!entry) return null;

  const registeredCount = Object.values(data.entries).filter((e) => e.status === 'registered').length;
  entry.status = registeredCount < maxSlots ? 'registered' : 'standby';
  entry.screenshotUrl = screenshotUrl;
  entry.registeredAt = new Date().toISOString();

  if (entry.status === 'standby') {
    const standbyEntries = Object.values(data.entries)
      .filter((e) => e.status === 'standby')
      .sort((a, b) => new Date(a.registeredAt) - new Date(b.registeredAt));
    entry.standbyPosition = standbyEntries.findIndex((e) => e.userId === userId) + 1;
  }

  save(data);
  return entry;
}

function listEntries() {
  const data = load();
  return Object.values(data.entries);
}

module.exports = {
  getEntry,
  hasActiveEntry,
  addPending,
  removeEntry,
  completeEntry,
  listEntries,
};
