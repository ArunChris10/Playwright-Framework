export const globalStore = {
    store: {} as Record<string, any>,
  
    setValue(key: string, value: any) {
      this.store[key] = value;
    },
  
    getValue(key: string) {
      return this.store[key];
    },
  };
  