import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Where the backend lives.
 * - Web on your laptop: http://localhost:3000
 * - Android emulator: http://10.0.2.2:3000 (the emulator's name for your laptop)
 * - Real phone: set EXPO_PUBLIC_API_URL=http://<your-laptop-ip>:3000 in apps/mobile/.env
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')).replace(/\/$/, '');

export type Plan = 'guest' | 'free';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

const CLIENT_KEY = 'lightkeeper.clientId';
let clientId: string | null = null;
let plan: Plan = 'free';

function randomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = 'c_';
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/** Temporary identity until Firebase sign-in: one random id per app install. */
export async function loadClientId(): Promise<string> {
  if (clientId) return clientId;
  try {
    clientId = await AsyncStorage.getItem(CLIENT_KEY);
  } catch {
    clientId = null;
  }
  if (!clientId) {
    clientId = randomId();
    AsyncStorage.setItem(CLIENT_KEY, clientId).catch(() => undefined);
  }
  return clientId;
}

/** Signing out forgets this device's identity, so the next session starts empty. */
export async function resetClientId() {
  clientId = randomId();
  await AsyncStorage.setItem(CLIENT_KEY, clientId).catch(() => undefined);
}

export function setPlan(p: Plan) {
  plan = p;
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const id = await loadClientId();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-lightkeeper-client': id,
        'x-lightkeeper-plan': plan,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(`Can't reach the Lightkeeper server at ${API_URL}.`, 'OFFLINE', 0);
  }
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const body = (data ?? {}) as { message?: string | string[]; code?: string };
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(message || `Request failed (${res.status})`, body.code || `HTTP_${res.status}`, res.status);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
