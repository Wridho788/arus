export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string;
};

export type Budget = {
  id: string;
  category: string;
  month: string;
  limit: number;
};

export type Snapshot = {
  version: 1;
  transactions: Transaction[];
  budgets: Budget[];
};

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makanan & minuman', short: 'Makanan', color: '#a98be8' },
  { id: 'shopping', label: 'Belanja', short: 'Belanja', color: '#f2b173' },
  { id: 'transport', label: 'Transportasi', short: 'Transport', color: '#85b5a6' },
  { id: 'bills', label: 'Tagihan', short: 'Tagihan', color: '#8ca8d8' },
  { id: 'health', label: 'Kesehatan', short: 'Kesehatan', color: '#df9aab' },
  { id: 'leisure', label: 'Hiburan', short: 'Hiburan', color: '#c9bf73' },
  { id: 'other', label: 'Lainnya', short: 'Lainnya', color: '#a9adb6' },
] as const;

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'gift', label: 'Hadiah' },
  { id: 'other-income', label: 'Lainnya' },
] as const;

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export const monthOf = (date: string) => date.slice(0, 7);

export function currentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function today(now = new Date()): string {
  return `${currentMonth(now)}-${String(now.getDate()).padStart(2, '0')}`;
}

export function moveMonth(month: string, offset: number): string {
  const [year, numericMonth] = month.split('-').map(Number);
  return currentMonth(new Date(year, numericMonth - 1 + offset, 1));
}

export function formatMonth(month: string): string {
  const [year, numericMonth] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, numericMonth - 1, 1));
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day;
}

export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function isPositiveRupiah(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function categoriesFor(type: TransactionType) {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function categoryLabel(category: string): string {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((item) => item.id === category)?.label ?? category;
}

export function categoryColor(category: string): string {
  return EXPENSE_CATEGORIES.find((item) => item.id === category)?.color ?? '#a9adb6';
}

export function validateTransaction(value: Transaction): string | null {
  if (!value.id || !['income', 'expense'].includes(value.type)) return 'Jenis transaksi tidak valid.';
  if (!value.title.trim()) return 'Judul transaksi wajib diisi.';
  if (value.title.trim().length > 80) return 'Judul maksimal 80 karakter.';
  if (!isPositiveRupiah(value.amount)) return 'Nominal harus bilangan rupiah positif.';
  if (!categoriesFor(value.type).some((item) => item.id === value.category)) return 'Kategori tidak valid.';
  if (!isValidDate(value.date)) return 'Tanggal tidak valid.';
  if (value.note.length > 240) return 'Catatan maksimal 240 karakter.';
  return null;
}

export function validateBudget(value: Budget): string | null {
  if (!value.id || !EXPENSE_CATEGORIES.some((item) => item.id === value.category)) return 'Kategori anggaran tidak valid.';
  if (!isValidMonth(value.month)) return 'Bulan anggaran tidak valid.';
  if (!isPositiveRupiah(value.limit)) return 'Batas anggaran harus bilangan rupiah positif.';
  return null;
}

export function monthlyTotals(transactions: Transaction[], month: string) {
  const relevant = transactions.filter((item) => monthOf(item.date) === month);
  const income = relevant.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = relevant.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  return { income, expense, net: income - expense };
}

export function spentFor(transactions: Transaction[], category: string, month: string): number {
  return transactions
    .filter((item) => item.type === 'expense' && item.category === category && monthOf(item.date) === month)
    .reduce((sum, item) => sum + item.amount, 0);
}

export function expenseBreakdown(transactions: Transaction[], month: string) {
  return EXPENSE_CATEGORIES.map((category) => ({
    ...category,
    amount: spentFor(transactions, category.id, month),
  })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
}

export function makeSeed(month = currentMonth()): Snapshot {
  const day = (n: number) => `${month}-${String(n).padStart(2, '0')}`;
  return {
    version: 1,
    transactions: [
      { id: 'demo-income-1', type: 'income', title: 'Gaji bulanan', amount: 8500000, category: 'salary', date: day(1), note: 'Data contoh' },
      { id: 'demo-income-2', type: 'income', title: 'Proyek desain', amount: 1750000, category: 'freelance', date: day(5), note: 'Data contoh' },
      { id: 'demo-expense-1', type: 'expense', title: 'Belanja mingguan', amount: 645000, category: 'food', date: day(3), note: 'Data contoh' },
      { id: 'demo-expense-2', type: 'expense', title: 'Sewa apartemen', amount: 2450000, category: 'bills', date: day(4), note: 'Data contoh' },
      { id: 'demo-expense-3', type: 'expense', title: 'Kopi & sarapan', amount: 78000, category: 'food', date: day(6), note: 'Data contoh' },
      { id: 'demo-expense-4', type: 'expense', title: 'Transportasi online', amount: 96000, category: 'transport', date: day(7), note: 'Data contoh' },
      { id: 'demo-expense-5', type: 'expense', title: 'Buku baru', amount: 185000, category: 'shopping', date: day(8), note: 'Data contoh' },
      { id: 'demo-expense-6', type: 'expense', title: 'Makan siang', amount: 62000, category: 'food', date: day(9), note: 'Data contoh' },
      { id: 'demo-expense-7', type: 'expense', title: 'Langganan internet', amount: 375000, category: 'bills', date: day(10), note: 'Data contoh' },
      { id: 'demo-expense-8', type: 'expense', title: 'Nonton akhir pekan', amount: 120000, category: 'leisure', date: day(11), note: 'Data contoh' },
    ],
    budgets: [
      { id: 'demo-budget-1', category: 'food', month, limit: 1600000 },
      { id: 'demo-budget-2', category: 'bills', month, limit: 3200000 },
      { id: 'demo-budget-3', category: 'transport', month, limit: 650000 },
      { id: 'demo-budget-4', category: 'shopping', month, limit: 800000 },
    ],
  };
}
