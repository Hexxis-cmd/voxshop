export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'client' | 'server';

export interface DiagnosticLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  event: string;
  source: LogSource;
  data?: unknown;
}

interface LoggerConfig {
  diagnosticsEnabled: boolean;
  minLevel: LogLevel;
}

type Listener = (entries: DiagnosticLogEntry[]) => void;

const MAX_ENTRIES = 200;
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];
const isLogLevel = (value: unknown): value is LogLevel =>
  typeof value === 'string' && LOG_LEVELS.includes(value as LogLevel);

const SENSITIVE_KEYS = new Set(['apikey', 'api_key', 'authorization', 'token', 'access_token', 'bearer']);

const config: LoggerConfig = {
  diagnosticsEnabled: false,
  minLevel: import.meta.env.PROD ? 'warn' : 'info',
};

let entries: DiagnosticLogEntry[] = [];
const listeners = new Set<Listener>();

const shouldOutput = (level: LogLevel): boolean => LEVEL_ORDER[level] >= LEVEL_ORDER[config.minLevel];

const redactValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactValue(nested);
      }
    }
    return out;
  }
  if (typeof value === 'string' && /bearer\s+[A-Za-z0-9_\-\.]+/i.test(value)) {
    return value.replace(/bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
  }
  return value;
};

const emit = (): void => {
  const snapshot = [...entries];
  listeners.forEach((listener) => listener(snapshot));
};

const append = (entry: DiagnosticLogEntry): void => {
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  emit();
};

const push = (level: LogLevel, event: string, data?: unknown): void => {
  const safeData = redactValue(data);
  const entry: DiagnosticLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    level,
    event,
    source: 'client',
    ...(safeData !== undefined ? { data: safeData } : {}),
  };

  if (config.diagnosticsEnabled) {
    append(entry);
  }

  if (shouldOutput(level)) {
    const method = level === 'debug' ? 'log' : level;
    (console[method as 'log' | 'info' | 'warn' | 'error'])(`[${level}] ${event}`, safeData ?? {});
  }
};

export const logger = {
  debug(event: string, data?: unknown): void {
    push('debug', event, data);
  },
  info(event: string, data?: unknown): void {
    push('info', event, data);
  },
  warn(event: string, data?: unknown): void {
    push('warn', event, data);
  },
  error(event: string, data?: unknown): void {
    push('error', event, data);
  },
  setDiagnosticsEnabled(enabled: boolean): void {
    config.diagnosticsEnabled = enabled;
    if (!enabled) {
      entries = [];
      emit();
    }
  },
  setMinLevel(level: LogLevel): void {
    config.minLevel = level;
  },
  getEntries(): DiagnosticLogEntry[] {
    return [...entries];
  },
  clear(): void {
    entries = [];
    emit();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener([...entries]);
    return () => listeners.delete(listener);
  },
};

export const normalizeExternalLog = (log: Partial<DiagnosticLogEntry>): DiagnosticLogEntry => {
  const level: LogLevel = isLogLevel(log.level) ? log.level : 'info';
  return {
    id: log.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: typeof log.timestamp === 'number' ? log.timestamp : Date.now(),
    event: typeof log.event === 'string' ? log.event : 'server.log',
    source: log.source === 'server' ? 'server' : 'client',
    level,
    ...(log.data !== undefined ? { data: redactValue(log.data) } : {}),
  };
};
