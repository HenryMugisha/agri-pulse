/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  HeartPulse,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  X,
} from 'lucide-react';
import { AnimalSex, HealthRecord, HealthStatus, LivestockAnimal, RecordType, Species } from '../types/farm';
import {
  calculateWithdrawalEndDate,
  exportToCSV,
  formatCurrency,
  isUnderWithdrawalPeriod,
} from '../utils/agronomyCalculations';

interface LivestockTabProps {
  livestock: LivestockAnimal[];
  healthRecords: HealthRecord[];
  onAddAnimal: (animal: LivestockAnimal) => void;
  onAddHealthRecord: (record: HealthRecord) => void;
  onUpdateAnimalStatus: (id: string, newStatus: HealthStatus) => void;
}

export const LivestockTab: React.FC<LivestockTabProps> = ({
  livestock,
  healthRecords,
  onAddAnimal,
  onAddHealthRecord,
  onUpdateAnimalStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeSubView, setActiveSubView] = useState<'animals' | 'records'>('animals');

  // Modals
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [selectedAnimalForTreatment, setSelectedAnimalForTreatment] = useState<string>(
    livestock[0]?.id || ''
  );

  // New Animal Form State
  const [newTag, setNewTag] = useState('');
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState<Species>('Cattle');
  const [newBreed, setNewBreed] = useState('');
  const [newSex, setNewSex] = useState<AnimalSex>('Female');
  const [newDob, setNewDob] = useState('2024-01-15');
  const [newWeight, setNewWeight] = useState(450);
  const [newLocation, setNewLocation] = useState('Pasture 1');
  const [newStatus, setNewStatus] = useState<HealthStatus>('Healthy');
  const [newFeed, setNewFeed] = useState('Standard Pasture Grazing & Mineral Block');
  const [newNotes, setNewNotes] = useState('');

  // New Treatment Form State
  const [treatmentType, setTreatmentType] = useState<RecordType>('Vaccination');
  const [treatmentDate, setTreatmentDate] = useState('2026-10-31');
  const [diagnosis, setDiagnosis] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [vetName, setVetName] = useState('Dr. Sarah Lin, DVM');
  const [withdrawalDays, setWithdrawalDays] = useState(0);
  const [treatmentCost, setTreatmentCost] = useState(50);
  const [treatmentNotes, setTreatmentNotes] = useState('');

  // Filtered animals
  const filteredLivestock = livestock.filter((animal) => {
    const matchesSearch =
      animal.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.locationPen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = selectedSpecies === 'All' || animal.species === selectedSpecies;
    const matchesStatus = selectedStatus === 'All' || animal.status === selectedStatus;
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  // Filtered records
  const filteredRecords = healthRecords.filter((rec) => {
    return (
      rec.animalTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.animalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.medication.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Active withdrawal list
  const activeWithdrawals = healthRecords
    .map((r) => ({ record: r, withdrawal: isUnderWithdrawalPeriod(r) }))
    .filter((item) => item.withdrawal.isUnderWithdrawal);

  const handleCreateAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !newName.trim()) return;

    const animal: LivestockAnimal = {
      id: `anim-${Date.now()}`,
      tagId: newTag.trim().toUpperCase(),
      name: newName.trim(),
      species: newSpecies,
      breed: newBreed.trim() || 'Commercial Cross',
      sex: newSex,
      dateOfBirth: newDob,
      weightKg: Number(newWeight) || 300,
      locationPen: newLocation.trim() || 'General Barn',
      status: newStatus,
      lastVeterinaryCheck: new Date().toISOString().split('T')[0],
      healthNotes: newNotes.trim() || 'Initial registration on farm system.',
      purchaseOrBirthDate: newDob,
      assignedFeedRegimen: newFeed.trim(),
    };

    onAddAnimal(animal);
    setShowAddAnimalModal(false);
    // Reset form
    setNewTag('');
    setNewName('');
    setNewBreed('');
    setNewNotes('');
  };

  const handleCreateTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = livestock.find((a) => a.id === selectedAnimalForTreatment);
    if (!animal || !diagnosis.trim()) return;

    const calculatedEnd = calculateWithdrawalEndDate(treatmentDate, withdrawalDays);
    const hasActiveWithdrawal = Number(withdrawalDays) > 0;

    const record: HealthRecord = {
      id: `rec-${Date.now()}`,
      animalId: animal.id,
      animalTag: animal.tagId,
      animalName: animal.name,
      date: treatmentDate,
      recordType: treatmentType,
      diagnosis: diagnosis.trim(),
      medication: medication.trim() || 'None Specified',
      dosage: dosage.trim() || 'Standard therapeutic dose',
      administeredBy: vetName.trim() || 'Staff Veterinarian',
      withdrawalPeriodDays: Number(withdrawalDays),
      withdrawalEndDate: calculatedEnd,
      cost: Number(treatmentCost) || 0,
      notes: treatmentNotes.trim(),
      status: hasActiveWithdrawal ? 'Active Quarantine' : 'Completed',
    };

    onAddHealthRecord(record);

    // If withdrawal days > 0, automatically put animal under Observation or Quarantine for food safety
    if (hasActiveWithdrawal && animal.status === 'Healthy') {
      onUpdateAnimalStatus(animal.id, 'Observation');
    }

    setShowAddTreatmentModal(false);
    setDiagnosis('');
    setMedication('');
    setDosage('');
    setTreatmentNotes('');
    setWithdrawalDays(0);
  };

  const handleExportLivestockCSV = () => {
    const rows = livestock.map((a) => ({
      'Tag ID': a.tagId,
      Name: a.name,
      Species: a.species,
      Breed: a.breed,
      Sex: a.sex,
      'DOB / Intake': a.dateOfBirth,
      'Weight (kg)': a.weightKg,
      Location: a.locationPen,
      Status: a.status,
      'Last Vet Check': a.lastVeterinaryCheck,
      'Feed Regimen': a.assignedFeedRegimen,
      Notes: a.healthNotes,
    }));
    exportToCSV('AgriPulse_Livestock_Registry', rows);
  };

  const handleExportRecordsCSV = () => {
    const rows = healthRecords.map((r) => ({
      Date: r.date,
      'Tag ID': r.animalTag,
      'Animal Name': r.animalName,
      Type: r.recordType,
      Diagnosis: r.diagnosis,
      Medication: r.medication,
      Dosage: r.dosage,
      'Administered By': r.administeredBy,
      'Withdrawal Days': r.withdrawalPeriodDays,
      'Withdrawal End Date': r.withdrawalEndDate,
      'Cost ($)': r.cost,
      Status: r.status,
      Notes: r.notes,
    }));
    exportToCSV('AgriPulse_Veterinary_Health_Records', rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Pastoral Imagery */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs bg-stone-900 text-white min-h-[220px] flex flex-col justify-end p-6 sm:p-8">
        <img
          src="/src/assets/images/farm_livestock_pasture_1793439240664.jpg"
          alt="Dairy cattle and sheep grazing in green pasture"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-transparent" />

        <div className="relative z-10 space-y-2">
          <div className="text-xs font-semibold text-emerald-300 uppercase tracking-widest flex items-center gap-2">
            <span>Herd Health Surveillance</span>
            <span aria-hidden="true">·</span>
            <span>Food Safety Traceability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Livestock Registry & Clinical Records
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Track animal vital metrics, pedigree data, scheduled immunizations, and automated pharmaceutical withholding periods for biosecurity and consumer milk/meat safety compliance.
          </p>
        </div>
      </div>

      {/* Active Food Safety Clearance Alert Box */}
      {activeWithdrawals.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 rounded-lg text-amber-900 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Regulatory Alert: Mandatory Pharmaceutical Withholding Active
              </div>
              <p className="text-xs sm:text-sm text-amber-950 mt-1">
                Milk and meat from the following animal(s) cannot enter the commercial supply chain until withdrawal clearance expires:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeWithdrawals.map((w) => (
                  <div
                    key={w.record.id}
                    className="bg-amber-100/90 text-amber-900 px-2.5 py-1 rounded text-xs font-medium border border-amber-300"
                  >
                    <strong>{w.record.animalName} ({w.record.animalTag})</strong>: {w.record.medication} ·{' '}
                    <span className="font-mono font-bold text-amber-950">{w.withdrawal.daysRemaining} days remaining</span> (Clearance: {w.record.withdrawalEndDate})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Sub-Tabs, Search, and Action Buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Sub-view toggle (Segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg self-start">
          <button
            onClick={() => setActiveSubView('animals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeSubView === 'animals'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Animal Herd ({livestock.length})
          </button>
          <button
            onClick={() => setActiveSubView('records')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeSubView === 'records'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Clinical & Vet Logs ({healthRecords.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddAnimalModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Animal</span>
          </button>
          <button
            onClick={() => setShowAddTreatmentModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
            <span>Log Vet Treatment</span>
          </button>
          <button
            onClick={activeSubView === 'animals' ? handleExportLivestockCSV : handleExportRecordsCSV}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Download CSV for academic defense or inspection"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Ear Tag, Animal Name, Breed, Diagnosis, Pen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:bg-white text-stone-900"
          />
        </div>

        {activeSubView === 'animals' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2.5 py-2 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
            >
              <option value="All">All Species</option>
              <option value="Cattle">Cattle (Beef)</option>
              <option value="Dairy Cow">Dairy Cow</option>
              <option value="Sheep">Sheep</option>
              <option value="Goat">Goat</option>
              <option value="Swine">Swine</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2.5 py-2 text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Observation">Under Observation</option>
              <option value="Quarantined">Quarantined</option>
              <option value="Lactating">Lactating</option>
              <option value="Pregnant">Pregnant</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW A: Animal Cards Grid */}
      {activeSubView === 'animals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLivestock.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-xl border border-stone-200 text-stone-500 text-xs">
              No livestock found matching the selected filter criteria.
            </div>
          ) : (
            filteredLivestock.map((animal) => {
              const statusColor =
                animal.status === 'Healthy'
                  ? 'text-emerald-700'
                  : animal.status === 'Observation' || animal.status === 'Quarantined'
                  ? 'text-amber-800 font-semibold'
                  : 'text-stone-800';

              return (
                <div
                  key={animal.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 space-y-3.5 shadow-2xs hover:border-stone-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                          <span>{animal.tagId}</span>
                          <span aria-hidden="true">·</span>
                          <span>{animal.sex}</span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-0.5">{animal.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs ${statusColor}`}>{animal.status}</span>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">{animal.species}</div>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 pt-1 border-t border-stone-100">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Breed:</span>
                        <span className="font-medium text-stone-800">{animal.breed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Live Weight:</span>
                        <span className="font-mono font-medium text-stone-800 tabular-nums">
                          {animal.weightKg} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Pen / Paddock:</span>
                        <span className="text-stone-800 truncate max-w-[160px]">{animal.locationPen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Last Vet Check:</span>
                        <span className="font-mono text-stone-800">{animal.lastVeterinaryCheck}</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 text-[11px] text-stone-600 line-clamp-2">
                      <span className="font-medium text-stone-700">Notes: </span>
                      {animal.healthNotes}
                    </div>
                  </div>

                  {/* Quick Card Action Footer */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedAnimalForTreatment(animal.id);
                        setShowAddTreatmentModal(true);
                      }}
                      className="text-emerald-800 hover:text-emerald-900 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Log Treatment</span>
                    </button>

                    <select
                      value={animal.status}
                      onChange={(e) => onUpdateAnimalStatus(animal.id, e.target.value as HealthStatus)}
                      className="text-[11px] bg-stone-50 border border-stone-200 rounded px-2 py-0.5 text-stone-700 focus:outline-hidden"
                    >
                      <option value="Healthy">Set Healthy</option>
                      <option value="Observation">Set Observation</option>
                      <option value="Quarantined">Set Quarantined</option>
                      <option value="Lactating">Set Lactating</option>
                      <option value="Pregnant">Set Pregnant</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW B: Clinical History & Veterinary Treatment Table */}
      {activeSubView === 'records' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
                  <th className="py-3 px-4 font-mono">Date</th>
                  <th className="py-3 px-4">Animal / Tag</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Clinical Diagnosis</th>
                  <th className="py-3 px-4">Rx & Dosage</th>
                  <th className="py-3 px-4">Administered By</th>
                  <th className="py-3 px-4 text-center">Withdrawal Status</th>
                  <th className="py-3 px-4 text-right font-mono">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      No clinical logs found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const withdrawal = isUnderWithdrawalPeriod(rec);
                    return (
                      <tr key={rec.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-stone-600 whitespace-nowrap">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-stone-900">{rec.animalName}</span>
                          <span className="block font-mono text-[11px] text-stone-500">{rec.animalTag}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-stone-700">{rec.recordType}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs font-medium text-stone-900">
                          {rec.diagnosis}
                          {rec.notes && (
                            <span className="block text-[11px] text-stone-500 font-normal truncate">
                              {rec.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs">
                          <div className="truncate">{rec.medication}</div>
                          <div className="text-[11px] text-stone-400 truncate">{rec.dosage}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                          {rec.administeredBy}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {withdrawal.isUnderWithdrawal ? (
                            <span className="inline-block bg-amber-100 text-amber-900 font-mono text-[11px] px-2 py-0.5 rounded font-semibold">
                              {withdrawal.daysRemaining}d Left (Clear: {rec.withdrawalEndDate})
                            </span>
                          ) : rec.withdrawalPeriodDays > 0 ? (
                            <span className="text-[11px] text-emerald-700 font-medium">Cleared</span>
                          ) : (
                            <span className="text-[11px] text-stone-400">None required</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-stone-900 tabular-nums">
                          {formatCurrency(rec.cost)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Register New Livestock Animal */}
      {showAddAnimalModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">Register New Livestock Animal</h2>
              <button
                onClick={() => setShowAddAnimalModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Ear Tag ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COW-US-115"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Animal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clover"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Species</label>
                  <select
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as Species)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50 focus:outline-hidden"
                  >
                    <option value="Cattle">Cattle (Beef)</option>
                    <option value="Dairy Cow">Dairy Cow</option>
                    <option value="Sheep">Sheep</option>
                    <option value="Goat">Goat</option>
                    <option value="Swine">Swine</option>
                    <option value="Poultry">Poultry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Breed</label>
                  <input
                    type="text"
                    placeholder="e.g. Angus, Jersey"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Sex</label>
                  <select
                    value={newSex}
                    onChange={(e) => setNewSex(e.target.value as AnimalSex)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50 focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Castrated">Castrated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Live Weight (kg)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Initial Health Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as HealthStatus)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Observation">Observation</option>
                    <option value="Quarantined">Quarantined</option>
                    <option value="Lactating">Lactating</option>
                    <option value="Pregnant">Pregnant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Location (Pen / Pasture)</label>
                <input
                  type="text"
                  placeholder="e.g. Milking Barn A - Stall 08"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Assigned Feed Regimen</label>
                <input
                  type="text"
                  value={newFeed}
                  onChange={(e) => setNewFeed(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Pedigree & Health Notes</label>
                <textarea
                  rows={2}
                  placeholder="Sire/Dam information, intake vaccinations, tags..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnimalModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs cursor-pointer"
                >
                  Confirm Animal Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Log Veterinary Treatment with Automatic Food Safety Withdrawal Calculation */}
      {showAddTreatmentModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-900">Log Clinical Veterinary Treatment</h2>
                <p className="text-xs text-stone-500">Record pharmaceutical administration and withdrawal dates</p>
              </div>
              <button
                onClick={() => setShowAddTreatmentModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTreatment} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Select Animal *</label>
                <select
                  value={selectedAnimalForTreatment}
                  onChange={(e) => setSelectedAnimalForTreatment(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-medium text-stone-900"
                >
                  {livestock.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.tagId} - {a.species}, {a.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Record Type</label>
                  <select
                    value={treatmentType}
                    onChange={(e) => setTreatmentType(e.target.value as RecordType)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Vaccination">Vaccination</option>
                    <option value="Treatment">Therapeutic Treatment</option>
                    <option value="Deworming">Deworming</option>
                    <option value="Pregnancy Check">Pregnancy Check</option>
                    <option value="Surgery">Surgical Procedure</option>
                    <option value="Routine Check">Routine Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Administration Date</label>
                  <input
                    type="date"
                    required
                    value={treatmentDate}
                    onChange={(e) => setTreatmentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Mastitis in left rear quarter"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Medication / Vaccine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ceftiofur HCl 125mg"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Dosage & Route</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tube intramammary q24h x 3d"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Administered By</label>
                  <input
                    type="text"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Treatment Cost ($)</label>
                  <input
                    type="number"
                    value={treatmentCost}
                    onChange={(e) => setTreatmentCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono"
                  />
                </div>
              </div>

              {/* Regulatory Withdrawal Calculation Preview */}
              <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-amber-950 font-semibold block">
                    Mandatory Withdrawal Period (Days)
                  </label>
                  <span className="text-[11px] text-amber-800">Food Safety Regulation</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={withdrawalDays}
                    onChange={(e) => setWithdrawalDays(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 border border-amber-300 rounded-md bg-white font-mono font-bold text-amber-950 text-sm"
                  />
                  <div className="text-xs text-amber-900">
                    {withdrawalDays > 0 ? (
                      <span>
                        Clearance Date:{' '}
                        <strong className="font-mono font-bold">
                          {calculateWithdrawalEndDate(treatmentDate, withdrawalDays)}
                        </strong>{' '}
                        (Animal will be placed in active quarantine)
                      </span>
                    ) : (
                      <span className="text-stone-500">Zero withdrawal days required for this regimen.</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Veterinary Notes & Observations</label>
                <textarea
                  rows={2}
                  placeholder="Post-treatment condition, follow-up somatic cell test..."
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTreatmentModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs cursor-pointer"
                >
                  Save Treatment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
