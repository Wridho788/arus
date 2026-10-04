import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeSeed } from './domain';
import { loadSnapshot, parseSnapshot, saveSnapshot, STORAGE_KEY, StorageProblem, resetSnapshot } from './storage';

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value); },
    },
  });
});

afterEach(() => vi.restoreAllMocks());

describe('versioned local repository', () => {
  it('preserves an intentionally empty snapshot instead of reseeding', () => {
    saveSnapshot({ version: 1, transactions: [], budgets: [] });
    expect(loadSnapshot()).toEqual({ version: 1, transactions: [], budgets: [] });
  });

  it('rejects invalid writes before replacing the saved snapshot', () => {
    const seed = loadSnapshot();
    const before = memory.get(STORAGE_KEY);
    expect(() => saveSnapshot({ ...seed, transactions: [{ ...seed.transactions[0], amount: -1 }] })).toThrow(StorageProblem);
    expect(memory.get(STORAGE_KEY)).toBe(before);
  });

  it('preserves unknown future versions for explicit recovery', () => {
    const raw = JSON.stringify({ version: 2, transactions: [], budgets: [] });
    memory.set(STORAGE_KEY, raw);
    expect(() => loadSnapshot()).toThrow(StorageProblem);
    expect(memory.get(STORAGE_KEY)).toBe(raw);
  });

  it('reports read failures and failed writes without losing saved data', () => {
    const seed = loadSnapshot();
    const before = memory.get(STORAGE_KEY);
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => saveSnapshot({ ...seed, transactions: [] })).toThrow(/Penyimpanan browser/);
    expect(() => resetSnapshot()).toThrow(/Penyimpanan browser/);
    expect(memory.get(STORAGE_KEY)).toBe(before);
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    expect(() => loadSnapshot()).toThrow(/Penyimpanan browser/);
  });

  it('resets once to the current-month example state', () => {
    saveSnapshot({ version: 1, transactions: [], budgets: [] });
    const reset = resetSnapshot();
    expect(reset.transactions).toHaveLength(10);
    expect(reset.budgets).toHaveLength(4);
    expect(loadSnapshot()).toEqual(reset);
    expect(resetSnapshot()).toEqual(reset);
  });

  it('seeds once, then loads the saved changes', () => {
    const first = loadSnapshot();
    expect(first.transactions).toHaveLength(10);
    saveSnapshot({ ...first, transactions: first.transactions.slice(1) });
    expect(loadSnapshot().transactions).toHaveLength(9);
  });

  it('rejects corrupt and duplicate budget data without overwriting storage', () => {
    const seed = makeSeed('2026-10');
    const duplicate = { ...seed, budgets: [...seed.budgets, { ...seed.budgets[0], id: 'another-id' }] };
    expect(() => parseSnapshot(duplicate)).toThrow(StorageProblem);
    memory.set(STORAGE_KEY, '{broken');
    expect(() => loadSnapshot()).toThrow(StorageProblem);
    expect(memory.get(STORAGE_KEY)).toBe('{broken');
  });
});
