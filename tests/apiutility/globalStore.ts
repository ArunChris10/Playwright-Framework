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
    const dynamicMonthMatch = key.match(/^dynamicMonth(?:([+-]\d+))?$/);
    const dynamicYearMatch = key.match(/^dynamicForecastYear(?:([+-]\d+))?$/);
    
    if (dynamicMonthMatch) {
      const offset = dynamicMonthMatch[1] ? Number(dynamicMonthMatch[1]) : 0;
      const now = new Date();
      now.setMonth(now.getMonth() + offset);
      let fiscalYear = now.getFullYear() + 1;
      let fiscalMonth = now.getMonth();
      if (fiscalMonth === 0) {
        fiscalYear -= 1;
        fiscalMonth = 12;
      }
      return `${fiscalYear}${fiscalMonth.toString().padStart(2, '0')}`;
    }

    const dynamicMonthStrMatch = key.match(/^dynamicMonthStr(?:([+-]\d+))?$/);
    if (dynamicMonthStrMatch) {
      const offset = dynamicMonthStrMatch[1] ? Number(dynamicMonthStrMatch[1]) : 0;
      const now = new Date();
      now.setMonth(now.getMonth() + offset);
      let fiscalYear = now.getFullYear() + 1;
      let fiscalMonth = now.getMonth();
      if (fiscalMonth === 0) {
        fiscalYear -= 1;
        fiscalMonth = 12;
      }
      const month = [ 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan' ];
      return `${month[fiscalMonth-1]} FY${fiscalYear.toString().substring(2)}`;
    }

    if (dynamicYearMatch) {
      const offset = dynamicYearMatch && dynamicYearMatch[1] ? Number(dynamicYearMatch[1]) : 0;

      const baseYear = new Date().getFullYear() + 1; // start from next year
      const year = baseYear + offset;
      
      return `${year}`;
    }

    // Handle dynamic year
    if (key === 'dynamicYear') {
      const currentYear = new Date().getFullYear();
      const minYear = currentYear + 1;
      const maxYear = currentYear + 60;
      return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    }

    if (key.includes("-lowercase")) {
      return this.store[key].toLowerCase();
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
