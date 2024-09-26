import debug from "debug";

export class Logger {
    static log(message: string, ...optionalParams: any[]) {
      debug.log(`[LOG] ${message}`, ...optionalParams);
    }
  
    static warn(message: string, ...optionalParams: any[]) {
      debug.log(`[WARN] ${message}`, ...optionalParams);
    }
  
    static error(message: string, ...optionalParams: any[]) {
      debug.log(`[ERROR] ${message}`, ...optionalParams);
    }
  }