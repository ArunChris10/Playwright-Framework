import fs from 'fs';
import path from 'path';

const g = globalThis as any;

// Use project root directory instead of __dirname
const STORE_FILE = path.resolve(process.cwd(), '.globalStore.json');

function loadFromFile(): Record<string, any> {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading global store from file:', err);
  }
  return {};
}

function saveToFile(store: Record<string, any>) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving global store to file:', err);
  }
}

if (!g.globalStore) {
  g.globalStore = {
    store: loadFromFile(),

    setValue(key: string, value: any) {
      if (key in this.store) {
        console.warn(`Key "${key}" already exists in globalStore. Skipping write.`);
        return;
      }
      this.store[key] = value;
      saveToFile(this.store);
      console.log(`Key "${key}" set successfully.`);
    },

    getValue(key: string) {
      const dynamicMonthMatch = key.match(/^dynamicMonth(?:([+-]\d+))?$/);
      if (dynamicMonthMatch) {
        const offset = dynamicMonthMatch[1] ? Number(dynamicMonthMatch[1]) : 0;
        const now = new Date();
        now.setFullYear(now.getFullYear() + 1);
        now.setMonth(now.getMonth() + offset);
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${year}${month}`;
      }

      if (key === 'dynamicYear') {
        const currentYear = new Date().getFullYear();
        const minYear = currentYear + 1;
        const maxYear = currentYear + 60;
        return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
      }

      return this.store[key];
    },

    listKeys() {
      return Object.keys(this.store);
    }
  };
}

export const globalStore = g.globalStore;
