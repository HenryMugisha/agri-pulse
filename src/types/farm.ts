/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Species = 'Cattle' | 'Dairy Cow' | 'Sheep' | 'Goat' | 'Swine' | 'Poultry';
export type AnimalSex = 'Female' | 'Male' | 'Castrated';
export type HealthStatus = 'Healthy' | 'Observation' | 'Quarantined' | 'Lactating' | 'Pregnant' | 'Sold';

export interface LivestockAnimal {
  id: string;
  tagId: string;
  name: string;
  species: Species;
  breed: string;
  sex: AnimalSex;
  dateOfBirth: string;
  weightKg: number;
  locationPen: string;
  status: HealthStatus;
  lastVeterinaryCheck: string;
  healthNotes: string;
  purchaseOrBirthDate: string;
  assignedFeedRegimen: string;
}

export type RecordType = 'Vaccination' | 'Treatment' | 'Deworming' | 'Surgery' | 'Routine Check' | 'Pregnancy Check';
export type TreatmentOutcome = 'Completed' | 'Follow-up Required' | 'Active Quarantine' | 'Resolved';

export interface HealthRecord {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  date: string;
  recordType: RecordType;
  diagnosis: string;
  medication: string;
  dosage: string;
  administeredBy: string; // e.g., "Dr. M. Vance, DVM"
  withdrawalPeriodDays: number;
  withdrawalEndDate: string; // calculated date
  cost: number;
  notes: string;
  status: TreatmentOutcome;
}

export type SoilType = 'Silt Loam' | 'Clay Loam' | 'Sandy Loam' | 'Peat Loam' | 'Alluvial Soil';
export type NutrientStatus = 'Deficient' | 'Optimal' | 'High';
export type IrrigationType = 'Center Pivot' | 'Drip Irrigation' | 'Rainfed' | 'Furrow Basin';

export interface FieldParcel {
  id: string;
  code: string;
  name: string;
  acreageHa: number;
  soilType: SoilType;
  soilPh: number;
  organicMatterPercent: number;
  nitrogenStatus: NutrientStatus;
  phosphorusStatus: NutrientStatus;
  potassiumStatus: NutrientStatus;
  irrigationType: IrrigationType;
  currentCrop: string;
  currentCropCategory: CropCategory;
  lastSoilTestDate: string;
}

export type CropCategory = 
  | 'Legume / N-Fixer' 
  | 'Heavy Feeder' 
  | 'Light Feeder' 
  | 'Cover Crop / Builder' 
  | 'Fallow';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface CropRotationPlan {
  id: string;
  fieldId: string;
  fieldCode: string;
  year: number;
  season: Season;
  cropName: string;
  category: CropCategory;
  targetPlantingDate: string;
  targetHarvestDate: string;
  expectedYieldTonsPerHa: number;
  actualYieldTonsPerHa?: number;
  pestDiseaseRisk: 'Low' | 'Moderate' | 'High';
  soilBenefitSummary: string;
  status: 'Planned' | 'In Progress' | 'Harvested';
}

export type TransactionType = 'Revenue' | 'Expense';

export type RevenueCategory = 
  | 'Crop Grain Sales' 
  | 'Horticulture & Produce' 
  | 'Livestock & Meat' 
  | 'Dairy & Milk' 
  | 'Wool & Byproducts' 
  | 'Government Ag Subsidies';

export type ExpenseCategory = 
  | 'Seeds & Seedlings' 
  | 'Fertilizers & Soil Amendments' 
  | 'Animal Feed & Minerals' 
  | 'Veterinary & Medication' 
  | 'Machinery Fuel & Maintenance' 
  | 'Labor & Seasonal Wages' 
  | 'Irrigation & Utilities' 
  | 'Equipment Lease & Storage';

export interface FinancialTransaction {
  id: string;
  date: string;
  fiscalSeason: 'Spring Planting' | 'Summer Growing' | 'Autumn Harvest' | 'Winter Storage';
  type: TransactionType;
  category: RevenueCategory | ExpenseCategory;
  description: string;
  amount: number;
  relatedEntity: string; // e.g., "Field B2", "Livestock Pen 4", "Dairy Bulk Tank"
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Agricultural Credit';
  referenceNo: string;
}

export interface SeasonalSummary {
  season: string;
  revenue: number;
  expenses: number;
  netMargin: number;
  profitMarginPercent: number;
  topRevenueSource: string;
  topExpenseDriver: string;
}

export interface FarmProfile {
  farmName: string;
  managerName: string;
  totalAcreageHa: number;
  primaryEnterprise: string;
  currencySymbol: string;
  location: string;
}
