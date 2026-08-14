const STORAGE_PREFIX = 'socialBrainStreak';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getStorageKey = (userEmail = '') => {
  const base = userEmail?.trim() || 'guest';
  return `${STORAGE_PREFIX}:${base}`;
};

const readStoredData = (userEmail = '') => {
  if (typeof window === 'undefined') {
    return { activeDates: [], currentStreak: 0, longestStreak: 0, totalActiveDays: 0, lastActiveDate: null };
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userEmail));
    if (!raw) return { activeDates: [], currentStreak: 0, longestStreak: 0, totalActiveDays: 0, lastActiveDate: null };

    const parsed = JSON.parse(raw);
    return {
      activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : [],
      currentStreak: Number(parsed.currentStreak) || 0,
      longestStreak: Number(parsed.longestStreak) || 0,
      totalActiveDays: Number(parsed.totalActiveDays) || 0,
      lastActiveDate: parsed.lastActiveDate || null,
    };
  } catch {
    return { activeDates: [], currentStreak: 0, longestStreak: 0, totalActiveDays: 0, lastActiveDate: null };
  }
};

const writeStoredData = (userEmail, data) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(userEmail), JSON.stringify(data));
};

export const getStreakStats = (userEmail = '') => readStoredData(userEmail);

export const recordDailyActivity = (userEmail = '') => {
  if (typeof window === 'undefined') return readStoredData(userEmail);

  const today = formatDate(new Date());
  const data = readStoredData(userEmail);
  const activeDates = [...new Set([...(data.activeDates || []), today])].sort();

  if (data.lastActiveDate === today) {
    return {
      ...data,
      activeDates,
      totalActiveDays: activeDates.length,
    };
  }

  let nextStreak = 1;
  if (data.lastActiveDate) {
    const last = new Date(`${data.lastActiveDate}T00:00:00`);
    const yesterday = addDays(last, 1);
    const expected = formatDate(yesterday);
    if (expected === today) {
      nextStreak = (data.currentStreak || 0) + 1;
    }
  }

  const nextData = {
    activeDates,
    currentStreak: nextStreak,
    longestStreak: Math.max(data.longestStreak || 0, nextStreak),
    totalActiveDays: activeDates.length,
    lastActiveDate: today,
  };

  writeStoredData(userEmail, nextData);
  return nextData;
};

export const getActivityCalendar = (activeDates = [], monthOffset = 0) => {
  const today = new Date();
  const visibleMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const iso = formatDate(date);
    cells.push({ date, iso, active: activeDates.includes(iso) });
  }

  return cells;
};
