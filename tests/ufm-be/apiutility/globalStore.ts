// globalStore.ts
const g = (globalThis as any);

if (!g.globalStore) {
  g.globalStore = {
    store: {} as Record<string, any>,

    setValue(key: string, value: any) {
      this.store[key] = value;
    },

    getValue(key: string) {
      // Handle dynamicMonth keys dynamically
      const dynamicMonthMatch = key.match(/^dynamicMonth(?:([+-]\d+))?$/);

      if (dynamicMonthMatch) {
        const offset = dynamicMonthMatch[1] ? Number(dynamicMonthMatch[1]) : 0;

        const now = new Date();
        now.setFullYear(now.getFullYear() + 1); // 1 year ahead
        now.setMonth(now.getMonth() + offset);

        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');

        return `${year}${month}`;
      }

      // Default behavior for normal keys
      return this.store[key];
    },

    clear() {
      this.store = {};
    }
  };
}

export const globalStore = g.globalStore;
