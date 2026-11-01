/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Laptop,
  RotateCcw,
  Save,
  Settings,
  Terminal,
  Upload,
  Wifi,
  X,
} from 'lucide-react';
import {
  CropRotationPlan,
  FarmProfile,
  FieldParcel,
  FinancialTransaction,
  HealthRecord,
  LivestockAnimal,
} from '../types/farm';
import { exportToCSV } from '../utils/agronomyCalculations';

interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmProfile: FarmProfile;
  onUpdateFarmProfile: (profile: FarmProfile) => void;
  livestock: LivestockAnimal[];
  healthRecords: HealthRecord[];
  fields: FieldParcel[];
  rotationPlans: CropRotationPlan[];
  transactions: FinancialTransaction[];
  onImportFullBackup: (data: {
    livestock: LivestockAnimal[];
    healthRecords: HealthRecord[];
    fields: FieldParcel[];
    rotationPlans: CropRotationPlan[];
    transactions: FinancialTransaction[];
    profile?: FarmProfile;
  }) => void;
  onResetData: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  farmProfile,
  onUpdateFarmProfile,
  livestock,
  healthRecords,
  fields,
  rotationPlans,
  transactions,
  onImportFullBackup,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'backup' | 'hosting'>('hosting');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [farmName, setFarmName] = useState(farmProfile.farmName);
  const [managerName, setManagerName] = useState(farmProfile.managerName);
  const [primaryEnterprise, setPrimaryEnterprise] = useState(farmProfile.primaryEnterprise);
  const [currencySymbol, setCurrencySymbol] = useState(farmProfile.currencySymbol);
  const [location, setLocation] = useState(farmProfile.location);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFarmProfile({
      ...farmProfile,
      farmName: farmName.trim(),
      managerName: managerName.trim(),
      primaryEnterprise: primaryEnterprise.trim(),
      currencySymbol: currencySymbol.trim(),
      location: location.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const backupData = {
      profile: farmProfile,
      livestock,
      healthRecords,
      fields,
      rotationPlans,
      transactions,
      exportedAt: new Date().toISOString(),
      app: 'AgriPulse Farm OS',
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgriPulse_Farm_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.livestock || !json.fields) {
          alert('Invalid backup file. Please select a valid AgriPulse JSON backup.');
          return;
        }

        onImportFullBackup({
          livestock: json.livestock || [],
          healthRecords: json.healthRecords || [],
          fields: json.fields || [],
          rotationPlans: json.rotationPlans || [],
          transactions: json.transactions || [],
          profile: json.profile,
        });

        alert('Farm data restored successfully from backup!');
        onClose();
      } catch (err) {
        alert('Could not parse backup file. Error: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Farm Configuration & Local Laptop Setup
              </h2>
              <div className="text-xs text-stone-400">
                Data persistence, offline exports, and guide to host on your laptop
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-700" />
            <span>Host on Your Laptop (Code Guide)</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-stone-700" />
            <span>Farm Estate Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-stone-700" />
            <span>Backup & Data Export</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-stone-800">
          {/* TAB 1: HOW TO HOST ON YOUR LAPTOP */}
          {activeTab === 'hosting' && (
            <div className="space-y-6 text-xs leading-relaxed">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <Terminal className="w-4 h-4 text-emerald-700" />
                  <span>How to Run and Host AgriPulse on Your Own Laptop</span>
                </div>
                <p className="text-emerald-900">
                  All the source codes in this application are 100% self-contained and run on standard Node.js and React. You can run this completely offline on your laptop (Windows, Mac, or Linux) with no cloud dependency!
                </p>
              </div>

              {/* Step 1 */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Install Node.js on Your Laptop
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">Prerequisite</span>
                </div>
                <p className="text-stone-600">
                  If you don't already have Node.js installed, download the official Long Term Support (LTS) installer from:
                </p>
                <div className="p-3 bg-stone-50 rounded-lg font-mono text-emerald-800 text-xs font-semibold">
                  https://nodejs.org/ (Download Node.js v20 LTS or v22)
                </div>
                <p className="text-stone-500 text-[11px]">
                  Double click the installer and finish setup with standard options.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Download or Place the Source Code in a Folder
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">Workspace</span>
                </div>
                <p className="text-stone-600">
                  Save all the files from this project into a folder on your laptop, for example:
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-700 pl-2">
                  <li><strong>Windows:</strong> <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">C:\Users\YourName\agripulse-farm</code></li>
                  <li><strong>Mac / Linux:</strong> <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">~/agripulse-farm</code></li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Open Terminal / Command Prompt and Run 2 Commands
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">Execution</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-stone-500 block mb-1">
                      Command A: Install required dependencies (runs only once):
                    </span>
                    <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono flex items-center justify-between">
                      <code>npm install</code>
                      <button
                        onClick={() => copyToClipboard('npm install', 1)}
                        className="text-stone-400 hover:text-white cursor-pointer ml-3 shrink-0"
                      >
                        {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-stone-500 block mb-1">
                      Command B: Start your local farm application:
                    </span>
                    <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono flex items-center justify-between">
                      <code>npm run dev</code>
                      <button
                        onClick={() => copyToClipboard('npm run dev', 2)}
                        className="text-stone-400 hover:text-white cursor-pointer ml-3 shrink-0"
                      >
                        {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-stone-600 pt-1">
                  Once started, open your web browser (Chrome, Safari, Edge, Firefox) and go to:
                </p>
                <div className="p-2.5 bg-stone-100 rounded-md font-mono text-stone-900 font-bold text-xs inline-block">
                  http://localhost:3000
                </div>
              </div>

              {/* Step 4: Access on your phone or tablet on the farm! */}
              <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Bonus: Access from Your Phone/Tablet on Farm Wi-Fi
                    </h3>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono font-medium flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" />
                    Wireless Field Access
                  </span>
                </div>
                <p className="text-stone-600">
                  If you want to use AgriPulse on your smartphone or farm tablet while walking through the pastures or barns:
                </p>
                <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono flex items-center justify-between">
                  <code>npm run dev -- --host</code>
                  <button
                    onClick={() => copyToClipboard('npm run dev -- --host', 3)}
                    className="text-stone-400 hover:text-white cursor-pointer ml-3 shrink-0"
                  >
                    {copiedIndex === 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Vite will display a Network URL (e.g. <code className="font-mono text-stone-800">http://192.168.1.45:3000</code>). Just open that link in your phone browser while connected to the same Wi-Fi router or phone mobile hotspot!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FARM PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Farm / Estate Name</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Farm Manager Name</label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Primary Enterprise</label>
                  <input
                    type="text"
                    value={primaryEnterprise}
                    onChange={(e) => setPrimaryEnterprise(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Farm Location & Region</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white text-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Farm profile saved successfully!</span>
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP & DATA EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-6 text-xs leading-relaxed">
              <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Complete Farm Database Export (JSON)
                    </h3>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Save a portable snapshot of all animals, medical logs, crop fields, rotation cycles, and ledger transactions.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Restore Farm from JSON Backup File
                    </h3>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Restore your data from a previously downloaded AgriPulse backup file.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportJSON}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Upload className="w-4 h-4 text-emerald-700" />
                      <span>Upload & Restore</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-red-200/80 rounded-xl p-5 space-y-3 bg-red-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-red-950">
                      Reset Database to Factory Benchmark Data
                    </h3>
                    <p className="text-red-900/80 text-xs mt-0.5">
                      Replaces all local storage entries with the default 85-hectare commercial farm demo data.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onResetData();
                      onClose();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-100/80 border border-red-300 rounded-md transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
