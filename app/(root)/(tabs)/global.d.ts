declare global {
    var setImmediate: (callback: () => void) => NodeJS.Timeout;
  }
  
  export {};
  