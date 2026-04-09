# Employment Outcomes by Field of Study

An interactive, single-page dashboard for exploring labour market outcomes of Canadian bachelor's degree holders by field of study. Built for the Brock University Economics department — centered on the question *"Where does Economics stand?"*

![Stack](https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20Tailwind%20%7C%20Recharts-000066)

## What it does

- **Overview** — rank callouts for the featured degree (Economics) vs. the top 50 most popular bachelor's degrees, across median income, average income, employment rate, and unemployment rate.
- **Field of Study Explorer** — search for any degree and see where it stands:
  - **Highlight mode:** one degree emphasized against all 50 for context.
  - **Compare mode:** pick two degrees and measure them head-to-head.
- **Charts** — horizontal bar rankings for median income and employment rate, plus a gender pay gap breakdown for the selected degree(s).
- **Filters** — swap Geo (Canada / Ontario), Age (25–64, 25–34, 35–44), and Gender (All / Men+ / Women+) at any time; all charts and stats recompute live.

## Data source

Statistics Canada, 2021 Census of Population, [Table 98-10-0409-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810040901).

- Top 50 degrees by number of bachelor's holders with employment income (Canada, ages 25–64, total gender, 2020 income year).
- Income figures cover workers who worked full-year, full-time in 2020.
- Employment/unemployment rates cover all labour force participants with the specified credential.

The dataset is loaded at runtime from `public/top50_degrees_combined.csv` using PapaParse — no backend, no build-time bundling.

## Tech stack

- **React 18** + **Vite 5** — fast dev server, minimal boilerplate
- **Tailwind CSS 3** — utility-first styling, Brock brand colors baked in
- **Recharts 2** — declarative, SVG-based charts
- **PapaParse 5** — CSV parsing in the browser

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

To produce a production build and preview it:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the site and deploys it to GitHub Pages on every push to `main`.

**Steps (one-time setup):**

1. Push this repo to GitHub.
2. In the repo settings, go to **Settings → Pages → Build and deployment**, and set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow will build and deploy automatically. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

The workflow automatically sets the correct base path for assets using `VITE_BASE_PATH=/<repo-name>/`, so no manual config is needed.

## Customizing

Most things you'd want to change live in `src/lib/config.js`:

| Want to change…                  | Edit                                    |
|----------------------------------|-----------------------------------------|
| Featured degree (currently Econ) | `FEATURED_CODE`, `FEATURED_NAME`        |
| Dashboard title                  | `TITLE`, `SUBTITLE`                     |
| Default filters on load          | `DEFAULT_FILTERS`                       |
| Brand colors                     | `COLORS` + `tailwind.config.js`         |
| Data file                        | Replace `public/top50_degrees_combined.csv` (keep column names) |

## Project structure

```
.
├── public/
│   └── top50_degrees_combined.csv  # Data loaded at runtime
├── src/
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Top-level state and layout
│   ├── index.css                   # Tailwind + base styles
│   ├── lib/
│   │   ├── config.js               # Colors, labels, featured degree
│   │   └── data.js                 # CSV loader, filter/rank helpers
│   └── components/
│       ├── Header.jsx
│       ├── FilterBar.jsx
│       ├── Overview.jsx            # Economics rank callouts
│       ├── Explorer.jsx            # Explorer section shell
│       ├── DegreePicker.jsx        # Searchable combobox
│       ├── RankedBarChart.jsx      # Shared bar chart base
│       ├── IncomeBarChart.jsx
│       ├── EmploymentBarChart.jsx
│       └── GenderPayGap.jsx
├── .github/workflows/deploy.yml    # GitHub Pages CI/CD
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## License

Data © Statistics Canada, used under the [Statistics Canada Open Licence](https://www.statcan.gc.ca/en/reference/licence). Code released under MIT.
