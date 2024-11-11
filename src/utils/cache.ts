type Storable =
  | undefined
  | string
  | number
  | boolean
  | null
  | { [key: string]: Storable }
  | Storable[];

function checkKey(key: string, action: string) {
  if (!key) {
    throw new Error(`${action}操作失败：缺少key`);
  }
}

const sessionCache = {
  set(key: string, value: Storable) {
    checkKey(key, "set");

    if (typeof value === "undefined") {
      throw new Error(`${key}值为undefined`);
    }

    let valueToStore: string;

    switch (typeof value) {
      case "object":
        if (value === null) {
          valueToStore = "null";
        } else {
          valueToStore = JSON.stringify(value);
        }
        break;
      default:
        valueToStore = value.toString();
    }

    sessionStorage.setItem(key, valueToStore);
  },

  get<T extends Storable = Storable>(key: string): T | undefined {
    checkKey(key, "get");

    const rawValue = sessionStorage.getItem(key);

    if (!rawValue) {
      return undefined;
    }

    try {
      if (rawValue === "true") return true as never as T;
      if (rawValue === "false") return false as never as T;
      if (rawValue === "null") return null as never as T;
      return JSON.parse(rawValue) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return rawValue as never as T;
      }
      throw error;
    }
  },

  remove(key: string) {
    checkKey(key, "remove");

    sessionStorage.removeItem(key);
  },

  clear(): void {
    sessionStorage.clear();
  },

  getAllKeys(): string[] {
    return Object.keys(sessionStorage);
  },

  has(key: string) {
    checkKey(key, "has");

    return sessionStorage.getItem(key) !== null;
  },
};
const localCache = {
  set(key: string, value: Storable) {
    checkKey(key, "set");

    if (typeof value === "undefined") {
      throw new Error(`${key}值为undefined`);
    }

    let valueToStore: string;

    switch (typeof value) {
      case "object":
        if (value === null) {
          valueToStore = "null";
        } else {
          valueToStore = JSON.stringify(value);
        }
        break;
      default:
        valueToStore = value.toString();
    }

    localStorage.setItem(key, valueToStore);
  },

  get<T extends Storable = Storable>(key: string): T | undefined {
    checkKey(key, "get");

    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return undefined;
    }

    try {
      if (rawValue === "true") return true as never as T;
      if (rawValue === "false") return false as never as T;
      if (rawValue === "null") return null as never as T;
      return JSON.parse(rawValue) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return rawValue as never as T;
      }
      throw error;
    }
  },

  remove(key: string) {
    checkKey(key, "remove");

    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },

  getAllKeys(): string[] {
    return Object.keys(localStorage);
  },

  has(key: string) {
    checkKey(key, "has");

    return localStorage.getItem(key) !== null;
  },
};

export default {
  session: sessionCache,
  local: localCache,
};
