/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  Laptop,
  RotateCcw,
  Settings,
  Sprout,
  Stethoscope,
} from 'lucide-react';
import { CropRotationTab } from './components/CropRotationTab';
import { FinancialsTab } from './components/FinancialsTab';
import { LivestockTab } from './components/LivestockTab';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { SettingsBackupModal } from './components/SettingsBackupModal';
import {
  initialFarmProfile,
  initialFields,
  initialHealthRecords,
  initialLivestock,
  initialRotationPlans,
  initialTransactions,
} from './data/initialFarmData';
import {
  CropRotationPlan,
  FarmProfile,
  FieldParcel,
  FinancialTransaction,
  HealthRecord,
  HealthStatus,
  LivestockAnimal,
} from './types/farm';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'livestock' | 'crops' | 'finances'>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistent Farm Profile
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(() => {
    try {
      const saved = localStorage.getItem('agripulse_profile');
      return saved ? JSON.parse(saved) : initialFarmProfile;
    } catch {
      return initialFarmProfile;
    }
  });

  // Persistent Livestock
  const [livestock, setLivestock] = useState<LivestockAnimal[]>(() => {
    try {
      const saved = localStorage.getItem('agripulse_livestock');
      return saved ? JSON.parse(saved) : initialLivestock;
    } catch {
      return initialLivestock;
    }
  });

  // Persistent Clinical Records
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem('agripulse_records');
      return saved ? JSON.parse(saved) : initialHealthRecords;
    } catch {
      return initialHealthRecords;
    }
  });

  // Persistent Fields
  const [fields, setFields] = useState<FieldParcel[]>(() => {
    try {
      const saved = localStorage.getItem('agripulse_fields');
      return saved ? JSON.parse(saved) : initialFields;
    } catch {
      return initialFields;
    }
  });

  // Persistent Rotation Schedules
  const [rotationPlans, setRotationPlans] = useState<CropRotationPlan[]>(() => {
    try {
      const saved = localStorage.getItem('agripulse_rotations');
      return saved ? JSON.parse(saved) : initialRotationPlans;
    } catch {
      return initialRotationPlans;
    }
  });

  // Persistent Financial Transactions
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('agripulse_transactions');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('agripulse_profile', JSON.stringify(farmProfile));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [farmProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('agripulse_livestock', JSON.stringify(livestock));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [livestock]);

  useEffect(() => {
    try {
      localStorage.setItem('agripulse_records', JSON.stringify(healthRecords));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [healthRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('agripulse_fields', JSON.stringify(fields));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [fields]);

  useEffect(() => {
    try {
      localStorage.setItem('agripulse_rotations', JSON.stringify(rotationPlans));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [rotationPlans]);

  useEffect(() => {
    try {
      localStorage.setItem('agripulse_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [transactions]);

  // Handlers
  const handleAddAnimal = (animal: LivestockAnimal) => {
    setLivestock((prev) => [animal, ...prev]);
  };

  const handleAddHealthRecord = (record: HealthRecord) => {
    setHealthRecords((prev) => [record, ...prev]);
  };

  const handleUpdateAnimalStatus = (id: string, newStatus: HealthStatus) => {
    setLivestock((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleAddField = (field: FieldParcel) => {
    setFields((prev) => [...prev, field]);
  };

  const handleAddRotationPlan = (plan: CropRotationPlan) => {
    setRotationPlans((prev) => [...prev, plan]);
  };

  const handleAddTransaction = (transaction: FinancialTransaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleImportFullBackup = (data: {
    livestock: LivestockAnimal[];
    healthRecords: HealthRecord[];
    fields: FieldParcel[];
    rotationPlans: CropRotationPlan[];
    transactions: FinancialTransaction[];
    profile?: FarmProfile;
  }) => {
    if (data.livestock) setLivestock(data.livestock);
    if (data.healthRecords) setHealthRecords(data.healthRecords);
    if (data.fields) setFields(data.fields);
    if (data.rotationPlans) setRotationPlans(data.rotationPlans);
    if (data.transactions) setTransactions(data.transactions);
    if (data.profile) setFarmProfile(data.profile);
  };

  const handleResetData = () => {
    if (window.confirm('Reset farm database to default benchmark records?')) {
      setFarmProfile(initialFarmProfile);
      setLivestock(initialLivestock);
      setHealthRecords(initialHealthRecords);
      setFields(initialFields);
      setRotationPlans(initialRotationPlans);
      setTransactions(initialTransactions);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {activeTab === 'overview' && (
          <OverviewTab
            livestock={livestock}
            healthRecords={healthRecords}
            fields={fields}
            transactions={transactions}
            onNavigate={setActiveTab}
            onOpenNewTreatment={() => setActiveTab('livestock')}
            onOpenNewCropPlan={() => setActiveTab('crops')}
            onOpenNewTransaction={() => setActiveTab('finances')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'livestock' && (
          <LivestockTab
            livestock={livestock}
            healthRecords={healthRecords}
            onAddAnimal={handleAddAnimal}
            onAddHealthRecord={handleAddHealthRecord}
            onUpdateAnimalStatus={handleUpdateAnimalStatus}
          />
        )}

        {activeTab === 'crops' && (
          <CropRotationTab
            fields={fields}
            rotationPlans={rotationPlans}
            onAddField={handleAddField}
            onAddRotationPlan={handleAddRotationPlan}
          />
        )}

        {activeTab === 'finances' && (
          <FinancialsTab
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        )}
      </main>

      {/* Settings, Local Laptop Hosting Guide & Backup Modal */}
      <SettingsBackupModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        farmProfile={farmProfile}
        onUpdateFarmProfile={setFarmProfile}
        livestock={livestock}
        healthRecords={healthRecords}
        fields={fields}
        rotationPlans={rotationPlans}
        transactions={transactions}
        onImportFullBackup={handleImportFullBackup}
        onResetData={handleResetData}
      />

      {/* Clean Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">{farmProfile.farmName}</span>
            <span aria-hidden="true">·</span>
            <span>Manager: {farmProfile.managerName}</span>
            <span aria-hidden="true">·</span>
            <span>{farmProfile.location}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-700" />
              <span>How to Host on Your Laptop</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetData}
              className="hover:text-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-stone-400" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
