export class JsonUtils {
    /**
     * Safely parses a string to JSON.
     */
    static safeParse(jsonString: string): any | null {
      try {
        return JSON.parse(jsonString);
      } catch (err) {
        console.error("Invalid JSON string:", err);
        return null;
      }
    }
  
    /**
     * Get value by key from a flat JSON object.
     */
    static getValueByKey(json: any, key: string): any {
      if (!json || typeof json !== 'object') return undefined;
      return json[key];
    }
  
    /**
     * Get nested value by path (e.g., "user.profile.name")
     */
    static getValueByPath(json: any, path: string): any {
      return path.split('.').reduce((acc, key) => acc && acc[key], json);
    }
  
    /**
     * Check if key exists in a JSON object.
     */
    static hasKey(json: any, key: string): boolean {
      return Object.prototype.hasOwnProperty.call(json, key);
    }
  
    /**
     * Validate if JSON has all required keys.
     */
    static validateKeys(json: any, requiredKeys: string[]): boolean {
      return requiredKeys.every((key) => this.hasKey(json, key));
    }
  
    /**
     * Pretty-print JSON.
     */
    static prettyPrint(json: any): string {
      return JSON.stringify(json, null, 2);
    }
  
    /**
     * Deep merge two JSON objects.
     */
    static deepMerge(target: any, source: any): any {
      const output = { ...target };
      if (typeof target === 'object' && typeof source === 'object') {
        Object.keys(source).forEach((key) => {
          if (source[key] instanceof Object) {
            output[key] = this.deepMerge(target[key] ?? {}, source[key]);
          } else {
            output[key] = source[key];
          }
        });
      }
      return output;
    }
  
    /**
     * Compare two JSON objects for equality.
     */
    static isEqual(json1: any, json2: any): boolean {
      return JSON.stringify(json1) === JSON.stringify(json2);
    }
  
    /**
     * Extract array of values by key from JSON array.
     */
    static extractValuesFromArray(jsonArray: any[], key: string): any[] {
      return jsonArray.map((obj) => obj[key]);
    }
  }
  