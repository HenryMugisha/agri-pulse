/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropCategory, CropRotationPlan, FieldParcel, FinancialTransaction, HealthRecord, LivestockAnimal, SeasonalSummary } from '../types/farm';

/**
 * Calculates whether a livestock animal is currently under an active veterinary medication withdrawal period.
 * Crucial for food safety compliance (milk and meat withholding periods).
 */
export function isUnderWithdrawalPeriod(record: HealthRecord): { isUnderWithdrawal: boolean; daysRemaining: number } {
  if (!record.withdrawalEndDate || record.withdrawalPeriodDays <= 0) {
    return { isUnderWithdrawal: false, daysRemaining: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(record.withdrawalEndDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isUnderWithdrawal: diffDays >= 0,
    daysRemaining: Math.max(0, diffDays),
  };
}

/**
 * Calculates withdrawal end date given administration date and period in days.
 */
export function calculateWithdrawalEndDate(dateStr: string, days: number): string {
  if (!dateStr || days <= 0) return dateStr;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split('T')[0];
}

/**
 * Agronomic Crop Rotation Rule Evaluator:
 * Checks whether successive crops in a field risk severe nutrient depletion or soil-borne pest buildup.
 */
export function evaluateCropRotationRule(history: CropRotationPlan[]): {
  isWarning: boolean;
  message: string;
  recommendation: string;
} {
  if (history.length < 2) {
    return {
      isWarning: false,
      message: 'Initial rotation phase on schedule.',
      recommendation: 'Plan next cycle with a nitrogen-fixing legume or green manure cover crop.',
    };
  }

  // Sort by year and season
  const sorted = [...history].sort((a, b) => a.year - b.year);
  const lastCrop = sorted[sorted.length - 1];
  const prevCrop = sorted[sorted.length - 2];

  // Rule 1: Two consecutive Heavy Feeders (e.g. Corn after Corn, or Potato after Tomato)
  if (lastCrop.category === 'Heavy Feeder' && prevCrop.category === 'Heavy Feeder') {
    return {
      isWarning: true,
      message: `Agronomic Conflict: Consecutive Heavy Feeders (${prevCrop.cropName} → ${lastCrop.cropName}).`,
      recommendation: 'Risk of acute Nitrogen/Potassium depletion and pest multiplication. Follow with a Legume / N-Fixer (Soybean, Clover) or Winter Rye cover crop.',
    };
  }

  // Rule 2: Legume followed by Heavy Feeder is optimal
  if (prevCrop.category === 'Legume / N-Fixer' && lastCrop.category === 'Heavy Feeder') {
    return {
      isWarning: false,
      message: `Optimal Succession: Nitrogen fixed by ${prevCrop.cropName} is actively bio-available for ${lastCrop.cropName}.`,
      recommendation: 'Maintains optimal soil biology and reduces synthetic nitrogen fertilizer application needs by 25–40%.',
    };
  }

  // Rule 3: Cover crop / builder restoration
  if (lastCrop.category === 'Cover Crop / Builder') {
    return {
      isWarning: false,
      message: `Soil Building Phase: Active root exudates and biomass accumulation from ${lastCrop.cropName}.`,
      recommendation: 'Incorporate biomass 3 weeks prior to subsequent spring sowing to maximize humic organic matter.',
    };
  }

  return {
    isWarning: false,
    message: 'Rotation conforms to regenerative agronomic principles.',
    recommendation: 'Maintain soil testing schedule at 24-month intervals to monitor organic carbon levels.',
  };
}

/**
 * Computes seasonal financial aggregates.
 */
export function computeSeasonalFinancials(transactions: FinancialTransaction[]): {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  seasonalSummaries: SeasonalSummary[];
} {
  const seasons: Array<FinancialTransaction['fiscalSeason']> = [
    'Spring Planting',
    'Summer Growing',
    'Autumn Harvest',
    'Winter Storage',
  ];

  let totalRevenue = 0;
  let totalExpenses = 0;

  const seasonalSummaries: SeasonalSummary[] = seasons.map((season) => {
    const seasonTx = transactions.filter((t) => t.fiscalSeason === season);
    const rev = seasonTx.filter((t) => t.type === 'Revenue').reduce((acc, t) => acc + t.amount, 0);
    const exp = seasonTx.filter((t) => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    const net = rev - exp;
    const margin = rev > 0 ? (net / rev) * 100 : 0;

    totalRevenue += rev;
    totalExpenses += exp;

    // Find top revenue source
    const revCategories: Record<string, number> = {};
    seasonTx.filter((t) => t.type === 'Revenue').forEach((t) => {
      revCategories[t.category] = (revCategories[t.category] || 0) + t.amount;
    });
    const topRevenueSource = Object.entries(revCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Find top expense driver
    const expCategories: Record<string, number> = {};
    seasonTx.filter((t) => t.type === 'Expense').forEach((t) => {
      expCategories[t.category] = (expCategories[t.category] || 0) + t.amount;
    });
    const topExpenseDriver = Object.entries(expCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      season,
      revenue: rev,
      expenses: exp,
      netMargin: net,
      profitMarginPercent: margin,
      topRevenueSource,
      topExpenseDriver,
    };
  });

  const netIncome = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netIncome,
    profitMargin,
    seasonalSummaries,
  };
}

/**
 * Formats currency in tabular display.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Triggers client-side CSV download of any tabular data for academic presentation and audit records.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
