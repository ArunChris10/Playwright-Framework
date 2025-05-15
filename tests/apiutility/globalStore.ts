import fs from 'fs';
import path from 'path';

const STORE_FILE = path.resolve(process.cwd(), '.globalStore.json');

function loadStore(): Record<string, any> {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading global store:', err);
  }
  return {};
}

function saveStore(store: Record<string, any>) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving global store:', err);
  }
}

export const globalStore = {
  setValue(key: string, value: any) {
    const store = loadStore();
    if (store.hasOwnProperty(key)) {
      console.warn(`Key "${key}" already exists in global store. Skipping write.`);
      return;
    }
    store[key] = value;
    saveStore(store);
    console.log(`Key "${key}" set successfully.`);
  },

  getValue(key: string): any {
    // Handle dynamic month logic: dynamicMonth, dynamicMonth+1, etc.
    const dynamicMonthMatch = key.match(/^dynamicMonth(?:([+-]\d+))?$/);
    if (dynamicMonthMatch) {
      const offset = dynamicMonthMatch[1] ? Number(dynamicMonthMatch[1]) : 0;
      const now = new Date();
      now.setFullYear(now.getFullYear() + 1); // As per your original logic
      now.setMonth(now.getMonth() + offset);
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      return `${year}${month}`;
    }

    // Handle dynamic year
    if (key === 'dynamicYear') {
      const currentYear = new Date().getFullYear();
      const minYear = currentYear + 1;
      const maxYear = currentYear + 60;
      return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    }

    const store = loadStore();
    return store[key];
  },

  listKeys() {
    const store = loadStore();
    return Object.keys(store);
  },

  clear() {
    saveStore({});
    console.log('Global store cleared.');
  }
};
