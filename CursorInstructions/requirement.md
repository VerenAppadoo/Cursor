# Requirement — MAH-PO
# Author: [Your Name]
# Date: [Date]
# Version: 1.1

> **v1.1:** §4.1 QERY / IACONO / grid options aligned with implemented MAH-PO; **§19** is a step-by-step runbook so an agent can build the app in one pass without rediscovering details from prior chats.

---

## 1. PROJECT OVERVIEW
- App Name: MAH-PO
- App Title (displayed in masthead): MAH-PO
- Target Infor Tenant: [e.g. PROD / UAT]
- Angular Project Name: MAH-PO

---

## 2. BUSINESS CONTEXT
This app allows users to view and manage Purchase Orders (PO) from M3.
The user filters PO headers by a date range, views all matching PO headers
in a grid, selects a PO header and sees the corresponding PO lines in a
second grid below. Everything is done from a single screen without
navigating multiple M3 panels.

---

## 3. SCREENS / FEATURES TO BUILD

### 3.1 Row 1 — Filter Bar
- Two Soho date picker fields side by side:
  - From Date:
    - Label: "From Date"
    - Initialize with: today's date - 15 days
    - Format displayed to user: dd/mm/yyyy
    - Format passed to API: YYYYMMDD
    - Input size: small — always apply class input-sm
  - To Date:
    - Label: "To Date"
    - Initialize with: today's date + 15 days
    - Format displayed to user: dd/mm/yyyy
    - Format passed to API: YYYYMMDD
    - Input size: small — always apply class input-sm

- Input size rule:
  - ALL input fields and date pickers in this project must use
    the input-sm CSS class for small size
  - Never use default input size — always apply input-sm
  - This applies to every soho-datepicker, soho-input,
    soho-dropdown, soho-lookup in the entire project

- IMPORTANT — Date conversion rule:
  - All dates displayed in the UI must be in dd/mm/yyyy format
  - All dates passed to any API input must be converted to
    YYYYMMDD format
  - All dates returned from API output must be converted from
    YYYYMMDD to dd/mm/yyyy before displaying in any grid

### 3.2 Row 2 — PO Headers Grid
- Displays all PO Header records matching the date filter
- Single select grid (only one row can be selected at a time)
- Filter enabled on the grid
- Row height: extra small — always apply rowHeight: 'extra-small'
  on the soho-grid
- Refresh button in the grid toolbar:
  - Icon only — no button label text
  - Use refresh icon only, do not add any text label
  - Refer to SampleH5SDK\C04-Cuisson-Pomme for the exact
    icon-only refresh button implementation in the toolbar
  - Show soho-busy-indicator while the API call is in progress
- When a row is selected:
  - Trigger loading of PO Lines grid (Row 3)
  - Refer to SampleH5SDK\C04-Formulation-BOM for the exact row
    selected event implementation pattern
- When no row is selected:
  - PO Lines grid dataset must be set to [] using updateDataset
  - Do NOT call PPS200MI.LstLine2

### 3.3 Row 3 — PO Lines Grid
- Displays all PO Lines for the selected PO Header
- Only populated when a PO Header row is selected
- If no PO Header selected — grid dataset = [] via updateDataset
- Filter enabled on the grid
- Row height: extra small — always apply rowHeight: 'extra-small'
  on the soho-grid
- Refresh button in the grid toolbar:
  - Icon only — no button label text
  - Use refresh icon only, do not add any text label
  - Show soho-busy-indicator while the API call is in progress
- Display LstLine2 output fields **except `CONO`** (see §4.2)
- Date fields must be reformatted from YYYYMMDD to dd/mm/yyyy
  before displaying in the grid

---

## 4. CUSTOM APIs USED

### 4.1 EXPORTMI / Select — PO Headers
- Purpose: Fetch PO Header records from MPHEAD table filtered
  by approval date range
- Program: EXPORTMI
- Transaction: Select
- Mandatory inputs:
  | Field | Type   | Description                          | Mandatory |
  |-------|--------|--------------------------------------|-----------|
  | SEPC  | String | Separator character — use 漢          | Yes       |
  | HDRS  | String | Headers flag — use 0                 | Yes       |
  | QERY  | String | Query string (see below)             | Yes       |

- QERY value — pattern (build dynamically; `[FROM]` / `[TO]` = YYYYMMDD):
  - **Column list:** uppercase **IA\*** aliases, **comma-separated**, **no `SELECT`**.
  - **Exclude `IACONO` / `iacono` entirely** — company must not appear in EXPORT field list, parser, or PO Headers grid.
  - **SQL keywords** `from`, `where`, `and` must be **lowercase**.
  - **Table** `MPHEAD` and **predicate field** `IAPUDT` stay **uppercase** as shown.

  Example (one line when assembled):

  `IAPUNO, IAPUDT, IADWDT, IALEDT, IASUNO, IABUYE, IACUCD, IAYRE1, IATFNO, IACOAM, IADIVI, IAFACI, IAWHLO, IAORTY, IALNCD, IATEPY, IAMODL, IATEDL, IATEAF, IATEPA, IARFID, IATEL1, IAHAFE, IAPOTC, IAPYAD, IAMTDP, IAMTWP, IAOURR, IAOURT, IAPRSU, IAAGNT, IANTAM, IATOQT, IARASN, IAEXAT, IAFUSC, IAODAM, IAPROJ, IAELNO, IABRAM, IACMCO, IANOLN, IAPORG, IASRAM from MPHEAD where IAPUDT >= [FROM] and IAPUDT <= [TO]`

- QERY rules:
  - Field list order = REPL segment order after split on **漢** — keep a single ordered array constant in code and reuse it for `QERY` and `parseExportMIResponse`.
  - Parser must map IA\* → grid keys **case-insensitively** (e.g. `IAPUNO` → `PUNO`).
  - Do NOT write **SELECT** — start with the column list.

- QERY fields ordered list — same order as in the example above (uppercase), **without IACONO**, for `parseExportMIResponse(items, fields)`:
  - `IAPUNO` … `IASRAM` (43 fields) as in the example line.

- Response format — CRITICAL:
  - EXPORTMI.Select does NOT return a normal key/value response
  - It returns an array of records where each record has a
    single field called REPL containing all values concatenated
    and separated by the 漢 character
  - Raw response example:
    [
      { "REPL": "100漢BBJJ88漢20220506漢20220510漢..." },
      { "REPL": "100漢CC1234漢20230101漢20230105漢..." }
    ]

- Response parsing — CRITICAL:
  - Each REPL string must be split by 漢 to get individual values
  - Each value is then mapped to the corresponding field name
    in the SAME positional order as the fields[] array above
  - The IA prefix must be stripped when naming the mapped output
    fields so they are clean for grid display (first column is
    purchase order number):
      iapuno / IAPUNO → PUNO
      iapudt → PUDT
      iadwdt → DWDT
      ialedt → LEDT
      iasuno → SUNO
      iabuye → BUYE
      iacucd → CUCD
      iayre1 → YRE1
      iatfno → TFNO
      iacoam → COAM
      iadivi → DIVI
      iafaci → FACI
      iawhlo → WHLO
      iaorty → ORTY
      ialncd → LNCD
      iatepy → TEPY
      iamodl → MODL
      iatedl → TEDL
      iateaf → TEAF
      iatepa → TEPA
      iarfid → RFID
      iatel1 → TEL1
      iahafe → HAFE
      iapotc → POTC
      iapyad → PYAD
      iamtdp → MTDP
      iamtwp → MTWP
      iaourr → OURR
      iaourt → OURT
      iaprsu → PRSU
      iaagnt → AGNT
      iantam → NTAM
      iatoqt → TOQT
      iarasn → RASN
      iaexat → EXAT
      iafusc → FUSC
      iaodam → ODAM
      iaproj → PROJ
      iaelno → ELNO
      iabram → BRAM
      iacmco → CMCO
      ianoln → NOLN
      iaporg → PORG
      iasram → SRAM
  - After mapping, apply date formatting to ALL date fields:
      PUDT, DWDT, LEDT — convert YYYYMMDD → dd/mm/yyyy
  - This parsing logic MUST be implemented as a reusable method
    in the shared service — never inline it in the component
  - The reusable parser method: accept **`items`** and the same
    ordered **`fields[]`** as QERY; return parsed row objects (and
    optionally a **parse failure count** for user-facing toast if
    any **REPL** segment count mismatches).

### 4.2 PPS200MI / LstLine2 — PO Lines
- Purpose: Fetch all PO Lines for a selected PO Header
- Program: PPS200MI
- Transaction: LstLine2
- This is a standard MIService call — normal key/value response
- Mandatory inputs:
  | Field | Type   | Description                          | Mandatory |
  |-------|--------|--------------------------------------|-----------|
  | PUNO  | String | Purchase order number extracted      | Yes       |
  |       |        | from the selected PO Header row      |           |

- Output:
  - Display LstLine2 output fields in the grid **except `CONO`**
    (company is not required in the UI; API may still return it).
  - Date fields must be converted from YYYYMMDD to dd/mm/yyyy
    before binding to the grid

---

## 5. STANDARD M3 APIs USED
None — both API calls for this project are custom/extension APIs
fully defined in section 4 above.

---

## 6. BUSINESS LOGIC & FLOWS

### 6.1 App Startup
1. UserContext initializes via APP_INITIALIZER before app loads
2. parametre.json loads and exposes appVersion to the masthead
3. Filter bar initializes:
   - From Date = today - 15 days (displayed as dd/mm/yyyy)
   - To Date   = today + 15 days (displayed as dd/mm/yyyy)
4. PO Headers grid loads automatically on startup using the
   default date range — call EXPORTMI.Select immediately
5. PO Lines grid is empty on startup (dataset = [])

### 6.2 Search / Refresh PO Headers Grid
1. User adjusts date range or clicks Refresh button on
   PO Headers grid toolbar
2. From Date and To Date are converted to YYYYMMDD format
3. EXPORTMI.Select is called with:
   - SEPC = 漢
   - HDRS = 0
   - QERY = built from the **§4.1** ordered IA\* list (**no IACONO**),
     lowercase **from / where / and**, uppercase **MPHEAD** and **IAPUDT**
     bounds — see §4.1 example line
4. soho-busy-indicator shows on PO Headers grid while loading
5. Each record in response.items has a single REPL field
   containing all values separated by 漢
6. Call parseExportMIResponse() shared method to:
   a. Split each REPL by 漢
   b. Map each value to its corresponding field name
      using the exact positional order of the fields[] array
   c. Strip IA prefix from all field names
   d. Convert date fields PUDT, DWDT, LEDT from
      YYYYMMDD to dd/mm/yyyy
7. Bind the parsed and formatted array to the PO Headers
   grid dataset
8. soho-busy-indicator hides
9. If no results — grid shows empty state message
10. If API error — Soho toast shows M3 error message
11. PO Lines grid dataset is reset to [] using updateDataset
    whenever PO Headers grid is refreshed

### 6.3 PO Header Row Selected
1. User clicks a row in the PO Headers grid
   (refer to SampleH5SDK\C04-Formulation-BOM for the exact
   row selected event pattern)
2. PUNO is extracted from the selected row data
3. PPS200MI.LstLine2 is called with PUNO
4. soho-busy-indicator shows on PO Lines grid
5. Response is a standard key/value MIService response
6. All date fields in response items are converted from
   YYYYMMDD to dd/mm/yyyy before binding to the grid
7. PO Lines grid dataset is updated with the results
8. soho-busy-indicator hides
9. If no results — PO Lines grid shows empty state message
10. If API error — Soho toast shows M3 error message

### 6.4 PO Header Row Deselected or Grid Refreshed
1. When no row is selected in PO Headers grid OR when
   PO Headers grid is refreshed
2. PO Lines grid dataset must be set to [] using updateDataset
3. Do NOT call PPS200MI.LstLine2

### 6.5 Refresh PO Lines Grid
1. User clicks Refresh button on PO Lines grid toolbar
2. Check if a PO Header row is currently selected:
   - If YES: re-call PPS200MI.LstLine2 with the currently
     selected PUNO
   - If NO: set PO Lines grid dataset to [] using updateDataset
     and do not call the API

---

## 7. UI / COMPONENT REQUIREMENTS

### 7.1 Row 1 — Filter Bar
- soho-datepicker for From Date
  - Default value: today - 15 days
  - Display format: dd/mm/yyyy
  - CSS class: input-sm
  - Translation key: filter.dateFrom
- soho-datepicker for To Date
  - Default value: today + 15 days
  - Display format: dd/mm/yyyy
  - CSS class: input-sm
  - Translation key: filter.dateTo
- Both fields displayed side by side in the same row

### 7.2 Row 2 — PO Headers Grid
- soho-grid
  - Single select mode
  - Filter row enabled
  - rowHeight: 'extra-small'
  - Toolbar with Refresh button:
    - Icon only — no label text whatsoever
    - Do not add any text string next to or inside the button
    - Use the refresh SVG icon only
    - Refer to SampleH5SDK\C04-Cuisson-Pomme for the exact
      icon-only refresh button implementation in the toolbar
  - soho-busy-indicator while loading
  - Columns mapped from parsed EXPORTMI.Select response (**no CONO** —
    matches QERY without IACONO):
      PUNO, PUDT, DWDT, LEDT, SUNO, BUYE, CUCD,
      YRE1, TFNO, COAM, DIVI, FACI, WHLO, ORTY, LNCD,
      TEPY, MODL, TEDL, TEAF, TEPA, RFID, TEL1, HAFE,
      POTC, PYAD, MTDP, MTWP, OURR, OURT, PRSU, AGNT,
      NTAM, TOQT, RASN, EXAT, FUSC, ODAM, PROJ, ELNO,
      BRAM, CMCO, NOLN, PORG, SRAM
  - **Soho datagrid (jQuery `.datagrid`) options** (both grids where applicable):
    - `rowHeight: 'extra-small'`
    - `columnSizing: 'both'`
    - `spacerColumn: true` (rows use full grid width)
    - `frozenColumns: { left: ['PUNO'] }` (PO number frozen on the left)
    - `toolbar: { results: true }` with **exactly one** sibling
      `<div class="toolbar" role="toolbar">` in the grid parent that
      includes `<span class="datagrid-result-count"></span>` next to
      the title (see SampleH5SDK\\C04-Formulation-BOM)
    - `filterable: true`, `selectable: 'single'` (headers)
  - Column heading rule — CRITICAL (Soho shows **`name` as header text**):
    - Set **`id`**, **`field`** to the M3 field id (e.g. `PUNO`).
    - Set **`name`** and **`text`** to the **FLDS / human-readable**
      description (same string) so headers are not raw IDs.
    - Date columns (`PUDT`, `DWDT`, `LEDT`): `filterType: 'date'`,
      `formatter: Soho.Formatters.Date`, `dateFormat` / `sourceFormat`
      `dd/MM/yyyy` (or equivalent for locale).
    - Non-date columns: `filterType: 'text'`, `Soho.Formatters.Text`.
  - Date columns PUDT, DWDT, LEDT formatted to dd/mm/yyyy
  - Row selected event triggers PO Lines load
    (refer to SampleH5SDK\C04-Formulation-BOM for the exact
    selected row event pattern)
  - Grid height: refer to SampleH5SDK\C04-Cuisson-Pomme for
    the exact height value and how it is applied

### 7.3 Row 3 — PO Lines Grid
- soho-grid
  - Filter row enabled
  - rowHeight: 'extra-small'
  - Toolbar with Refresh button:
    - Icon only — no label text whatsoever
    - Do not add any text string next to or inside the button
    - Use the refresh SVG icon only
    - Same icon-only implementation as Row 2 toolbar
  - soho-busy-indicator while loading
  - Columns: all LstLine2 output fields **except `CONO`** (see §4.2).
  - Same **datagrid options** as §7.2 (`columnSizing`, `spacerColumn`,
    `frozenColumns: { left: ['PUNO'] }`, `toolbar.results`, etc.).
  - Column heading rule: same as §7.2 — **`name`** and **`text`** =
    FLDS description; **`filterType: 'date'`** for date fields (e.g. `PLDT`).
  - Date columns formatted to dd/mm/yyyy
  - Default state: empty dataset ([]) until a PO Header
    row is selected
  - Grid height: refer to SampleH5SDK\C04-Cuisson-Pomme for
    the exact height value and how it is applied

---

## 8. TOOLBAR REFRESH BUTTON — GLOBAL RULE
- Every grid toolbar refresh button in this project must be
  icon only — no text label of any kind
- Use the refresh SVG icon only
- Never add a text string inside or next to the refresh button
- This applies to all grids in the project without exception
- Refer to SampleH5SDK\C04-Cuisson-Pomme for the exact
  icon-only button implementation pattern

---

## 9. INPUT & GRID SIZE RULES — GLOBAL

### 9.1 Input Size
- ALL input fields in this project must use input-sm class
- Applies to: soho-datepicker, soho-input, soho-dropdown,
  soho-lookup — every field without exception
- Never use default input size anywhere in this project

### 9.2 Grid Row Height
- ALL grids in this project must use rowHeight: 'extra-small'
- Applies to: PO Headers grid and PO Lines grid
- Never use default row height anywhere in this project
- Set rowHeight: 'extra-small' in the soho-grid options

---

## 10. DATE HANDLING — GLOBAL RULE
This rule applies everywhere in the project without exception:

| Context                     | Format                                    |
|-----------------------------|-------------------------------------------|
| UI display (datepicker)     | dd/mm/yyyy                                |
| Grid column display         | dd/mm/yyyy                                |
| API input (MIRecord)        | YYYYMMDD                                  |
| API output (response items) | Convert YYYYMMDD → dd/mm/yyyy before grid |

- Date conversion must be implemented as reusable methods
  in the shared utility service — never inline
- Method: formatDateForDisplay(date: string): string
  Converts YYYYMMDD → dd/mm/yyyy
- Method: formatDateForAPI(date: Date): string
  Converts Date object → YYYYMMDD
- Known date fields in PO Headers grid: PUDT, DWDT, LEDT
- Known date fields in PO Lines grid: refer to
  PPS200MI.LstLine2 output field definitions

---

## 11. ASSETS FILE STRUCTURE
- The assets folder structure must exactly match
  SampleH5SDK\C04-Cuisson-Pomme\src\assets\
- Refer to that folder as the single source of truth for:
  - Folder names and hierarchy
  - Which files exist and where they are placed
  - File naming conventions
- Two mandatory files that must always exist:

### 11.1 src/assets/api.json
- Stores ALL M3 API calls used in this project
- Must be kept in ASCENDING ORDER by program name,
  then transaction name
- Every time a new API call is added to the shared service,
  update this file immediately
- Format:
  [
    {
      "program": "EXPORTMI",
      "transaction": "Select",
      "description": "Fetch PO headers from MPHEAD table",
      "inputs": ["SEPC", "HDRS", "QERY"],
      "outputs": ["REPL"]
    },
    {
      "program": "PPS200MI",
      "transaction": "LstLine2",
      "description": "List PO lines for a given PO number",
      "inputs": ["PUNO"],
      "outputs": []
    }
  ]
- Always maintain alphabetical ascending order:
  programs A→Z, then transactions A→Z within same program
- Never leave this file empty or outdated

### 11.2 src/assets/parametre.json
- Stores the project version and global parameters
- The version value is displayed in the masthead via
  {{appVersion.version}}
- app.component.ts must load this file at startup and
  expose it as appVersion
- Format must match SampleH5SDK\C04-Cuisson-Pomme\src\assets\
  parametre.json exactly
- Values for this project:
  {
    "version": "1.0",
    "appName": "MAH-PO",
    "environment": "production"
  }
- Note: version is "1.0" single decimal — never "1.0.0"

---

## 12. LAYOUT & STYLING RULES

### 12.1 Page Overflow — CRITICAL
- The MAIN page container (root app container) must have:
  - overflow-y: hidden — no vertical scroll on the main page
  - overflow-x: hidden — no horizontal scroll on the main page
- The container BELOW the masthead (content area) must have:
  - overflow-y: scroll — vertical scroll enabled here only
  - overflow-x: hidden — no horizontal scroll
- This means scrolling only happens inside the content area
  below the masthead — never on the full page itself
- Refer to SampleH5SDK\C04-Cuisson-Pomme for the exact CSS
  class and structure used to achieve this layout
- Never apply overflow-y: scroll to the root/main container
- Never apply overflow-y: hidden to the content area below
  the masthead

### 12.2 Grid Heights
- PO Headers grid (Row 2): use the exact same grid height as
  defined in SampleH5SDK\C04-Cuisson-Pomme
- PO Lines grid (Row 3): use the exact same grid height as
  defined in SampleH5SDK\C04-Cuisson-Pomme
- Refer to SampleH5SDK\C04-Cuisson-Pomme component CSS/SCSS
  file for the exact height values and how they are applied
- Never hardcode a different height — copy the exact
  implementation from the sample project

### 12.3 General Layout Rules
- Never introduce custom CSS that conflicts with Soho IDS
- All layout, height, overflow and spacing must follow the
  same patterns used in SampleH5SDK\C04-Cuisson-Pomme
- The sample project is the single source of truth for all
  layout decisions

---

## 13. SHARED SERVICE METHODS REQUIRED

| Method                    | Purpose                               |
|---------------------------|---------------------------------------|
| call_EXPORTMI_Select()    | Call EXPORTMI.Select with SEPC,       |
|                           | HDRS, QERY params                     |
| parseExportMIResponse()   | Split REPL by 漢, map positionally     |
|                           | to fields[], strip IA prefix,         |
|                           | convert date fields                   |
| call_PPS200MI_LstLine2()  | Call PPS200MI.LstLine2 with PUNO      |
| formatDateForDisplay()    | Convert YYYYMMDD → dd/mm/yyyy         |
| formatDateForAPI()        | Convert Date object → YYYYMMDD        |

---

## 14. GLOBAL PARAMETERS
Values for src/assets/parametre.json:

  {
    "version": "1.0",
    "appName": "MAH-PO",
    "environment": "production"
  }

Note: version uses single decimal format "1.0" — never "1.0.0"

---

## 15. TRANSLATION KEYS NEEDED

| Key               | Default Text      |
|-------------------|-------------------|
| filter.dateFrom   | From Date         |
| filter.dateTo     | To Date           |
| button.refresh    | Refresh           |
| grid.noResults    | No results found  |
| error.apiError    | M3 API Error      |
| grid.poHeaders    | PO Headers        |
| grid.poLines      | PO Lines          |

---

## 16. ERROR SCENARIOS TO HANDLE

| Scenario                             | What to show                      |
|--------------------------------------|-----------------------------------|
| EXPORTMI.Select returns error        | Soho toast with M3 error message  |
| EXPORTMI.Select returns no results   | Empty state in PO Headers grid    |
| PPS200MI.LstLine2 returns error      | Soho toast with M3 error message  |
| PPS200MI.LstLine2 returns no results | Empty state in PO Lines grid      |
| REPL string cannot be parsed         | Log error + Soho toast            |
| Date field missing or malformed      | Display empty string in grid      |
| UserContext fails to load            | Show error message in content area (do not redirect unless product requires it) |
| Network / timeout error              | Generic error toast               |

---

## 17. OUT OF SCOPE
- No editing of PO Header or PO Line data
- No creation of new POs
- No deletion of POs
- No PDF or export functionality
- No user defined fields excluded from all grids

---

## 18. OPEN QUESTIONS / TO CLARIFY
- [ ] Confirm exact list of PPS200MI.LstLine2 output fields
- [ ] Confirm which fields in PO Lines grid are date fields
      so date formatting is applied correctly
- [ ] Confirm FLDS description text for each PPS200MI.LstLine2
      output field to use as grid column headers
- [ ] Confirm if any grid columns should be hidden by default
- [ ] Confirm default sort column for PO Headers grid
- [ ] Confirm default sort column for PO Lines grid
- [ ] Confirm translation language — EN only or multilingual?

---

## 19. ONE-SHOT IMPLEMENTATION RUNBOOK (FOR AI / DEVELOPERS)

Follow this order so the app matches MAH-PO v1.1 without iterative fixes.

### 19.1 Project baseline
1. Angular + **ids-enterprise-ng** + **@infor-up/m3-odin** + **@infor-up/m3-odin-angular** + **Transloco** (or equivalent i18n).
2. **APP_INITIALIZER**: load **UserContext** before first screen; expose readiness / error flags on a root injectable service.
3. **`src/assets/parametre.json`**: `version` `"1.0"`, `appName`, `environment` (see §14).
4. **`src/assets/api.json`**: match **SampleH5SDK\\C04-Cuisson-Pomme** — array of `{ "Program": "…", "Transaction": "…" }` only (PascalCase keys); used for About dialog list.

### 19.2 EXPORTMI / QERY and parser
1. Single exported constant: ordered **IA\*** field names for QERY, **uppercase**, **omit `IACONO`** (43 fields from **§4.1** example).
2. **`buildExportSelectQery(from, to)`**: join fields with `, `, then
   ` from MPHEAD where IAPUDT >= ${from} and IAPUDT <= ${to}`
   (lowercase **`from` / `where` / `and`** only).
3. **`call_EXPORTMI_Select`**: `SEPC` = 漢, `HDRS` = `'0'`, `QERY` as above; handle `response.hasError()`.
4. **`parseExportMIResponse(items, fields)`**: split each `REPL` on 漢; segment count must match `fields.length`; map positionally; strip **IA** prefix **case-insensitively** → grid keys (`PUNO`, `PUDT`, …); format **PUDT, DWDT, LEDT** with **`YYYYMMDD` → `dd/mm/yyyy`** before binding.

### 19.3 PPS200MI.LstLine2
1. Input: **PUNO** from selected header row.
2. Build line columns from API field list **excluding `CONO`**.
3. **`formatLstLine2ItemsForGrid`**: apply date display rules to known date fields (e.g. **PLDT**).

### 19.4 Layout and scroll (Cuisson-style)
1. **Root**: `100vh`, `overflow` hidden; **masthead** fixed height.
2. **`.mah-po-main`**: `flex: 1`, `min-height: 0`, `position: relative` — holds scrollable content + toast overlay.
3. **`.mah-po-content-scroll`**: `flex: 1`, `min-height: 0`, `overflow-y: auto`, `overflow-x: hidden`.
4. **Full width**: under `.mah-po-content-scroll`, override IDS **`.container`** / **`.row`** with `max-width: 100%` / `width: 100%` so grids span the panel; grid wrapper **`.mah-po-grid`**: `width: 100%`, `max-width: 100%`.
5. **Scrollbar styling**: copy **`*::-webkit-scrollbar` / `html` scrollbar** rules from **SampleH5SDK\\C04-Cuisson-Pomme\\src\\styles.css** into **`src/styles.css`**, plus **`body { overflow: hidden; }`** to avoid double page scroll.

### 19.5 Toasts and M3 errors
1. Place **`<div id="toast-container" class="toast-container toast-top-right mah-po-toast-layer">`** inside **`.mah-po-main`** as a **sibling** of **`.mah-po-content-scroll`** (not inside the scrolling div). Style with **`position: absolute`**, top-right, high **z-index**, `pointer-events` so only toasts capture clicks.
2. Call **`.toast()`** on **`$('.mah-po-main').first()`** when present (else `body`) so Soho’s instance ties to the main panel.
3. **Never show `[object Object]`**: implement **`extractMiErrorMessage`** that unwraps nested M3 shapes (**`errorMessage.errorMessage`**, `Message`, `msg`, etc.), arrays, and falls back to JSON only if needed. Use for **`response.errorMessage`**, API error payloads, and non-`Error` catch values.

### 19.6 Grids (jQuery Soho datagrid)
Initialize **after** view exists (e.g. **`ngAfterViewInit`** + Transloco load), on **`#datagridPoHeaders`** / **`#datagridPoLines`**:

| Option | Value |
|--------|--------|
| `rowHeight` | `'extra-small'` |
| `columnSizing` | `'both'` |
| `spacerColumn` | `true` |
| `frozenColumns` | `{ left: ['PUNO'] }` |
| `toolbar` | `{ results: true }` |
| `filterable` | `true` |
| `selectable` | `'single'` (headers only) |

**Toolbar HTML** (parent of grid): exactly **one** **`.toolbar`** per grid block; title row includes **`<span class="datagrid-result-count"></span>`** (Formulation-BOM pattern).

**Refresh**: icon-only **`#icon-reset`**, empty **`<span></span>`** (Cuisson).

**Busy**: **`soho-busyindicator`** on grid host with **`[activated]`** bound to loading flags.

### 19.7 Transloco
1. Avoid 404 on **`/assets/i18n/en.json`** in H5: either bundle English in a **custom `TranslocoHttpLoader`** (e.g. `import` JSON) or ensure asset path is correct.
2. Provide keys from §15 + About / errors as needed.

### 19.8 Verification checklist
- [ ] QERY has **uppercase IA\*** list, **no IACONO**, lowercase **from/where/and**.
- [ ] Header grid has **no CONO** column; line grid has **no CONO** column.
- [ ] **PUNO** frozen left on **both** grids.
- [ ] Date columns use **`filterType: 'date'`** + **Date formatter** + **dd/mm/yyyy** display.
- [ ] Result count appears in toolbar after **`toolbar: { results: true }`** + **`.datagrid-result-count`** span.
- [ ] Toasts appear over **main panel**, messages are human-readable strings.
- [ ] **`body` overflow hidden**; only **content-scroll** scrolls; scrollbar dimensions match Cuisson **styles.css** sample.
