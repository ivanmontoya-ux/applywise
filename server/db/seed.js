import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import { classifyJob } from '../services/classifier.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'jobs.db')

const now = new Date()
function daysAgo(n) {
  const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString()
}

const JOBS = [
  // ── Original 8 sectors ───────────────────────────────────────────────────
  {
    id: 'seed_1',
    title: 'Investment Banking Analyst — Graduate',
    company: 'Goldman Sachs',
    location: 'London, UK',
    sector: 'Investment Banking',
    salary_min: 70000, salary_max: 85000, salary_currency: 'GBP',
    description: 'Two-year analyst program in our London IBD division. Work on M&A advisory, ECM, and DCM transactions across EMEA.',
    url: 'https://www.goldmansachs.com/careers',
    date_posted: daysAgo(1),
    deadline_type: 'date', deadline_date: '2026-09-30',
  },
  {
    id: 'seed_2',
    title: 'Asset Management Graduate Programme',
    company: 'BlackRock',
    location: 'London, UK',
    sector: 'Asset Management',
    salary_min: 60000, salary_max: 70000, salary_currency: 'GBP',
    description: 'Rotational graduate programme across iShares, Multi-Asset Strategies, and Fundamental Active Equity teams.',
    url: 'https://careers.blackrock.com',
    date_posted: daysAgo(2),
    deadline_type: 'rolling', deadline_date: null,
  },
  {
    id: 'seed_3',
    title: 'M&A Analyst — Entry Level',
    company: 'Morgan Stanley',
    location: 'Madrid, Spain',
    sector: 'M&A',
    salary_min: 55000, salary_max: 65000, salary_currency: 'EUR',
    description: 'Join our Madrid M&A team advising on cross-border transactions in the Iberian market and broader EMEA region.',
    url: 'https://www.morganstanley.com/careers',
    date_posted: daysAgo(3),
    deadline_type: 'date', deadline_date: '2026-08-15',
  },
  {
    id: 'seed_4',
    title: 'Wealth Management Associate',
    company: 'UBS',
    location: 'Milan, Italy',
    sector: 'Wealth Management',
    salary_min: 45000, salary_max: 60000, salary_currency: 'EUR',
    description: 'Support senior private bankers in managing portfolios for UHNW clients across Italy and the Mediterranean region.',
    url: 'https://www.ubs.com/careers',
    date_posted: daysAgo(5),
    deadline_type: null, deadline_date: null,
  },
  {
    id: 'seed_5',
    title: 'Private Equity Analyst',
    company: 'KKR',
    location: 'New York, US',
    sector: 'Private Equity',
    salary_min: 120000, salary_max: 150000, salary_currency: 'USD',
    description: 'Analyst position on our Americas PE team. Source and execute LBO investments across technology, healthcare, and industrials.',
    url: 'https://www.kkr.com/careers',
    date_posted: daysAgo(6),
    deadline_type: 'date', deadline_date: '2026-07-31',
  },
  {
    id: 'seed_6',
    title: 'Venture Capital Analyst',
    company: 'Sequoia Capital',
    location: 'New York, US',
    sector: 'Venture Capital',
    salary_min: 100000, salary_max: 130000, salary_currency: 'USD',
    description: 'Early-stage VC analyst role. Source Series A and B opportunities, conduct due diligence, and support portfolio companies.',
    url: 'https://www.sequoiacap.com',
    date_posted: daysAgo(7),
    deadline_type: 'rolling', deadline_date: null,
  },
  {
    id: 'seed_7',
    title: 'Financial Analyst — Graduate Scheme',
    company: 'ING Group',
    location: 'Amsterdam, Netherlands',
    sector: 'Commercial Banking',
    salary_min: 42000, salary_max: 52000, salary_currency: 'EUR',
    description: '18-month graduate rotation across corporate finance, risk, and structured products in our Amsterdam HQ.',
    url: 'https://www.ing.jobs',
    date_posted: daysAgo(8),
    deadline_type: null, deadline_date: null,
  },
  {
    id: 'seed_8',
    title: 'Private Banking Graduate',
    company: 'Santander',
    location: 'Madrid, Spain',
    sector: 'Private Banking',
    salary_min: 38000, salary_max: 48000, salary_currency: 'EUR',
    description: 'Graduate training programme in Santander Private Banking Madrid. Client-facing role from day one.',
    url: 'https://www.santander.com/careers',
    date_posted: daysAgo(10),
    deadline_type: 'date', deadline_date: '2026-10-01',
  },
  {
    id: 'seed_9',
    title: 'Equity Research Analyst',
    company: 'JPMorgan',
    location: 'London, UK',
    sector: 'Equity Research',
    salary_min: 65000, salary_max: 80000, salary_currency: 'GBP',
    description: 'Analyst role in our London Equity Research division covering European financials and real estate.',
    url: 'https://jpmorgan.com/careers',
    date_posted: daysAgo(12),
    deadline_type: 'rolling', deadline_date: null,
  },
  {
    id: 'seed_10',
    title: 'Investment Analyst — Fixed Income',
    company: 'PIMCO',
    location: 'Amsterdam, Netherlands',
    sector: 'Asset Management',
    salary_min: 55000, salary_max: 68000, salary_currency: 'EUR',
    description: 'Fixed income investment analyst supporting portfolio managers on European credit and rates strategies.',
    url: 'https://pimco.com/careers',
    date_posted: daysAgo(14),
    deadline_type: null, deadline_date: null,
  },
  // ── Sales & Trading ───────────────────────────────────────────────────────
  {
    id: 'seed_11',
    title: 'Sales & Trading Analyst',
    company: 'Barclays',
    location: 'London, UK',
    sector: 'Sales & Trading',
    salary_min: 65000, salary_max: 80000, salary_currency: 'GBP',
    description: 'Graduate analyst in our Markets division. Rotations across fixed income, equities, FX, and commodities desks.',
    url: 'https://www.barclays.com/careers',
    date_posted: daysAgo(2),
    deadline_type: 'date', deadline_date: '2026-11-01',
  },
  {
    id: 'seed_12',
    title: 'Equities Sales & Trading Graduate',
    company: 'Citigroup',
    location: 'New York, US',
    sector: 'Sales & Trading',
    salary_min: 110000, salary_max: 140000, salary_currency: 'USD',
    description: 'Two-year analyst programme across S&T desks in NYC. Exposure to institutional client coverage and market-making.',
    url: 'https://careers.citi.com',
    date_posted: daysAgo(4),
    deadline_type: 'rolling', deadline_date: null,
  },
  // ── Brokerage & Market Making ─────────────────────────────────────────────
  {
    id: 'seed_13',
    title: 'Junior Market Maker — Equities',
    company: 'Virtu Financial',
    location: 'New York, US',
    sector: 'Brokerage & Market Making',
    salary_min: 95000, salary_max: 130000, salary_currency: 'USD',
    description: 'Entry-level market making on our equities desk. Work with proprietary algorithms and real-time execution systems.',
    url: 'https://www.virtu.com/careers',
    date_posted: daysAgo(3),
    deadline_type: 'rolling', deadline_date: null,
  },
  {
    id: 'seed_14',
    title: 'Graduate Trader — ETF & Derivatives',
    company: 'IMC Trading',
    location: 'Amsterdam, Netherlands',
    sector: 'Brokerage & Market Making',
    salary_min: 55000, salary_max: 70000, salary_currency: 'EUR',
    description: "Full training in derivatives and ETF market making at one of Europe's leading proprietary trading firms.",
    url: 'https://www.imc.com/careers',
    date_posted: daysAgo(6),
    deadline_type: null, deadline_date: null,
  },
  // ── Equity Research ───────────────────────────────────────────────────────
  {
    id: 'seed_15',
    title: 'Research Associate — European Equities',
    company: 'Deutsche Bank',
    location: 'London, UK',
    sector: 'Equity Research',
    salary_min: 60000, salary_max: 75000, salary_currency: 'GBP',
    description: 'Support senior analysts covering FTSE and DAX-listed companies. Produce sector reports and financial models.',
    url: 'https://www.db.com/careers',
    date_posted: daysAgo(4),
    deadline_type: 'date', deadline_date: '2026-09-15',
  },
  {
    id: 'seed_16',
    title: 'Equity Research Analyst — Banks',
    company: 'BNP Paribas',
    location: 'London, UK',
    sector: 'Equity Research',
    salary_min: 58000, salary_max: 72000, salary_currency: 'GBP',
    description: 'Cover European banking sector for institutional clients. Build valuation models and write client-facing research notes.',
    url: 'https://bnpparibas.com/careers',
    date_posted: daysAgo(9),
    deadline_type: 'rolling', deadline_date: null,
  },
  // ── Risk Management ───────────────────────────────────────────────────────
  {
    id: 'seed_17',
    title: 'Market Risk Analyst — Graduate',
    company: 'HSBC',
    location: 'London, UK',
    sector: 'Risk Management',
    salary_min: 52000, salary_max: 65000, salary_currency: 'GBP',
    description: 'Monitor market risk across trading portfolios using VaR models, stress testing, and regulatory reporting frameworks.',
    url: 'https://www.hsbc.com/careers',
    date_posted: daysAgo(5),
    deadline_type: 'date', deadline_date: '2026-10-15',
  },
  {
    id: 'seed_18',
    title: 'Credit Risk Analyst',
    company: 'Société Générale',
    location: 'Milan, Italy',
    sector: 'Risk Management',
    salary_min: 40000, salary_max: 52000, salary_currency: 'EUR',
    description: 'Assess credit risk for corporate clients in the Italian and Southern European market. Graduate entry role.',
    url: 'https://careers.societegenerale.com',
    date_posted: daysAgo(11),
    deadline_type: null, deadline_date: null,
  },
  // ── Quantitative Analysis ─────────────────────────────────────────────────
  {
    id: 'seed_19',
    title: 'Quantitative Analyst — Entry Level',
    company: 'Two Sigma',
    location: 'New York, US',
    sector: 'Quantitative Analysis',
    salary_min: 130000, salary_max: 180000, salary_currency: 'USD',
    description: 'Apply statistical and ML techniques to financial data. Build and validate systematic trading strategy models.',
    url: 'https://www.twosigma.com/careers',
    date_posted: daysAgo(3),
    deadline_type: 'date', deadline_date: '2026-12-01',
  },
  {
    id: 'seed_20',
    title: 'Quant Researcher Graduate',
    company: 'AQR Capital',
    location: 'New York, US',
    sector: 'Quantitative Analysis',
    salary_min: 120000, salary_max: 160000, salary_currency: 'USD',
    description: 'Research systematic investment strategies. Strong quantitative background required — Stats, Maths, Physics, or CS.',
    url: 'https://www.aqr.com/careers',
    date_posted: daysAgo(7),
    deadline_type: 'rolling', deadline_date: null,
  },
  // ── Financial Advisory ────────────────────────────────────────────────────
  {
    id: 'seed_21',
    title: 'Financial Advisory Analyst',
    company: 'Lazard',
    location: 'London, UK',
    sector: 'Financial Advisory',
    salary_min: 65000, salary_max: 78000, salary_currency: 'GBP',
    description: 'Work on M&A advisory, restructuring, and capital markets transactions for sovereign and corporate clients worldwide.',
    url: 'https://www.lazard.com/careers',
    date_posted: daysAgo(2),
    deadline_type: 'date', deadline_date: '2026-08-31',
  },
  {
    id: 'seed_22',
    title: 'Advisory Graduate Programme',
    company: 'Rothschild & Co',
    location: 'Madrid, Spain',
    sector: 'Financial Advisory',
    salary_min: 42000, salary_max: 55000, salary_currency: 'EUR',
    description: 'Two-year rotation across M&A advisory and capital markets. Work on landmark European cross-border transactions.',
    url: 'https://www.rothschildandco.com/careers',
    date_posted: daysAgo(8),
    deadline_type: 'rolling', deadline_date: null,
  },
  // ── Corporate Finance ─────────────────────────────────────────────────────
  {
    id: 'seed_23',
    title: 'Corporate Finance Analyst',
    company: 'Shell',
    location: 'Amsterdam, Netherlands',
    sector: 'Corporate Finance',
    salary_min: 50000, salary_max: 62000, salary_currency: 'EUR',
    description: 'Support M&A and investment appraisal for major energy transition projects. Global capital allocation exposure.',
    url: 'https://careers.shell.com',
    date_posted: daysAgo(6),
    deadline_type: 'rolling', deadline_date: null,
  },
  {
    id: 'seed_24',
    title: 'Graduate — Corporate Finance',
    company: 'KPMG',
    location: 'London, UK',
    sector: 'Corporate Finance',
    salary_min: 48000, salary_max: 58000, salary_currency: 'GBP',
    description: 'Financial due diligence and valuation work on transactions across TMT, consumer, and infrastructure sectors.',
    url: 'https://home.kpmg/careers',
    date_posted: daysAgo(13),
    deadline_type: 'date', deadline_date: '2026-09-05',
  },
  // ── Treasury ──────────────────────────────────────────────────────────────
  {
    id: 'seed_25',
    title: 'Treasury Analyst — Graduate',
    company: 'Unilever',
    location: 'London, UK',
    sector: 'Treasury',
    salary_min: 42000, salary_max: 52000, salary_currency: 'GBP',
    description: "Manage liquidity, FX hedging, and debt financing for one of the world's largest consumer goods companies.",
    url: 'https://careers.unilever.com',
    date_posted: daysAgo(4),
    deadline_type: 'date', deadline_date: '2026-11-15',
  },
  {
    id: 'seed_26',
    title: 'Group Treasury Trainee',
    company: 'Philips',
    location: 'Amsterdam, Netherlands',
    sector: 'Treasury',
    salary_min: 38000, salary_max: 48000, salary_currency: 'EUR',
    description: 'Trainee role within the Philips Group Treasury team. Cash management, FX, and interest rate risk exposure.',
    url: 'https://www.philips.com/careers',
    date_posted: daysAgo(10),
    deadline_type: null, deadline_date: null,
  },
  // ── Compliance & Regulatory ───────────────────────────────────────────────
  {
    id: 'seed_27',
    title: 'Compliance Analyst — Graduate',
    company: 'BBVA',
    location: 'Madrid, Spain',
    sector: 'Compliance & Regulatory',
    salary_min: 36000, salary_max: 45000, salary_currency: 'EUR',
    description: "Support regulatory compliance across BBVA's EMEA operations. AML, MiFID II, and conduct risk frameworks.",
    url: 'https://careers.bbva.com',
    date_posted: daysAgo(5),
    deadline_type: 'rolling', deadline_date: null,
  },
  {
    id: 'seed_28',
    title: 'Regulatory Affairs Analyst',
    company: 'Nomura',
    location: 'London, UK',
    sector: 'Compliance & Regulatory',
    salary_min: 55000, salary_max: 68000, salary_currency: 'GBP',
    description: "Ensure compliance with FCA and PRA regulations across Nomura's European banking operations.",
    url: 'https://www.nomura.com/careers',
    date_posted: daysAgo(15),
    deadline_type: 'date', deadline_date: '2026-10-31',
  },
  // ── Financial Technology (FinTech) ────────────────────────────────────────
  {
    id: 'seed_29',
    title: 'FinTech Analyst — Finance Graduate',
    company: 'Revolut',
    location: 'London, UK',
    sector: 'Financial Technology (FinTech)',
    salary_min: 55000, salary_max: 70000, salary_currency: 'GBP',
    description: 'Work at the intersection of finance and technology — product analytics, financial modelling, and growth initiatives.',
    url: 'https://www.revolut.com/careers',
    date_posted: daysAgo(3),
    deadline_type: 'date', deadline_date: '2026-12-15',
  },
  {
    id: 'seed_30',
    title: 'Finance & Strategy Analyst',
    company: 'N26',
    location: 'Amsterdam, Netherlands',
    sector: 'Financial Technology (FinTech)',
    salary_min: 45000, salary_max: 58000, salary_currency: 'EUR',
    description: "Financial planning and strategic analysis at one of Europe's fastest-growing neobanks.",
    url: 'https://n26.com/careers',
    date_posted: daysAgo(9),
    deadline_type: 'rolling', deadline_date: null,
  },
]

const INSERT_SQL = `
  INSERT OR REPLACE INTO jobs (
    id, title, company, company_logo, location, sector,
    salary_min, salary_max, salary_currency, description, url,
    date_posted, source, deadline_type, deadline_date,
    grand_category, sub_type
  ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'seed', ?, ?, ?, ?)
`

// Called by index.js as an API-failure fallback (uses the shared db connection)
export function seedDb(db) {
  const stmt = db.prepare(INSERT_SQL)
  for (const job of JOBS) {
    const { grandCategory, subType } = classifyJob(job.title)
    stmt.run(
      job.id, job.title, job.company,
      job.location, job.sector,
      job.salary_min, job.salary_max, job.salary_currency,
      job.description, job.url, job.date_posted,
      job.deadline_type ?? null, job.deadline_date ?? null,
      grandCategory, subType,
    )
  }
  return JOBS.length
}

// Direct execution: node server/db/seed.js
const isMain = process.argv[1]?.endsWith('seed.js')
if (isMain) {
  const db = new Database(DB_PATH)
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, company TEXT NOT NULL,
      company_logo TEXT, location TEXT, sector TEXT,
      salary_min REAL, salary_max REAL, salary_currency TEXT,
      description TEXT, url TEXT NOT NULL, date_posted TEXT,
      source TEXT DEFAULT 'seed', created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT, deadline_type TEXT, deadline_date TEXT,
      grand_category TEXT, sub_type TEXT
    )
  `)
  const n = seedDb(db)
  console.log(`✓ Seeded ${n} jobs into ${DB_PATH}`)
  db.close()
}
