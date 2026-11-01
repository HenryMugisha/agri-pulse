# AgriPulse - Farm Management & Record Keeping System

A modern, responsive, web-based farm operating system for livestock health surveillance, multi-year regenerative crop rotation planning, and biological seasonal financial reports.

---

## 🌾 Features Included

1. **Livestock Health & Traceability Registry**
   - Ear-tag ID tracking across Cattle, Dairy Cows, Sheep, Goats, Swine, and Poultry.
   - Comprehensive clinical logs: vaccinations, routine checks, therapeutic medications, dosages, and costs.
   - **Automated Food Safety Withdrawal Engine**: Computes mandatory withholding periods for milk and meat after antibiotic or pharmaceutical treatments, locking treated animals under quarantine until safe.

2. **Crop Rotation & Arable Soil Management**
   - Parcel monitoring: acreage (ha), soil texture (alluvial, silt loam, clay loam), pH levels, organic matter %, and N-P-K nutrient availability.
   - 4-Year crop rotation timeline: Heavy Feeders (maize), Legumes / N-Fixers (soybeans, clover), Light Feeders (wheat, barley), and Cover Crops / Soil Builders.
   - **Agronomic Succession Rule Engine**: Evaluates successive crops in real time, flags monoculture nitrogen depletion risks, and optimizes biological *Rhizobium* nitrogen fixation.

3. **Seasonal Financial Accounting & Working Capital Ledger**
   - Biological quadrant accounting: *Spring Planting*, *Summer Growing*, *Autumn Harvest*, and *Winter Storage*.
   - Key financial indicators: Gross Revenue, Cost of Production (OPEX), Pre-Tax Net Margin (EBITDA), and Operating Margin %.
   - Full transaction ledger with search, filters, payment methods, and invoice reference tracking.

4. **1-Click Backup & Data Portability**
   - Auto-saves all changes in your browser's local storage.
   - 1-click **JSON Backup Export** & **JSON Restore** to move data between computers.
   - 1-click **CSV Exports** for spreadsheets and audits.

---

## 💻 How to Run and Host on Your Own Laptop (Step-by-Step)

You can run this entire application on your personal laptop (Windows, Mac, or Linux) completely offline!

### Step 1: Install Node.js
If you don't already have Node.js installed:
1. Go to **[https://nodejs.org/](https://nodejs.org/)**.
2. Download the recommended **LTS (Long Term Support)** installer (v20 or v22).
3. Run the installer and click "Next" through the setup wizard.

### Step 2: Download or Place the Code in a Folder
Extract or copy all the project files into a folder on your computer:
- **Windows:** `C:\Users\YourName\agripulse`
- **Mac / Linux:** `~/agripulse`

Ensure the folder contains `package.json`, `vite.config.ts`, `index.html`, and the `src/` directory.

### Step 3: Open Terminal / Command Prompt
- **On Windows:** Press `Win + R`, type `cmd`, and press Enter. Then navigate to your folder:
  ```bash
  cd C:\Users\YourName\agripulse
  ```
- **On Mac:** Press `Cmd + Space`, type `Terminal`, and press Enter. Then navigate:
  ```bash
  cd ~/agripulse
  ```

### Step 4: Install Dependencies (Run Once)
In your terminal, run:
```bash
npm install
```
This downloads the required libraries (React, Vite, Lucide icons, Tailwind CSS).

### Step 5: Start the Local Farm Server
To launch the app on your laptop:
```bash
npm run dev
```

You will see:
```text
  VITE v8.x.x  ready in 200 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h + enter to show help
```

Now, open your web browser (Chrome, Edge, Safari, Firefox) and visit:
👉 **`http://localhost:3000`**

---

## 📱 How to Open on Your Phone or Tablet via Farm Wi-Fi

If your laptop and your smartphone/tablet are connected to the same Wi-Fi router (or your mobile hotspot):

1. Start the server with the `--host` flag:
   ```bash
   npm run dev -- --host
   ```
2. Your terminal will show a **Network URL**, for example:
   ```text
   ➜  Local:   http://localhost:3000/
   ➜  Network: http://192.168.1.45:3000/
   ```
3. Type that **Network URL** (e.g., `http://192.168.1.45:3000`) into your phone's browser, and you can record livestock treatments directly in the field!

---

## 🗂️ Project Code Structure

```text
/
├── index.html                   # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── package.json                 # Dependencies & build scripts
├── README.md                    # This setup guide
├── src/
│   ├── App.tsx                  # Main application state & local storage persistence
│   ├── main.tsx                 # React DOM mount
│   ├── index.css                # Tailwind CSS v4 styling & print media styles
│   ├── types/
│   │   └── farm.ts              # TypeScript interfaces for Livestock, Fields, Rotations, Finances
│   ├── data/
│   │   └── initialFarmData.ts   # Verified baseline dataset (animals, parcels, transactions)
│   ├── utils/
│   │   └── agronomyCalculations.ts # Withdrawal date calculation, crop rules, CSV export
│   └── components/
│       ├── Navbar.tsx           # Top navigation bar
│       ├── OverviewTab.tsx      # Executive dashboard with alerts and KPIs
│       ├── LivestockTab.tsx     # Animal registry, clinical logs, withdrawal countdowns
│       ├── CropRotationTab.tsx  # Arable parcels, 4-year rotation timetable, simulator
│       ├── FinancialsTab.tsx    # Seasonal P&L statement, OPEX breakdown, ledger
│       └── SettingsBackupModal.tsx # Farm profile, JSON backup/restore, laptop hosting guide
```

---

## 💾 Saving & Backing Up Your Records

- **Automatic Persistence:** Any animal you add, medical treatment you log, or transaction you enter is automatically saved to your browser's persistent storage.
- **Portability:** Click **"Settings & Local Hosting"** in the top-right header and select **"Download JSON Backup"** to save a snapshot file of your entire farm. You can restore it on any computer at any time.
- **Spreadsheet Integration:** Every module includes an **"Export CSV"** button that lets you open your herd records, crop schedules, or financial statements directly in Microsoft Excel or Google Sheets.
