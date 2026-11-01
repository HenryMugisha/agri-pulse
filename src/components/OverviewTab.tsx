/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Droplet,
  Laptop,
  Layers,
  Plus,
  Settings,
  ShieldAlert,
  Sprout,
  Stethoscope,
} from 'lucide-react';
import { FieldParcel, FinancialTransaction, HealthRecord, LivestockAnimal } from '../types/farm';
import { computeSeasonalFinancials, formatCurrency, isUnderWithdrawalPeriod } from '../utils/agronomyCalculations';

interface OverviewTabProps {
  livestock: LivestockAnimal[];
  healthRecords: HealthRecord[];
  fields: FieldParcel[];
  transactions: FinancialTransaction[];
  onNavigate: (tab: 'overview' | 'livestock' | 'crops' | 'finances') => void;
  onOpenNewTreatment: () => void;
  onOpenNewCropPlan: () => void;
  onOpenNewTransaction: () => void;
  onOpenSettings: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  livestock,
  healthRecords,
  fields,
  transactions,
  onNavigate,
  onOpenNewTreatment,
  onOpenNewCropPlan,
  onOpenNewTransaction,
  onOpenSettings,
}) => {
  const financialMetrics = computeSeasonalFinancials(transactions);

  // Identify animals under active withdrawal
  const withdrawalAlerts = healthRecords
    .map((record) => ({
      record,
      withdrawal: isUnderWithdrawalPeriod(record),
    }))
    .filter((item) => item.withdrawal.isUnderWithdrawal);

  const totalAcreage = fields.reduce((sum, f) => sum + f.acreageHa, 0).toFixed(1);
  const avgPh = (fields.reduce((sum, f) => sum + f.soilPh, 0) / (fields.length || 1)).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Farm Hero with Measured Scrim and Zero-Pill Typography */}
      <section className="relative rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs bg-stone-900 text-white min-h-[340px] flex flex-col justify-end p-6 sm:p-8 lg:p-10">
        <img
          src="/src/assets/images/farm_aerial_plots_1793439240909.jpg"
          alt="Aerial view of farm crop fields"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-widest">
            <span>GreenValley Integrated Farm Estate</span>
            <span aria-hidden="true">·</span>
            <span>Est. 2018</span>
            <span aria-hidden="true">·</span>
            <span>Commercial Farm Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance leading-tight">
            Livestock Health Surveillance, Regenerative Crop Cycles & Seasonal Accounting
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            A unified, data-driven agricultural record system engineered to enforce food safety withdrawal compliance, optimize biological soil nitrogen replenishments, and protect seasonal farm solvency.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('crops')}
              className="px-4 py-2 text-xs font-semibold text-stone-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4 text-emerald-950" />
              <span>Manage Crop Rotations</span>
            </button>
            <button
              onClick={() => onNavigate('livestock')}
              className="px-4 py-2 text-xs font-medium text-stone-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Livestock Herd</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Critical Food Safety Notice Banner if any animal is under withdrawal */}
      {withdrawalAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold uppercase tracking-wider">
                <span>Active Food Safety Quarantine</span>
                <span aria-hidden="true">·</span>
                <span>{withdrawalAlerts.length} Animal Under Pharmaceutical Withholding</span>
              </div>
              <p className="text-sm text-amber-950 mt-1 font-medium">
                {withdrawalAlerts.map((w) => (
                  <span key={w.record.id} className="block sm:inline">
                    <strong className="font-semibold">{w.record.animalName} ({w.record.animalTag})</strong>: {w.record.medication} ·{' '}
                    <span className="font-mono font-bold text-amber-900">{w.withdrawal.daysRemaining} days remaining</span> until milk/meat clearance ({w.record.withdrawalEndDate}).
                  </span>
                ))}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('livestock')}
            className="px-3.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-md transition-colors whitespace-nowrap shrink-0 self-end sm:self-center cursor-pointer"
          >
            Review Clinical Records
          </button>
        </div>
      )}

      {/* Primary KPI Grid with Tabular Numerals */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Total Managed Arable Land</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 tabular-nums">
            {totalAcreage} <span className="text-base font-sans font-normal text-stone-500">ha</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
            <span>5 Active Parcels</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">100% Crop Rotation Covered</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Active Herd Headcount</span>
            <Stethoscope className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 tabular-nums">
            {livestock.length} <span className="text-base font-sans font-normal text-stone-500">head</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
            <span>{livestock.filter((a) => a.status === 'Healthy').length} Healthy</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-medium">
              {livestock.filter((a) => a.status === 'Observation' || a.status === 'Quarantined').length} Under Watch
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Mean Soil Agronomic pH</span>
            <Sprout className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 tabular-nums">
            {avgPh} <span className="text-base font-sans font-normal text-stone-500">pH</span>
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
            <span>Optimal Range (6.2 - 7.0)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Balanced Soil Biology</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-2">
            <span>Annual Net Farm Margin</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 tabular-nums">
            {formatCurrency(financialMetrics.netIncome)}
          </div>
          <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
            <span className="font-mono text-emerald-800 font-medium">{financialMetrics.profitMargin.toFixed(1)}%</span>
            <span>Operating Margin</span>
            <span aria-hidden="true">·</span>
            <span>4 Seasons</span>
          </div>
        </div>
      </section>

      {/* Quick Action Dock */}
      <section className="bg-stone-100/80 p-3 sm:p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider px-1">
          Direct Farm Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewTreatment}
            className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Log Vet Treatment</span>
          </button>
          <button
            onClick={onOpenNewCropPlan}
            className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Schedule Crop Cycle</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-stone-700" />
            <span>Record Farm Transaction</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-800" />
            <span>Host on Laptop / Backup</span>
          </button>
        </div>
      </section>

      {/* 2-Column Split: Field Rotation Status & Livestock Clinical Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Arable Plots & Rotation Snapshot */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-900">Arable Field & Soil Matrix</h2>
              <p className="text-xs text-stone-500">Live parcel crop cycles and nutrient replenishment statuses</p>
            </div>
            <button
              onClick={() => onNavigate('crops')}
              className="text-xs font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Fields</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {fields.slice(0, 4).map((field) => (
              <div
                key={field.id}
                className="p-3.5 rounded-lg border border-stone-100 bg-stone-50/60 hover:bg-stone-50 transition-colors flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900 text-sm">{field.code}</span>
                    <span className="text-stone-400">·</span>
                    <span className="font-medium text-stone-800 truncate">{field.name}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">{field.acreageHa} ha</span>
                  </div>
                  <div className="text-stone-600 flex items-center gap-2">
                    <span>Current: <strong className="font-medium text-stone-900">{field.currentCrop}</strong></span>
                    <span className="text-stone-300">/</span>
                    <span className="text-stone-500">{field.soilType}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs text-stone-700">pH {field.soilPh}</div>
                  <div className="text-[11px] text-stone-500">{field.irrigationType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Livestock Health Watchlist */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-900">Veterinary Clinical Watchlist</h2>
              <p className="text-xs text-stone-500">Recent diagnoses, pharmaceutical withdrawals, and observations</p>
            </div>
            <button
              onClick={() => onNavigate('livestock')}
              className="text-xs font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {healthRecords.slice(0, 4).map((rec) => {
              const withdrawal = isUnderWithdrawalPeriod(rec);
              return (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-lg border transition-colors flex items-start justify-between gap-3 text-xs ${
                    withdrawal.isUnderWithdrawal
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-stone-50/60 border-stone-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">{rec.animalTag}</span>
                      <span className="text-stone-400">·</span>
                      <span className="font-medium text-stone-800">{rec.animalName}</span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500">{rec.recordType}</span>
                    </div>
                    <div className="text-stone-700 font-medium">{rec.diagnosis}</div>
                    <div className="text-stone-500 text-[11px]">
                      Rx: {rec.medication} · Dr: {rec.administeredBy}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {withdrawal.isUnderWithdrawal ? (
                      <div className="text-amber-900 font-semibold font-mono text-[11px] bg-amber-100/90 px-2 py-0.5 rounded">
                        {withdrawal.daysRemaining}d Withdrawal
                      </div>
                    ) : (
                      <div className="text-stone-500 font-mono text-[11px]">
                        {rec.date}
                      </div>
                    )}
                    <div className="text-[11px] text-stone-500 mt-1">{rec.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seasonal Financial Quadrant Preview */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900">Seasonal P&L Flow & Working Capital</h2>
            <p className="text-xs text-stone-500">Biological agricultural cycles: Planting expenditures vs harvest realizations</p>
          </div>
          <button
            onClick={() => onNavigate('finances')}
            className="text-xs font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Financial Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialMetrics.seasonalSummaries.map((season) => (
            <div key={season.season} className="p-4 rounded-lg bg-stone-50/70 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                <span>{season.season}</span>
                <span className={`font-mono text-[11px] ${season.netMargin >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {season.netMargin >= 0 ? '+' : ''}{formatCurrency(season.netMargin)}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-mono text-stone-900 tabular-nums">{formatCurrency(season.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses:</span>
                  <span className="font-mono text-stone-900 tabular-nums">{formatCurrency(season.expenses)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 truncate">
                Top Expense: <span className="font-medium text-stone-700">{season.topExpenseDriver}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
