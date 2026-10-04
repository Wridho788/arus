import { makeSeed, validateBudget, validateTransaction, type Budget, type Snapshot, type Transaction } from './domain';

export const STORAGE_KEY = 'arus.personal-finance.v1';

export class StorageProblem extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageProblem';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTransaction(value: unknown): Transaction | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.type !== 'string' || typeof value.title !== 'string' ||
      typeof value.amount !== 'number' || typeof value.category !== 'string' || typeof value.date !== 'string' ||
      typeof value.note !== 'string') return null;
  const item = value as Transaction;
  return validateTransaction(item) === null ? item : null;
}

function parseBudget(value: unknown): Budget | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.category !== 'string' || typeof value.month !== 'string' ||
      typeof value.limit !== 'number') return null;
  const item = value as Budget;
  return validateBudget(item) === null ? item : null;
}

export function parseSnapshot(value: unknown): Snapshot {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.transactions) || !Array.isArray(value.budgets)) {
    throw new StorageProblem('Data tersimpan tidak dikenali. Kamu bisa mengatur ulang data contoh.');
  }
  const transactions = value.transactions.map(parseTransaction);
  const budgets = value.budgets.map(parseBudget);
  if (transactions.some((item) => item === null) || budgets.some((item) => item === null)) {
    throw new StorageProblem('Sebagian data tersimpan tidak valid. Kamu bisa mengatur ulang data contoh.');
  }
  const transactionIds = transactions.map((item) => item!.id);
  const budgetIds = budgets.map((item) => item!.id);
  const budgetPairs = budgets.map((item) => `${item!.month}:${item!.category}`);
  if (new Set(transactionIds).size !== transactionIds.length || new Set(budgetIds).size !== budgetIds.length ||
      new Set(budgetPairs).size !== budgetPairs.length) {
    throw new StorageProblem('Data tersimpan memiliki entri ganda. Kamu bisa mengatur ulang data contoh.');
  }
  return { version: 1, transactions: transactions as Transaction[], budgets: budgets as Budget[] };
}

export function saveSnapshot(snapshot: Snapshot): void {
  const valid = parseSnapshot(snapshot);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {
    throw new StorageProblem('Penyimpanan browser tidak tersedia. Periksa izin atau ruang penyimpanan lalu coba lagi.');
  }
}

export function loadSnapshot(): Snapshot {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new StorageProblem('Penyimpanan browser tidak tersedia. Periksa pengaturan browser.');
  }
  if (raw === null) {
    const seed = makeSeed();
    saveSnapshot(seed);
    return seed;
  }
  try {
    return parseSnapshot(JSON.parse(raw));
  } catch (error) {
    if (error instanceof StorageProblem) throw error;
    throw new StorageProblem('Data tersimpan tidak dapat dibaca. Kamu bisa mengatur ulang data contoh.');
  }
}

export function resetSnapshot(): Snapshot {
  const seed = makeSeed();
  saveSnapshot(seed);
  return seed;
}
