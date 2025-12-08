/**
 * Cross-Browser Compatibility Utilities
 * Provides feature detection, polyfills, and compatibility helpers
 * for Safari, Chrome, Firefox, Opera, Brave, and Internet Explorer
 */

// ==================== Type Definitions for Legacy APIs ====================

/** Legacy Navigator with prefixed getUserMedia APIs */
interface LegacyNavigator extends Navigator {
  getUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: Error) => void,
  ) => void;
  webkitGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: Error) => void,
  ) => void;
  mozGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: Error) => void,
  ) => void;
  msGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: Error) => void,
  ) => void;
  brave?: { isBrave: () => Promise<boolean> };
}

/** Legacy globalThis with prefixed animation frame APIs */
interface LegacyGlobalThis {
  webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
  mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
  webkitCancelAnimationFrame?: (id: number) => void;
  mozCancelAnimationFrame?: (id: number) => void;
}

/** Record type for dynamic CSS property access */
type DynamicStyleRecord = Record<string, string>;

/** Error with optional properties */
interface CameraError extends Error {
  name: string;
  message: string;
}

// ==================== Browser Detection ====================

export interface BrowserInfo {
  name: string;
  version: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isIE: boolean;
  isOpera: boolean;
  isBrave: boolean;
}

export const getBrowserInfo = (): BrowserInfo => {
  if (globalThis.window === undefined || typeof navigator === "undefined") {
    return {
      name: "unknown",
      version: "0",
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isEdge: false,
      isIE: false,
      isOpera: false,
      isBrave: false,
    };
  }

  const ua = navigator.userAgent;
  // Access vendor via Reflect to avoid deprecated property warnings while still differentiating Safari vs Chrome
  const vendor = (Reflect.get(navigator, "vendor") as string | undefined) ?? "";

  // Detect specific browsers
  const isIE = /MSIE|Trident/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isOpera = /OPR|Opera/.test(ua);
  const isFirefox = /Firefox/.test(ua) && !/Seamonkey/.test(ua);
  const isChrome = /Chrome/.test(ua) && /Google Inc/.test(vendor) && !isEdge && !isOpera;
  const isSafari = /Safari/.test(ua) && /Apple Computer/.test(vendor) && !isChrome;
  const isBrave = !!(navigator as LegacyNavigator).brave;

  // Detect mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  // Use Reflect to avoid deprecated platform warning while keeping iPadOS detection accurate
  const navigatorPlatform = (Reflect.get(navigator, "platform") as string | undefined) ?? "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigatorPlatform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);

  // Get version using exec for better performance
  let version = "0";
  const versionRegex = /(Chrome|Firefox|Safari|OPR|Edge|MSIE|rv:)[\s/]?([\d.]+)/;
  const versionMatch = versionRegex.exec(ua);
  if (versionMatch) {
    version = versionMatch[2];
  }

  // Get browser name
  let name = "unknown";
  if (isBrave) name = "Brave";
  else if (isIE) name = "Internet Explorer";
  else if (isEdge) name = "Edge";
  else if (isOpera) name = "Opera";
  else if (isFirefox) name = "Firefox";
  else if (isSafari) name = "Safari";
  else if (isChrome) name = "Chrome";

  return {
    name,
    version,
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isIE,
    isOpera,
    isBrave,
  };
};

// ==================== Feature Detection ====================

export interface FeatureSupport {
  getUserMedia: boolean;
  mediaDevices: boolean;
  webGL: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  fetch: boolean;
  promise: boolean;
  cssVariables: boolean;
  flexbox: boolean;
  grid: boolean;
  backdropFilter: boolean;
  webAnimations: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  clipboard: boolean;
  touchEvents: boolean;
  pointerEvents: boolean;
  serviceWorker: boolean;
  webWorker: boolean;
}

export const detectFeatures = (): FeatureSupport => {
  if (globalThis.window === undefined) {
    return {
      getUserMedia: false,
      mediaDevices: false,
      webGL: false,
      localStorage: false,
      sessionStorage: false,
      fetch: false,
      promise: false,
      cssVariables: false,
      flexbox: false,
      grid: false,
      backdropFilter: false,
      webAnimations: false,
      intersectionObserver: false,
      resizeObserver: false,
      clipboard: false,
      touchEvents: false,
      pointerEvents: false,
      serviceWorker: false,
      webWorker: false,
    };
  }

  const legacyNav = navigator as LegacyNavigator;

  // Check getUserMedia support with fallbacks
  const getUserMedia =
    !!navigator.mediaDevices?.getUserMedia ||
    !!legacyNav.getUserMedia ||
    !!legacyNav.webkitGetUserMedia ||
    !!legacyNav.mozGetUserMedia ||
    !!legacyNav.msGetUserMedia;

  const mediaDevices = !!navigator.mediaDevices?.enumerateDevices;

  // WebGL support
  let webGL = false;
  try {
    const canvas = document.createElement("canvas");
    webGL = !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    webGL = false;
  }

  // Storage support
  let localStorage = false;
  let sessionStorage = false;
  try {
    localStorage = !!globalThis.localStorage;
    globalThis.localStorage.setItem("test", "test");
    globalThis.localStorage.removeItem("test");
  } catch {
    localStorage = false;
  }
  try {
    sessionStorage = !!globalThis.sessionStorage;
    globalThis.sessionStorage.setItem("test", "test");
    globalThis.sessionStorage.removeItem("test");
  } catch {
    sessionStorage = false;
  }

  // CSS feature detection
  let cssVariables = false;
  let backdropFilter = false;
  let flexbox = false;
  let grid = false;

  try {
    cssVariables = !!globalThis.CSS?.supports?.("--test", "0");
    backdropFilter =
      !!globalThis.CSS?.supports?.("backdrop-filter", "blur(1px)") ||
      !!globalThis.CSS?.supports?.("-webkit-backdrop-filter", "blur(1px)");
    flexbox = !!globalThis.CSS?.supports?.("display", "flex");
    grid = !!globalThis.CSS?.supports?.("display", "grid");
  } catch {
    // Fallback detection for older browsers
    const testEl = document.createElement("div");
    cssVariables = testEl.style.setProperty !== undefined;
    flexbox = "flex" in testEl.style || "webkitFlex" in testEl.style;
    grid = "grid" in testEl.style;
  }

  return {
    getUserMedia,
    mediaDevices,
    webGL,
    localStorage,
    sessionStorage,
    fetch: typeof fetch !== "undefined",
    promise: typeof Promise !== "undefined",
    cssVariables,
    flexbox,
    grid,
    backdropFilter,
    webAnimations: typeof Element !== "undefined" && "animate" in Element.prototype,
    intersectionObserver: typeof IntersectionObserver !== "undefined",
    resizeObserver: typeof ResizeObserver !== "undefined",
    clipboard: !!navigator.clipboard?.writeText,
    touchEvents: "ontouchstart" in globalThis || navigator.maxTouchPoints > 0,
    pointerEvents: !!globalThis.PointerEvent,
    serviceWorker: "serviceWorker" in navigator,
    webWorker: typeof Worker !== "undefined",
  };
};

// ==================== Camera/Media Compatibility ====================

export interface CameraConstraints {
  video: MediaTrackConstraints | boolean;
  audio?: boolean;
}

/**
 * Get cross-browser compatible camera constraints
 * Handles Safari, iOS, and other browser-specific requirements
 */
export const getCameraConstraints = (
  preferredFacingMode: "user" | "environment" = "environment",
  browserInfo?: BrowserInfo,
): CameraConstraints => {
  const info = browserInfo ?? getBrowserInfo();

  // Base video constraints
  const baseConstraints: MediaTrackConstraints = {
    facingMode: preferredFacingMode,
  };

  // iOS Safari specific handling
  if (info.isIOS && info.isSafari) {
    return {
      video: {
        facingMode: { ideal: preferredFacingMode },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
      },
      audio: false,
    };
  }

  // Android specific handling
  if (info.isAndroid) {
    return {
      video: {
        facingMode: { exact: preferredFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };
  }

  // Desktop Safari
  if (info.isSafari) {
    return {
      video: {
        facingMode: preferredFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };
  }

  // Default constraints for other browsers
  return {
    video: {
      ...baseConstraints,
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
    },
    audio: false,
  };
};

/**
 * Cross-browser getUserMedia with fallbacks
 * Supports legacy prefixed APIs for older browsers
 */
export const getUserMediaCompat = async (
  constraints: MediaStreamConstraints,
): Promise<MediaStream> => {
  // Modern API
  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  const legacyNav = navigator as LegacyNavigator;

  // Legacy prefixed APIs
  const legacyGetUserMedia =
    legacyNav.getUserMedia ??
    legacyNav.webkitGetUserMedia ??
    legacyNav.mozGetUserMedia ??
    legacyNav.msGetUserMedia;

  if (legacyGetUserMedia) {
    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, constraints, resolve, reject);
    });
  }

  throw new Error("getUserMedia is not supported in this browser");
};

/**
 * Check if camera is available and accessible
 * Handles browser-specific permission models
 */
export const checkCameraAvailability = async (
  browserInfo?: BrowserInfo,
): Promise<{
  available: boolean;
  permissionState: "granted" | "denied" | "prompt" | "unknown";
  error?: string;
}> => {
  const info = browserInfo ?? getBrowserInfo();

  try {
    // Check if we're in a secure context (HTTPS)
    if (globalThis.window !== undefined && !globalThis.isSecureContext) {
      return {
        available: false,
        permissionState: "denied",
        error: "Camera access requires a secure context (HTTPS)",
      };
    }

    // Check for getUserMedia support
    const features = detectFeatures();
    if (!features.getUserMedia) {
      return {
        available: false,
        permissionState: "denied",
        error: "Camera API is not supported in this browser",
      };
    }

    // Try to check permission state (not supported in all browsers)
    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: "camera" as PermissionName });
        if (permission.state === "denied") {
          return {
            available: false,
            permissionState: "denied",
            error: "Camera permission was denied",
          };
        }
        return {
          available: true,
          permissionState: permission.state,
        };
      } catch {
        // Permission query not supported, continue with stream check
      }
    }

    // For Safari and browsers that don't support permissions API,
    // try to get a stream briefly to check availability
    const constraints = getCameraConstraints("environment", info);
    const stream = await getUserMediaCompat(constraints);

    // Release the stream immediately
    stream.getTracks().forEach((track) => track.stop());

    return {
      available: true,
      permissionState: "granted",
    };
  } catch (error: unknown) {
    const cameraError = error as CameraError;
    const errorMessage = cameraError?.message || cameraError?.name || "Unknown error";

    // Map common error types
    if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission")) {
      return {
        available: false,
        permissionState: "denied",
        error: "Camera permission was denied by the user",
      };
    }

    if (errorMessage.includes("NotFoundError") || errorMessage.includes("DevicesNotFound")) {
      return {
        available: false,
        permissionState: "unknown",
        error: "No camera device found",
      };
    }

    if (errorMessage.includes("NotReadableError") || errorMessage.includes("TrackStartError")) {
      return {
        available: false,
        permissionState: "unknown",
        error: "Camera is in use by another application",
      };
    }

    return {
      available: false,
      permissionState: "unknown",
      error: errorMessage,
    };
  }
};

/**
 * Properly stop and release camera stream
 * Handles browser-specific cleanup requirements
 */
export const releaseCameraStream = (stream: MediaStream | null): void => {
  if (!stream) return;

  try {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error releasing camera stream:", error);
  }
};

// ==================== Storage Compatibility ====================

/**
 * Cross-browser localStorage with fallback to cookies or memory
 */
class StorageCompat {
  private readonly memoryStorage: Map<string, string> = new Map();
  private readonly storageType: "localStorage" | "sessionStorage" | "cookie" | "memory";

  constructor(preferredType: "localStorage" | "sessionStorage" = "localStorage") {
    this.storageType = this.detectAvailableStorage(preferredType);
  }

  private detectAvailableStorage(
    preferred: "localStorage" | "sessionStorage",
  ): "localStorage" | "sessionStorage" | "cookie" | "memory" {
    if (globalThis.window === undefined) return "memory";

    try {
      const storage =
        preferred === "localStorage" ? globalThis.localStorage : globalThis.sessionStorage;
      const testKey = "__storage_test__";
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return preferred;
    } catch {
      // Check for cookie support
      if (navigator.cookieEnabled) {
        return "cookie";
      }
      return "memory";
    }
  }

  getItem(key: string): string | null {
    switch (this.storageType) {
      case "localStorage":
        return globalThis.localStorage.getItem(key);
      case "sessionStorage":
        return globalThis.sessionStorage.getItem(key);
      case "cookie":
        return this.getCookie(key);
      case "memory":
        return this.memoryStorage.get(key) ?? null;
    }
  }

  setItem(key: string, value: string): void {
    switch (this.storageType) {
      case "localStorage":
        globalThis.localStorage.setItem(key, value);
        break;
      case "sessionStorage":
        globalThis.sessionStorage.setItem(key, value);
        break;
      case "cookie":
        this.setCookie(key, value);
        break;
      case "memory":
        this.memoryStorage.set(key, value);
        break;
    }
  }

  removeItem(key: string): void {
    switch (this.storageType) {
      case "localStorage":
        globalThis.localStorage.removeItem(key);
        break;
      case "sessionStorage":
        globalThis.sessionStorage.removeItem(key);
        break;
      case "cookie":
        this.deleteCookie(key);
        break;
      case "memory":
        this.memoryStorage.delete(key);
        break;
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() ?? null;
    }
    return null;
  }

  private setCookie(name: string, value: string, days: number = 365): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value,
    )}; expires=${expires}; path=/; SameSite=Lax`;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

export const createStorageCompat = (type?: "localStorage" | "sessionStorage") =>
  new StorageCompat(type);

// ==================== Event Compatibility ====================

/**
 * Add event listener with passive option support detection
 */
export const addPassiveEventListener = (
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
): void => {
  let supportsPassive = false;

  try {
    const opts = Object.defineProperty({}, "passive", {
      get: function () {
        supportsPassive = true;
        return true;
      },
    });
    const noop = () => {};
    globalThis.addEventListener("testPassive", noop, opts);
    globalThis.removeEventListener("testPassive", noop, opts);
  } catch {
    supportsPassive = false;
  }

  element.addEventListener(event, handler, supportsPassive ? options : (options?.capture ?? false));
};

/**
 * Cross-browser touch/pointer event handling
 */
export const getPointerPosition = (
  event: MouseEvent | TouchEvent | PointerEvent,
): { x: number; y: number } => {
  if ("touches" in event && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  if ("clientX" in event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
  return { x: 0, y: 0 };
};

// ==================== CSS Compatibility ====================

/**
 * Apply CSS with vendor prefixes
 */
export const applyVendorPrefixedStyle = (
  element: HTMLElement,
  property: string,
  value: string,
): void => {
  const prefixes = ["", "-webkit-", "-moz-", "-ms-", "-o-"];
  const capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);
  const dynamicStyle = element.style as unknown as DynamicStyleRecord;

  prefixes.forEach((prefix) => {
    const prefixedProperty = prefix
      ? `${prefix}${capitalizedProperty}`.replaceAll(/-([a-z])/g, (g) => g[1].toUpperCase())
      : property;
    try {
      dynamicStyle[prefixedProperty] = value;
    } catch {
      // Property not supported with this prefix
    }
  });
};

/**
 * Get CSS variable value with fallback
 */
export const getCSSVariable = (variableName: string, fallback: string): string => {
  if (globalThis.window === undefined) return fallback;

  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    return value || fallback;
  } catch {
    return fallback;
  }
};

// ==================== URL Compatibility ====================

/**
 * Parse URL with fallback for older browsers
 */
export const parseURL = (urlString: string): URL | null => {
  try {
    return new URL(urlString);
  } catch {
    // Fallback for IE and older browsers
    try {
      const a = document.createElement("a");
      a.href = urlString;
      return {
        href: a.href,
        protocol: a.protocol,
        host: a.host,
        hostname: a.hostname,
        port: a.port,
        pathname: a.pathname,
        search: a.search,
        hash: a.hash,
        origin: `${a.protocol}//${a.host}`,
      } as unknown as URL;
    } catch {
      return null;
    }
  }
};

// ==================== Animation Compatibility ====================

/**
 * RequestAnimationFrame with fallback
 */
const getRequestAnimationFrame = (): ((callback: FrameRequestCallback) => number) => {
  if (globalThis.window === undefined) {
    return (callback: FrameRequestCallback) => setTimeout(callback, 1000 / 60) as unknown as number;
  }
  const legacyGlobal = globalThis as unknown as LegacyGlobalThis;
  return (
    globalThis.requestAnimationFrame ??
    legacyGlobal.webkitRequestAnimationFrame ??
    legacyGlobal.mozRequestAnimationFrame ??
    ((callback: FrameRequestCallback) => globalThis.setTimeout(callback, 1000 / 60))
  );
};

export const requestAnimationFrameCompat = getRequestAnimationFrame();

/**
 * CancelAnimationFrame with fallback
 */
const getCancelAnimationFrame = (): ((id: number) => void) => {
  if (globalThis.window === undefined) {
    return (id: number) => clearTimeout(id);
  }
  const legacyGlobal = globalThis as unknown as LegacyGlobalThis;
  return (
    globalThis.cancelAnimationFrame ??
    legacyGlobal.webkitCancelAnimationFrame ??
    legacyGlobal.mozCancelAnimationFrame ??
    ((id: number) => clearTimeout(id))
  );
};

export const cancelAnimationFrameCompat = getCancelAnimationFrame();

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (globalThis.window === undefined) return false;
  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// ==================== Fetch Compatibility ====================

/**
 * Fetch with timeout and abort support
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 30000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const fetchError = error as Error;
    if (fetchError.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

// ==================== Viewport Compatibility ====================

/**
 * Get viewport dimensions accounting for mobile browser chrome
 */
export const getViewportDimensions = (): { width: number; height: number; safeHeight: number } => {
  if (globalThis.window === undefined) {
    return { width: 0, height: 0, safeHeight: 0 };
  }

  const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  // Calculate safe height for iOS Safari (accounts for address bar)
  const safeHeight = globalThis.window?.visualViewport?.height ?? height;

  return { width, height, safeHeight };
};

/**
 * Get safe area insets for notched devices
 */
export const getSafeAreaInsets = (): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} => {
  if (globalThis.window === undefined || !globalThis.CSS?.supports) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);

  const getValue = (property: string): number => {
    const value = computedStyle.getPropertyValue(property);
    return Number.parseInt(value, 10) || 0;
  };

  return {
    top: getValue("--safe-area-inset-top") || getValue("env(safe-area-inset-top)") || 0,
    right: getValue("--safe-area-inset-right") || getValue("env(safe-area-inset-right)") || 0,
    bottom: getValue("--safe-area-inset-bottom") || getValue("env(safe-area-inset-bottom)") || 0,
    left: getValue("--safe-area-inset-left") || getValue("env(safe-area-inset-left)") || 0,
  };
};

// ==================== Export Browser Info Singleton ====================

let browserInfoCache: BrowserInfo | null = null;
let featureSupportCache: FeatureSupport | null = null;

export const browserInfo = (): BrowserInfo => {
  browserInfoCache ??= getBrowserInfo();
  return browserInfoCache;
};

export const featureSupport = (): FeatureSupport => {
  featureSupportCache ??= detectFeatures();
  return featureSupportCache;
};
