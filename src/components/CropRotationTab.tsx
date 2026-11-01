/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  Droplet,
  Layers,
  Leaf,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react';
import {
  CropCategory,
  CropRotationPlan,
  FieldParcel,
  IrrigationType,
  NutrientStatus,
  Season,
  SoilType,
} from '../types/farm';
import { evaluateCropRotationRule, exportToCSV } from '../utils/agronomyCalculations';

interface CropRotationTabProps {
  fields: FieldParcel[];
  rotationPlans: CropRotationPlan[];
  onAddField: (field: FieldParcel) => void;
  onAddRotationPlan: (plan: CropRotationPlan) => void;
}

export const CropRotationTab: React.FC<CropRotationTabProps> = ({
  fields,
  rotationPlans,
  onAddField,
  onAddRotationPlan,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Modals
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // New Field Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newAcreage, setNewAcreage] = useState(15.0);
  const [newSoilType, setNewSoilType] = useState<SoilType>('Silt Loam');
  const [newSoilPh, setNewSoilPh] = useState(6.6);
  const [newOrganicMatter, setNewOrganicMatter] = useState(3.5);
  const [newNitrogen, setNewNitrogen] = useState<NutrientStatus>('Optimal');
  const [newPhosphorus, setNewPhosphorus] = useState<NutrientStatus>('Optimal');
  const [newPotassium, setNewPotassium] = useState<NutrientStatus>('Optimal');
  const [newIrrigation, setNewIrrigation] = useState<IrrigationType>('Center Pivot');
  const [newCrop, setNewCrop] = useState('Winter Wheat');
  const [newCropCategory, setNewCropCategory] = useState<CropCategory>('Light Feeder');

  // New Plan Form State
  const [planFieldId, setPlanFieldId] = useState<string>(fields[0]?.id || '');
  const [planYear, setPlanYear] = useState(2027);
  const [planSeason, setPlanSeason] = useState<Season>('Spring');
  const [planCropName, setPlanCropName] = useState('');
  const [planCategory, setPlanCategory] = useState<CropCategory>('Legume / N-Fixer');
  const [planPlantingDate, setPlanPlantingDate] = useState('2027-05-01');
  const [planHarvestDate, setPlanHarvestDate] = useState('2027-09-30');
  const [planYield, setPlanYield] = useState(4.0);
  const [planBenefit, setPlanBenefit] = useState('Atmospheric nitrogen fixation and disease break.');

  // Interactive Live Agronomic Simulator State for Defense Demo
  const [simPrevCrop, setSimPrevCrop] = useState<CropCategory>('Heavy Feeder');
  const [simNextCrop, setSimNextCrop] = useState<CropCategory>('Heavy Feeder');

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];
  const fieldRotations = rotationPlans
    .filter((p) => p.fieldId === selectedField?.id)
    .sort((a, b) => a.year - b.year);

  // Live evaluation for selected field's actual history
  const rotationEvaluation = evaluateCropRotationRule(fieldRotations);

  // Live simulation for defense demonstration
  const simulatedHistory: CropRotationPlan[] = [
    {
      id: 'sim-1',
      fieldId: 'sim',
      fieldCode: 'SIM',
      year: 2025,
      season: 'Spring',
      cropName: simPrevCrop === 'Heavy Feeder' ? 'Grain Corn' : simPrevCrop === 'Legume / N-Fixer' ? 'Soybeans' : 'Wheat',
      category: simPrevCrop,
      targetPlantingDate: '2025-05-01',
      targetHarvestDate: '2025-10-01',
      expectedYieldTonsPerHa: 5.0,
      pestDiseaseRisk: 'Low',
      soilBenefitSummary: 'Baseline crop season',
      status: 'Harvested',
    },
    {
      id: 'sim-2',
      fieldId: 'sim',
      fieldCode: 'SIM',
      year: 2026,
      season: 'Spring',
      cropName: simNextCrop === 'Heavy Feeder' ? 'Grain Corn' : simNextCrop === 'Legume / N-Fixer' ? 'Field Peas' : 'Cover Rye',
      category: simNextCrop,
      targetPlantingDate: '2026-05-01',
      targetHarvestDate: '2026-10-01',
      expectedYieldTonsPerHa: 5.0,
      pestDiseaseRisk: 'Low',
      soilBenefitSummary: 'Candidate succession crop',
      status: 'Planned',
    },
  ];
  const liveSimEvaluation = evaluateCropRotationRule(simulatedHistory);

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const field: FieldParcel = {
      id: `fld-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      acreageHa: Number(newAcreage) || 10,
      soilType: newSoilType,
      soilPh: Number(newSoilPh) || 6.5,
      organicMatterPercent: Number(newOrganicMatter) || 3.0,
      nitrogenStatus: newNitrogen,
      phosphorusStatus: newPhosphorus,
      potassiumStatus: newPotassium,
      irrigationType: newIrrigation,
      currentCrop: newCrop.trim() || 'Fallow',
      currentCropCategory: newCropCategory,
      lastSoilTestDate: new Date().toISOString().split('T')[0],
    };

    onAddField(field);
    setSelectedFieldId(field.id);
    setShowAddFieldModal(false);
    setNewCode('');
    setNewName('');
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const field = fields.find((f) => f.id === planFieldId);
    if (!field || !planCropName.trim()) return;

    const plan: CropRotationPlan = {
      id: `rot-${Date.now()}`,
      fieldId: field.id,
      fieldCode: field.code,
      year: Number(planYear),
      season: planSeason,
      cropName: planCropName.trim(),
      category: planCategory,
      targetPlantingDate: planPlantingDate,
      targetHarvestDate: planHarvestDate,
      expectedYieldTonsPerHa: Number(planYield) || 0,
      pestDiseaseRisk: 'Low',
      soilBenefitSummary: planBenefit.trim() || 'Scheduled regenerative agronomic succession.',
      status: 'Planned',
    };

    onAddRotationPlan(plan);
    setShowAddPlanModal(false);
    setPlanCropName('');
    setPlanBenefit('Atmospheric nitrogen fixation and disease break.');
  };

  const handleExportRotationCSV = () => {
    const rows = rotationPlans.map((r) => ({
      Field: r.fieldCode,
      Year: r.year,
      Season: r.season,
      'Crop Name': r.cropName,
      Category: r.category,
      'Target Planting': r.targetPlantingDate,
      'Target Harvest': r.targetHarvestDate,
      'Expected Yield (t/ha)': r.expectedYieldTonsPerHa,
      'Actual Yield (t/ha)': r.actualYieldTonsPerHa || 'Pending',
      'Pest Risk': r.pestDiseaseRisk,
      'Soil Benefit': r.soilBenefitSummary,
      Status: r.status,
    }));
    exportToCSV('AgriPulse_Crop_Rotation_Matrix', rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
            <span>Regenerative Agronomy</span>
            <span aria-hidden="true">·</span>
            <span>Soil Nutrient Succession</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Crop Rotation Planning & Soil Health Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Design multi-year succession plans to break weed and pathogen cycles, naturally replenish soil nitrogen via Rhizobium legumes, and optimize arable yields.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFieldModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Field Parcel</span>
          </button>
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Rotation Cycle</span>
          </button>
          <button
            onClick={handleExportRotationCSV}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Arable Field Parcels Selection Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {fields.map((f) => {
          const isSelected = f.id === selectedField?.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFieldId(f.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`font-mono font-bold ${isSelected ? 'text-emerald-200' : 'text-stone-900'}`}>
                  {f.code}
                </span>
                <span className={`font-mono ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`}>
                  {f.acreageHa} ha
                </span>
              </div>
              <div className="font-semibold text-xs truncate">{f.name}</div>
              <div className={`text-[11px] mt-2 truncate ${isSelected ? 'text-emerald-100' : 'text-stone-600'}`}>
                Crop: <strong className="font-medium">{f.currentCrop}</strong>
              </div>
              <div className="mt-2 pt-2 border-t border-stone-100/30 flex items-center justify-between text-[11px]">
                <span className={isSelected ? 'text-emerald-200' : 'text-stone-500'}>pH {f.soilPh}</span>
                <span className={isSelected ? 'text-emerald-200' : 'text-stone-500'}>{f.organicMatterPercent}% OM</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Field Deep Dive: Soil Chemistry & Agronomic Validation */}
      {selectedField && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                <span>{selectedField.code}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedField.acreageHa} Hectares</span>
                <span aria-hidden="true">·</span>
                <span>{selectedField.soilType}</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 mt-0.5">{selectedField.name}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="text-stone-400 block text-[11px]">Irrigation Setup</span>
                <span className="font-medium text-stone-800">{selectedField.irrigationType}</span>
              </div>
              <div className="text-right text-xs pl-3 border-l border-stone-200">
                <span className="text-stone-400 block text-[11px]">Last Soil Test</span>
                <span className="font-mono text-stone-800">{selectedField.lastSoilTestDate}</span>
              </div>
            </div>
          </div>

          {/* Soil Chemistry Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-stone-500 text-[11px] block">Soil pH Balance</span>
              <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                {selectedField.soilPh}
              </span>
              <span className="text-[11px] text-stone-500 block mt-1">
                {selectedField.soilPh < 6.0 ? 'Acidic - Lime advised' : selectedField.soilPh > 7.3 ? 'Alkaline' : 'Optimal microbial range'}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-stone-500 text-[11px] block">Soil Organic Matter (SOM)</span>
              <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                {selectedField.organicMatterPercent}%
              </span>
              <span className="text-[11px] text-stone-500 block mt-1">High carbon sequestration</span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-stone-500 text-[11px] block">Nitrogen (N) Status</span>
              <span className={`text-base font-bold ${selectedField.nitrogenStatus === 'Optimal' ? 'text-emerald-700' : 'text-amber-800'}`}>
                {selectedField.nitrogenStatus}
              </span>
              <span className="text-[11px] text-stone-500 block mt-1">
                {selectedField.nitrogenStatus === 'Optimal' ? 'Biological nodulation active' : 'Needs legume restoration'}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-stone-500 text-[11px] block">Phosphorus & Potassium (P-K)</span>
              <span className="text-base font-bold text-stone-800">
                {selectedField.phosphorusStatus} / {selectedField.potassiumStatus}
              </span>
              <span className="text-[11px] text-stone-500 block mt-1">Adequate root nutrient pool</span>
            </div>
          </div>

          {/* Agronomic Rule Evaluation Callout */}
          <div
            className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
              rotationEvaluation.isWarning
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {rotationEvaluation.isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              )}
            </div>
            <div className="space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider">
                Agronomic Succession Assessment: {rotationEvaluation.message}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{rotationEvaluation.recommendation}</p>
            </div>
          </div>

          {/* Multi-Year Rotation Plan Timeline Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">4-Year Crop Rotation Timetable</h3>
              <span className="text-xs text-stone-400">Planned succession for {selectedField.code}</span>
            </div>

            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
                    <th className="py-2.5 px-3 font-mono">Year / Season</th>
                    <th className="py-2.5 px-3">Crop Name</th>
                    <th className="py-2.5 px-3">Biological Category</th>
                    <th className="py-2.5 px-3">Window (Plant - Harvest)</th>
                    <th className="py-2.5 px-3 text-right font-mono">Yield (t/ha)</th>
                    <th className="py-2.5 px-3">Soil & Agronomic Benefit</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {fieldRotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-stone-400">
                        No rotation schedule entered yet for this field. Click "Schedule Rotation Cycle" to add one.
                      </td>
                    </tr>
                  ) : (
                    fieldRotations.map((plan) => (
                      <tr key={plan.id} className="hover:bg-stone-50/70">
                        <td className="py-2.5 px-3 font-mono font-semibold text-stone-900">
                          {plan.year} · {plan.season}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {plan.cropName}
                        </td>
                        <td className="py-2.5 px-3 text-stone-700">
                          {plan.category}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">
                          {plan.targetPlantingDate} → {plan.targetHarvestDate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-stone-900">
                          {plan.actualYieldTonsPerHa || plan.expectedYieldTonsPerHa}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 max-w-xs">
                          {plan.soilBenefitSummary}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                              plan.status === 'Harvested'
                                ? 'bg-stone-100 text-stone-700'
                                : plan.status === 'In Progress'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-50 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {plan.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Agronomic Succession Simulator */}
      <section className="bg-stone-900 text-white rounded-xl p-6 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Agronomic Planning Decision Engine</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Crop Succession & Biological Nitrogen-Fixation Simulator
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Algorithm: evaluateCropRotationRule()</span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
          Use this interactive planning simulator to test how candidate crop sequences affect soil nitrogen availability, pathogen cycles, and fertilizer input requirements. Select a preceding crop category and candidate successor crop:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
          <div className="bg-stone-800/80 p-3.5 rounded-lg border border-stone-700/80 space-y-2">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Year 1 Preceding Crop Category:
            </label>
            <select
              value={simPrevCrop}
              onChange={(e) => setSimPrevCrop(e.target.value as CropCategory)}
              className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-xs text-white focus:outline-hidden"
            >
              <option value="Heavy Feeder">Heavy Feeder (e.g. Corn, Potato, Cabbage)</option>
              <option value="Legume / N-Fixer">Legume / N-Fixer (e.g. Soybeans, Peas, Clover)</option>
              <option value="Light Feeder">Light Feeder (e.g. Wheat, Barley, Oats)</option>
              <option value="Cover Crop / Builder">Cover Crop / Soil Builder (e.g. Hairy Vetch, Rye)</option>
              <option value="Fallow">Restoration Fallow</option>
            </select>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
              <ArrowRight className="w-5 h-5 text-emerald-400" />
              <span>Succession</span>
            </div>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-lg border border-stone-700/80 space-y-2">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Year 2 Candidate Successor:
            </label>
            <select
              value={simNextCrop}
              onChange={(e) => setSimNextCrop(e.target.value as CropCategory)}
              className="w-full bg-stone-900 border border-stone-700 rounded-md p-2 text-xs text-white focus:outline-hidden"
            >
              <option value="Heavy Feeder">Heavy Feeder (e.g. Corn, Cotton, Canola)</option>
              <option value="Legume / N-Fixer">Legume / N-Fixer (e.g. Soybeans, Alfalfa, Beans)</option>
              <option value="Light Feeder">Light Feeder (e.g. Winter Wheat, Rye)</option>
              <option value="Cover Crop / Builder">Cover Crop / Soil Builder (e.g. Radish, Clover)</option>
            </select>
          </div>
        </div>

        {/* Live Simulator Result */}
        <div
          className={`p-4 rounded-lg border text-xs space-y-1.5 ${
            liveSimEvaluation.isWarning
              ? 'bg-amber-950/40 border-amber-600/80 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
          }`}
        >
          <div className="font-bold flex items-center gap-2">
            {liveSimEvaluation.isWarning ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>Engine Output: {liveSimEvaluation.message}</span>
          </div>
          <p className="text-stone-300 text-xs leading-relaxed">{liveSimEvaluation.recommendation}</p>
        </div>
      </section>

      {/* MODAL 1: Add New Field Parcel */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">Register Arable Field Parcel</h2>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateField} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Field Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLD-F6"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Parcel Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Prairie Terrace"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Acreage (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAcreage}
                    onChange={(e) => setNewAcreage(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Soil Texture Type</label>
                  <select
                    value={newSoilType}
                    onChange={(e) => setNewSoilType(e.target.value as SoilType)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Silt Loam">Silt Loam</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Peat Loam">Peat Loam</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="9.0"
                    value={newSoilPh}
                    onChange={(e) => setNewSoilPh(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Nitrogen (N)</label>
                  <select
                    value={newNitrogen}
                    onChange={(e) => setNewNitrogen(e.target.value as NutrientStatus)}
                    className="w-full px-2 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Optimal">Optimal</option>
                    <option value="Deficient">Deficient</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Phosphorus (P)</label>
                  <select
                    value={newPhosphorus}
                    onChange={(e) => setNewPhosphorus(e.target.value as NutrientStatus)}
                    className="w-full px-2 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Optimal">Optimal</option>
                    <option value="Deficient">Deficient</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Potassium (K)</label>
                  <select
                    value={newPotassium}
                    onChange={(e) => setNewPotassium(e.target.value as NutrientStatus)}
                    className="w-full px-2 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Optimal">Optimal</option>
                    <option value="Deficient">Deficient</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Irrigation System</label>
                  <select
                    value={newIrrigation}
                    onChange={(e) => setNewIrrigation(e.target.value as IrrigationType)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Center Pivot">Center Pivot</option>
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Rainfed">Rainfed</option>
                    <option value="Furrow Basin">Furrow Basin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Current Standing Crop</label>
                  <input
                    type="text"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs cursor-pointer"
                >
                  Save Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Schedule Crop Rotation Cycle */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">Schedule Rotation Cycle</h2>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Target Field Parcel *</label>
                <select
                  value={planFieldId}
                  onChange={(e) => setPlanFieldId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-medium text-stone-900"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name} ({f.acreageHa} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Crop Year</label>
                  <input
                    type="number"
                    value={planYear}
                    onChange={(e) => setPlanYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Season</label>
                  <select
                    value={planSeason}
                    onChange={(e) => setPlanSeason(e.target.value as Season)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Autumn">Autumn</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alfalfa, Winter Rye, Sweet Corn"
                    value={planCropName}
                    onChange={(e) => setPlanCropName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Biological Category</label>
                  <select
                    value={planCategory}
                    onChange={(e) => setPlanCategory(e.target.value as CropCategory)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                  >
                    <option value="Legume / N-Fixer">Legume / N-Fixer</option>
                    <option value="Heavy Feeder">Heavy Feeder</option>
                    <option value="Light Feeder">Light Feeder</option>
                    <option value="Cover Crop / Builder">Cover Crop / Builder</option>
                    <option value="Fallow">Restoration Fallow</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Target Planting</label>
                  <input
                    type="date"
                    value={planPlantingDate}
                    onChange={(e) => setPlanPlantingDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Target Harvest</label>
                  <input
                    type="date"
                    value={planHarvestDate}
                    onChange={(e) => setPlanHarvestDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Exp. Yield (t/ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={planYield}
                    onChange={(e) => setPlanYield(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Soil & Biological Benefit Notes</label>
                <textarea
                  rows={2}
                  value={planBenefit}
                  onChange={(e) => setPlanBenefit(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-stone-50"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs cursor-pointer"
                >
                  Confirm Rotation Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
