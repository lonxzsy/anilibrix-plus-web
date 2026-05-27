// Minimal hls.js type declaration for TypeScript
declare module 'hls.js' {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      MEDIA_ATTACHED: string;
      MANIFEST_PARSED: string;
      ERROR: string;
    };
    static ErrorTypes: {
      NETWORK_ERROR: string;
      MEDIA_ERROR: string;
    };
    static ErrorDetails: Record<string, string>;

    constructor(config?: any);
    attachMedia(media: HTMLMediaElement): void;
    detachMedia(): void;
    loadSource(url: string): void;
    startLoad(): void;
    stopLoad(): void;
    recoverMediaError(): void;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    currentLevel: number;
    levels: any[];
    autoLevelEnabled: boolean;
  }
}
