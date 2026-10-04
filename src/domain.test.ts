import { describe, expect, it } from 'vitest';
import { currentMonth, isPositiveRupiah, isValidDate, makeSeed, monthlyTotals, spentFor, validateTransaction, validateBudget } from './domain';

describe('local financial calculations', () => {
  it('rejects non-finite, negative, fractional and unsafe amounts', () => {
    for (const amount of [NaN, Infinity, -Infinity, -1, 0, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(isPositiveRupiah(amount)).toBe(false);
    }
    expect(isPositiveRupiah(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it('rejects invalid dates, mismatched categories and blank titles', () => {
    const seed = makeSeed('2026-10');
    const transaction = seed.transactions[0];
    for (const date of ['2026-02-30', '2026-04-31', '2026-00-10', '2026-10-00', '2026-1-01', 'not-a-date']) {
      expect(isValidDate(date)).toBe(false);
    }
    expect(validateTransaction({ ...transaction, title: '  ' })).toBeTruthy();
    expect(validateTransaction({ ...transaction, category: 'food' })).toBeTruthy();
    expect(validateBudget({ ...seed.budgets[0], category: 'salary' })).toBeTruthy();
    expect(validateBudget({ ...seed.budgets[0], month: '2026-13' })).toBeTruthy();
  });

  it('recalculates totals and category spend after edits, month changes and deletion', () => {
    const expense = { id: 'expense', type: 'expense' as const, title: 'Lunch', amount: 50_000, category: 'food', date: '2026-10-04', note: '' };
    const income = { ...expense, id: 'income', type: 'income' as const, category: 'salary', amount: 100_000 };
    expect(monthlyTotals([expense, income], '2026-10')).toEqual({ income: 100_000, expense: 50_000, net: 50_000 });
    expect(spentFor([{ ...expense, amount: 120_000 }, income], 'food', '2026-10')).toBe(120_000);
    expect(monthlyTotals([{ ...expense, date: '2026-09-30' }, income], '2026-10')).toEqual({ income: 100_000, expense: 0, net: 100_000 });
    expect(spentFor([income], 'food', '2026-10')).toBe(0);
    expect(monthlyTotals([], '2026-10')).toEqual({ income: 0, expense: 0, net: 0 });
  });

  it('uses whole positive rupiah amounts and real local dates', () => {
    expect(isPositiveRupiah(1)).toBe(true);
    expect(isPositiveRupiah(0)).toBe(false);
    expect(isPositiveRupiah(1.5)).toBe(false);
    expect(isPositiveRupiah(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(isValidDate('2024-02-29')).toBe(true);
    expect(isValidDate('2025-02-29')).toBe(false);
    expect(isValidDate('2025-13-01')).toBe(false);
  });

  it('recalculates a month from transactions without using list filters', () => {
    const month = currentMonth(new Date(2026, 9, 3));
    const seed = makeSeed(month);
    expect(monthlyTotals(seed.transactions, month)).toEqual({ income: 10_250_000, expense: 4_011_000, net: 6_239_000 });
    expect(spentFor(seed.transactions, 'food', month)).toBe(785_000);
    expect(spentFor(seed.transactions, 'food', '2026-09')).toBe(0);
  });
});
