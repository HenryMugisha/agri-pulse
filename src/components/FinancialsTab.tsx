/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  PieChart,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  ExpenseCategory,
  FinancialTransaction,
  RevenueCategory,
  TransactionType,
} from '../types/farm';
import { computeSeasonalFinancials, exportToCSV, formatCurrency } from '../utils/agronomyCalculations';

interface FinancialsTabProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({
  transactions,
  onAddTransaction,
}) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTxModal, setShowAddTxModal] = useState(false);

  // New Transaction Form State
  const [txDate, setTxDate] = useState('2026-10-31');
  const [txSeason, setTxSeason] = useState<FinancialTransaction['fiscalSeason']>('Autumn Harvest');
  const [txType, setTxType] = useState<TransactionType>('Expense');
  const [txCategory, setTxCategory] = useState<string>('Seeds & Seedlings');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState(1200);
  const [txRelatedEntity, setTxRelatedEntity] = useState('Field FLD-A1');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Agricultural Credit'>('Bank Transfer');
  const [txRef, setTxRef] = useState('');

  const metrics = computeSeasonalFinancials(transactions);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSeason = selectedSeason === 'All' || tx.fiscalSeason === selectedSeason;
    const matchesType = filterType === 'All' || tx.type === filterType;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.relatedEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeason && matchesType && matchesSearch;
  });

  // Calculate filtered totals
  const currentRevenue = filteredTransactions
    .filter((t) => t.type === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentExpenses = filteredTransactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentNet = currentRevenue - currentExpenses;
  const currentMargin = currentRevenue > 0 ? (currentNet / currentRevenue) * 100 : 0;

  // Breakdown by category
  const revenueByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  filteredTransactions.forEach((tx) => {
    if (tx.type === 'Revenue') {
      revenueByCategory[tx.category] = (revenueByCategory[tx.category] || 0) + tx.amount;
    } else {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription.trim() || txAmount <= 0) return;

    const tx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: txDate,
      fiscalSeason: txSeason,
      type: txType,
      category: txCategory as any,
      description: txDescription.trim(),
      amount: Number(txAmount),
      relatedEntity: txRelatedEntity.trim() || 'General Operations',
      paymentMethod: txPaymentMethod,
      referenceNo: txRef.trim() || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onAddTransaction(tx);
    setShowAddTxModal(false);
    setTxDescription('');
    setTxAmount(1000);
    setTxRef('');
  };

  const handleExportCSV = () => {
    const rows = filteredTransactions.map((t) => ({
      Date: t.date,
      Season: t.fiscalSeason,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      'Amount ($)': t.amount,
      'Related Entity': t.relatedEntity,
      'Payment Method': t.paymentMethod,
      'Reference No': t.referenceNo,
    }));
    exportToCSV(`AgriPulse_Financial_Report_${selectedSeason.replace(/\s+/g, '_')}`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold text-stone-600 uppercase tracking-widest flex items-center gap-2">
            <span>Agricultural Accounting</span>
            <span aria-hidden="true">·</span>
            <span>Biological Working Capital</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Seasonal Financial Reports & Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Agricultural cash-flow statements aligned with biological seasonality: spring seed/fuel expenditures vs autumn harvest forward-contract revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTxModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Seasonal Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
        {['All', 'Spring Planting', 'Summer Growing', 'Autumn Harvest', 'Winter Storage'].map(
          (season) => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedSeason === season
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {season === 'All' ? 'All Seasons (Fiscal 2026)' : season}
            </button>
          )
        )}
      </div>

      {/* Financial Metrics Cards with Tabular Numerals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1.5">
            <span>Gross Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {formatCurrency(currentRevenue)}
          </div>
          <div className="mt-1.5 text-[11px] text-stone-400">
            {selectedSeason === 'All' ? '4-Quarter Realized Inflows' : `${selectedSeason} Settlements`}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1.5">
            <span>Operating Expenses (OPEX)</span>
            <ArrowDownRight className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {formatCurrency(currentExpenses)}
          </div>
          <div className="mt-1.5 text-[11px] text-stone-400">
            Seed, fertilizer, feed, fuel & labor
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1.5">
            <span>Net Operating Margin</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${currentNet >= 0 ? 'text-stone-900' : 'text-amber-800'}`}>
            {formatCurrency(currentNet)}
          </div>
          <div className="mt-1.5 text-[11px] text-stone-400">
            Pre-tax agricultural income
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1.5">
            <span>Operating Profit Margin %</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {currentMargin.toFixed(1)}%
          </div>
          <div className="mt-1.5 text-[11px] text-stone-400">
            Gross operating efficiency
          </div>
        </div>
      </div>

      {/* Revenue & Expense Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Stream Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">Revenue Stream Breakdown</h3>
            <span className="text-xs font-mono font-medium text-emerald-800 tabular-nums">
              {formatCurrency(currentRevenue)}
            </span>
          </div>

          <div className="space-y-3">
            {Object.keys(revenueByCategory).length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs">No revenue entries in this period.</div>
            ) : (
              Object.entries(revenueByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const percent = currentRevenue > 0 ? (amt / currentRevenue) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex justify-between text-stone-700">
                        <span className="font-medium">{cat}</span>
                        <span className="font-mono tabular-nums text-stone-900 font-semibold">
                          {formatCurrency(amt)} <span className="text-stone-400 font-normal">({percent.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-700 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Operating Expense Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">Operating Expense Drivers</h3>
            <span className="text-xs font-mono font-medium text-stone-900 tabular-nums">
              {formatCurrency(currentExpenses)}
            </span>
          </div>

          <div className="space-y-3">
            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs">No expense entries in this period.</div>
            ) : (
              Object.entries(expenseByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const percent = currentExpenses > 0 ? (amt / currentExpenses) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex justify-between text-stone-700">
                        <span className="font-medium">{cat}</span>
                        <span className="font-mono tabular-nums text-stone-900 font-semibold">
                          {formatCurrency(amt)} <span className="text-stone-400 font-normal">({percent.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-700 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table with Search & Filter */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions by description, category, field, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5 text-stone-800 focus:outline-hidden"
            >
              <option value="All">All Types (Rev & Exp)</option>
              <option value="Revenue">Revenues Only</option>
              <option value="Expense">Expenses Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
                <th className="py-2.5 px-4 font-mono">Date</th>
                <th className="py-2.5 px-4">Season</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Related Entity</th>
                <th className="py-2.5 px-4 font-mono">Ref No</th>
                <th className="py-2.5 px-4 text-right font-mono">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-stone-600 whitespace-nowrap">{tx.date}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-stone-600">{tx.fiscalSeason}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          tx.type === 'Revenue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-stone-900 whitespace-nowrap">{tx.category}</td>
                    <td className="py-2.5 px-4 text-stone-700 max-w-sm truncate">{tx.description}</td>
                    <td className="py-2.5 px-4 text-stone-500 whitespace-nowrap">{tx.relatedEntity}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                      {tx.referenceNo}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                        tx.type === 'Revenue' ? 'text-emerald-800' : 'text-stone-900'
                      }`}
                    >
                      {tx.type === 'Revenue' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Farm Transaction */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">Record Farm Financial Transaction</h2>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Transaction Type *</label>
                  <select
                    value={txType}
                    onChange={(e) => {
                      const val = e.target.value as TransactionType;
                      setTxType(val);
                      setTxCategory(val === 'Revenue' ? 'Crop Grain Sales' : 'Seeds & Seedlings');
                    }}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-bold"
                  >
                    <option value="Revenue">Revenue (Income)</option>
                    <option value="Expense">Expense (Outflow)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Fiscal Season</label>
                  <select
                    value={txSeason}
                    onChange={(e) => setTxSeason(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Spring Planting">Spring Planting</option>
                    <option value="Summer Growing">Summer Growing</option>
                    <option value="Autumn Harvest">Autumn Harvest</option>
                    <option value="Winter Storage">Winter Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    {txType === 'Revenue' ? (
                      <>
                        <option value="Crop Grain Sales">Crop Grain Sales</option>
                        <option value="Horticulture & Produce">Horticulture & Produce</option>
                        <option value="Livestock & Meat">Livestock & Meat</option>
                        <option value="Dairy & Milk">Dairy & Milk</option>
                        <option value="Wool & Byproducts">Wool & Byproducts</option>
                        <option value="Government Ag Subsidies">Government Ag Subsidies</option>
                      </>
                    ) : (
                      <>
                        <option value="Seeds & Seedlings">Seeds & Seedlings</option>
                        <option value="Fertilizers & Soil Amendments">Fertilizers & Soil Amendments</option>
                        <option value="Animal Feed & Minerals">Animal Feed & Minerals</option>
                        <option value="Veterinary & Medication">Veterinary & Medication</option>
                        <option value="Machinery Fuel & Maintenance">Machinery Fuel & Maintenance</option>
                        <option value="Labor & Seasonal Wages">Labor & Seasonal Wages</option>
                        <option value="Irrigation & Utilities">Irrigation & Utilities</option>
                        <option value="Equipment Lease & Storage">Equipment Lease & Storage</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Description / Memo *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Wheat Forward contract settlement (60 MT)"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Amount ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Related Entity</label>
                  <input
                    type="text"
                    placeholder="e.g. Field A1, Dairy Barn"
                    value={txRelatedEntity}
                    onChange={(e) => setTxRelatedEntity(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Payment Method</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Agricultural Credit">Agricultural Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Invoice / Reference No</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-99"
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
