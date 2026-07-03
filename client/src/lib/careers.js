// Known careers portals for major finance, consulting, tech, and business employers.
// searchUrl: portal search with {query} replaced by encoded job title.
// careersUrl: base careers page used as fallback.
const CAREERS_MAP = [
  // ── Tier 1: Bulge Bracket ─────────────────────────────────────────────────
  { keys: ['goldman sachs'],
    searchUrl: 'https://higher.gs.com/roles/?q={query}',
    careersUrl: 'https://higher.gs.com/roles/' },

  { keys: ['jpmorgan', 'jp morgan', 'j.p. morgan', 'jpmorgan chase', 'jp morgan chase'],
    searchUrl: 'https://careers.jpmorgan.com/global/en/search-jobs?q={query}',
    careersUrl: 'https://careers.jpmorgan.com/' },

  { keys: ['morgan stanley'],
    careersUrl: 'https://www.morganstanley.com/people/careers' },

  { keys: ['bank of america', 'merrill lynch', 'bofa'],
    searchUrl: 'https://careers.bankofamerica.com/en-us/search-jobs?q={query}',
    careersUrl: 'https://careers.bankofamerica.com/' },

  { keys: ['citigroup', 'citibank', 'citi'],
    searchUrl: 'https://jobs.citi.com/search-jobs?keyword={query}',
    careersUrl: 'https://jobs.citi.com/' },

  { keys: ['barclays'],
    searchUrl: 'https://search.jobs.barclays/?q={query}',
    careersUrl: 'https://search.jobs.barclays/' },

  { keys: ['hsbc'],
    searchUrl: 'https://www.hsbc.com/careers/jobs-and-internships/job-search?keywords={query}',
    careersUrl: 'https://www.hsbc.com/careers' },

  { keys: ['deutsche bank'],
    careersUrl: 'https://careers.db.com/' },

  { keys: ['ubs'],
    searchUrl: 'https://jobs.ubs.com/TGWebHost/searchjobs.aspx?q={query}',
    careersUrl: 'https://jobs.ubs.com/' },

  { keys: ['bnp paribas'],
    careersUrl: 'https://group.bnpparibas/en/careers' },

  { keys: ['societe generale', 'société générale', 'socgen'],
    searchUrl: 'https://careers.societegenerale.com/en/job-offers?query={query}',
    careersUrl: 'https://careers.societegenerale.com/en/' },

  { keys: ['credit agricole', 'crédit agricole'],
    searchUrl: 'https://careers.credit-agricole.com/job-search?query={query}',
    careersUrl: 'https://careers.credit-agricole.com/' },

  { keys: ['nomura'],
    searchUrl: 'https://nomuracareers.com/search/?q={query}',
    careersUrl: 'https://nomuracareers.com/' },

  { keys: ['standard chartered'],
    careersUrl: 'https://www.sc.com/en/careers/' },

  { keys: ['wells fargo'],
    searchUrl: 'https://www.wellsfargojobs.com/search-jobs?q={query}',
    careersUrl: 'https://www.wellsfargojobs.com/' },

  { keys: ['commerzbank'],
    careersUrl: 'https://www.commerzbank.com/en/main/karriere_und_ausbildung/' },

  { keys: ['ing group', 'ing bank', 'ing'],
    searchUrl: 'https://www.ing.jobs/global/vacancy-overview.htm?q={query}',
    careersUrl: 'https://www.ing.jobs/' },

  { keys: ['unicredit'],
    searchUrl: 'https://careers.unicredit.eu/search/?q={query}',
    careersUrl: 'https://careers.unicredit.eu/' },

  { keys: ['intesa sanpaolo', 'intesa'],
    careersUrl: 'https://careers.intesasanpaolo.com/' },

  { keys: ['bbva'],
    searchUrl: 'https://careers.bbva.com/en/jobs/?q={query}',
    careersUrl: 'https://careers.bbva.com/en/' },

  { keys: ['santander'],
    careersUrl: 'https://www.santander.com/en/careers/' },

  { keys: ['abn amro'],
    careersUrl: 'https://www.abnamro.com/en/careers' },

  { keys: ['rabobank'],
    careersUrl: 'https://www.rabobank.com/careers/' },

  // ── Tier 1: Elite Boutiques ────────────────────────────────────────────────
  { keys: ['rothschild'],
    searchUrl: 'https://careers.rothschildandco.com/search/?q={query}',
    careersUrl: 'https://careers.rothschildandco.com/' },

  { keys: ['lazard'],
    searchUrl: 'https://careers.lazard.com/search/?q={query}',
    careersUrl: 'https://careers.lazard.com/' },

  { keys: ['evercore'],
    careersUrl: 'https://www.evercore.com/careers/job-openings/' },

  { keys: ['moelis'],
    careersUrl: 'https://www.moelis.com/careers/' },

  { keys: ['houlihan lokey'],
    searchUrl: 'https://careers.hl.com/search/?q={query}',
    careersUrl: 'https://careers.hl.com/' },

  { keys: ['jefferies'],
    careersUrl: 'https://www.jefferies.com/careers/job-listings/' },

  { keys: ['macquarie'],
    searchUrl: 'https://www.macquarie.com/careers/find-a-job?query={query}',
    careersUrl: 'https://www.macquarie.com/careers' },

  { keys: ['piper sandler'],
    careersUrl: 'https://www.pipersandler.com/careers' },

  { keys: ['perella weinberg'],
    careersUrl: 'https://www.pwpartners.com/careers' },

  // ── Tier 1: Asset Management ──────────────────────────────────────────────
  { keys: ['blackrock'],
    searchUrl: 'https://careers.blackrock.com/job-search-results/?keyword={query}',
    careersUrl: 'https://careers.blackrock.com/' },

  { keys: ['vanguard'],
    searchUrl: 'https://www.vanguardjobs.com/search-jobs?q={query}',
    careersUrl: 'https://www.vanguardjobs.com/' },

  { keys: ['fidelity'],
    searchUrl: 'https://jobs.fidelity.com/search-jobs?q={query}',
    careersUrl: 'https://jobs.fidelity.com/' },

  { keys: ['pimco'],
    searchUrl: 'https://pimco.wd1.myworkdayjobs.com/pimco_careers/jobs?q={query}',
    careersUrl: 'https://www.pimco.com/en-us/about/career-opportunities' },

  { keys: ['schroders'],
    searchUrl: 'https://careers.schroders.com/en/search/?q={query}',
    careersUrl: 'https://careers.schroders.com/en/' },

  { keys: ['amundi'],
    searchUrl: 'https://careers.amundi.com/jobs?query={query}',
    careersUrl: 'https://careers.amundi.com/' },

  { keys: ['man group'],
    careersUrl: 'https://www.man.com/careers' },

  { keys: ['t. rowe price', 't rowe price'],
    careersUrl: 'https://troweprice.wd5.myworkdayjobs.com/TRowePrice' },

  { keys: ['franklin templeton'],
    careersUrl: 'https://franklintempleton.wd5.myworkdayjobs.com/en-US/External' },

  { keys: ['invesco'],
    careersUrl: 'https://invesco.wd1.myworkdayjobs.com/Invesco_Careers' },

  { keys: ['aberdeen'],
    careersUrl: 'https://www.aberdeengroup.com/en/about-us/careers' },

  { keys: ['legal and general', 'legal & general'],
    careersUrl: 'https://careers.legalandgeneral.com/' },

  { keys: ['aviva'],
    careersUrl: 'https://careers.aviva.co.uk/' },

  { keys: ['aegon'],
    careersUrl: 'https://www.aegon.com/about-aegon/careers/' },

  // ── Tier 1: Alternative Investments ──────────────────────────────────────
  { keys: ['kkr'],
    searchUrl: 'https://kkr.wd3.myworkdayjobs.com/KKR/jobs?q={query}',
    careersUrl: 'https://www.kkr.com/careers' },

  { keys: ['blackstone'],
    searchUrl: 'https://blackstone.wd1.myworkdayjobs.com/Blackstone_External_Career_Site/jobs?q={query}',
    careersUrl: 'https://www.blackstone.com/careers/' },

  { keys: ['apollo global', 'apollo management'],
    searchUrl: 'https://apolloglobal.wd5.myworkdayjobs.com/Apollo_Careers/jobs?q={query}',
    careersUrl: 'https://www.apollo.com/careers' },

  { keys: ['carlyle'],
    careersUrl: 'https://www.carlyle.com/working-at-carlyle/open-positions' },

  { keys: ['tpg'],
    careersUrl: 'https://www.tpg.com/about/careers' },

  { keys: ['warburg pincus'],
    careersUrl: 'https://www.warburgpincus.com/careers/' },

  { keys: ['bain capital'],
    careersUrl: 'https://www.baincapital.com/careers' },

  { keys: ['advent international'],
    careersUrl: 'https://www.adventinternational.com/about-us/careers/' },

  { keys: ['bridgewater'],
    careersUrl: 'https://www.bridgewater.com/careers/' },

  { keys: ['citadel'],
    searchUrl: 'https://www.citadel.com/careers/open-positions/?q={query}',
    careersUrl: 'https://www.citadel.com/careers/' },

  { keys: ['two sigma'],
    searchUrl: 'https://careers.twosigma.com/careers/Careers?q={query}',
    careersUrl: 'https://careers.twosigma.com/' },

  { keys: ['aqr capital', 'aqr'],
    searchUrl: 'https://careers.aqr.com/jobs?search={query}',
    careersUrl: 'https://careers.aqr.com/' },

  { keys: ['jane street'],
    searchUrl: 'https://www.janestreet.com/join-jane-street/apply/?query={query}',
    careersUrl: 'https://www.janestreet.com/join-jane-street/' },

  { keys: ['imc trading'],
    searchUrl: 'https://careers.imc.com/eu/en/search-results?keywords={query}',
    careersUrl: 'https://careers.imc.com/' },

  { keys: ['susquehanna', 'sig susquehanna'],
    searchUrl: 'https://careers.sig.com/job/?q={query}',
    careersUrl: 'https://careers.sig.com/' },

  { keys: ['virtu financial', 'virtu'],
    careersUrl: 'https://www.virtu.com/careers/' },

  { keys: ['point72'],
    careersUrl: 'https://point72.com/careers/' },

  { keys: ['millennium management', 'millennium'],
    careersUrl: 'https://www.mlp.com/careers/' },

  { keys: ['de shaw', 'd.e. shaw'],
    careersUrl: 'https://www.deshaw.com/careers' },

  // ── Tier 2: Big 4 & Consulting ─────────────────────────────────────────────
  { keys: ['deloitte'],
    searchUrl: 'https://apply.deloitte.com/careers/SearchJobs/{query}',
    careersUrl: 'https://www2.deloitte.com/global/en/careers.html' },

  { keys: ['pwc', 'pricewaterhousecoopers', 'price waterhouse'],
    searchUrl: 'https://www.pwc.com/gx/en/careers/job-search.html?q={query}',
    careersUrl: 'https://www.pwc.com/gx/en/careers.html' },

  { keys: ['ernst & young', 'ernst and young', 'ey'],
    searchUrl: 'https://careers.ey.com/ey/search/?q={query}&orgIds=1',
    careersUrl: 'https://careers.ey.com/' },

  { keys: ['kpmg'],
    careersUrl: 'https://home.kpmg/xx/en/home/careers.html' },

  { keys: ['mckinsey'],
    searchUrl: 'https://www.mckinsey.com/careers/search-jobs?q={query}',
    careersUrl: 'https://www.mckinsey.com/careers' },

  { keys: ['boston consulting group'],
    careersUrl: 'https://careers.bcg.com/' },

  { keys: ['bain & company', 'bain and company'],
    careersUrl: 'https://www.bain.com/careers/find-a-role/' },

  { keys: ['oliver wyman'],
    careersUrl: 'https://www.oliverwyman.com/careers.html' },

  { keys: ['roland berger'],
    careersUrl: 'https://www.rolandberger.com/en/Career/' },

  { keys: ['accenture'],
    searchUrl: 'https://www.accenture.com/us-en/careers/jobsearch?jk={query}',
    careersUrl: 'https://www.accenture.com/careers' },

  // ── Tier 2: General Business, Tech & Consumer ─────────────────────────────
  { keys: ['amazon'],
    searchUrl: 'https://www.amazon.jobs/en/search?base_query={query}',
    careersUrl: 'https://www.amazon.jobs/' },

  { keys: ['loreal', "l'oreal"],
    searchUrl: 'https://careers.loreal.com/en_US/jobs/SearchJobs/?q={query}',
    careersUrl: 'https://careers.loreal.com/' },

  { keys: ['booking.com', 'booking holdings'],
    searchUrl: 'https://careers.booking.com/jobs?query={query}',
    careersUrl: 'https://careers.booking.com/' },

  { keys: ['salesforce'],
    searchUrl: 'https://careers.salesforce.com/en/jobs/?search={query}',
    careersUrl: 'https://www.salesforce.com/company/careers/' },

  { keys: ['procter and gamble', 'procter & gamble', 'p&g'],
    searchUrl: 'https://www.pgcareers.com/search-jobs?k={query}',
    careersUrl: 'https://www.pgcareers.com/' },

  { keys: ['spotify'],
    careersUrl: 'https://www.lifeatspotify.com/jobs' },

  { keys: ['siemens'],
    searchUrl: 'https://jobs.siemens.com/careers?query={query}',
    careersUrl: 'https://jobs.siemens.com/' },

  { keys: ['heineken'],
    careersUrl: 'https://careers.theheinekencompany.com/' },

  { keys: ['hubspot'],
    searchUrl: 'https://www.hubspot.com/careers/jobs?hubs_content-cta=careers-search&search={query}',
    careersUrl: 'https://www.hubspot.com/careers' },

  { keys: ['nestle', 'nestlé'],
    searchUrl: 'https://www.nestle.com/jobs/search-jobs?keyword={query}',
    careersUrl: 'https://www.nestle.com/jobs' },

  { keys: ['maersk'],
    searchUrl: 'https://www.maersk.com/careers/vacancies?searchText={query}',
    careersUrl: 'https://www.maersk.com/careers' },

  { keys: ['zalando'],
    searchUrl: 'https://jobs.zalando.com/en/jobs/?q={query}',
    careersUrl: 'https://jobs.zalando.com/' },

  // ── Tier 2: FinTech ────────────────────────────────────────────────────────
  { keys: ['revolut'],
    searchUrl: 'https://www.revolut.com/careers/all-jobs?search={query}',
    careersUrl: 'https://www.revolut.com/careers/' },

  { keys: ['stripe'],
    searchUrl: 'https://stripe.com/jobs/search?q={query}',
    careersUrl: 'https://stripe.com/jobs' },

  { keys: ['wise'],
    searchUrl: 'https://wise.jobs/search/?q={query}',
    careersUrl: 'https://wise.jobs/' },

  { keys: ['klarna'],
    careersUrl: 'https://www.klarna.com/careers/' },

  { keys: ['n26'],
    careersUrl: 'https://n26.com/en-gb/careers/jobs' },

  { keys: ['monzo'],
    careersUrl: 'https://monzo.com/careers/' },

  { keys: ['starling bank', 'starling'],
    careersUrl: 'https://www.starlingbank.com/careers/' },

  { keys: ['bending spoons'],
    careersUrl: 'https://jobs.bendingspoons.com/' },

  // ── Additional firms found in feed ────────────────────────────────────────
  { keys: ['permira'],
    careersUrl: 'https://www.permira.com/people/join-us/' },

  { keys: ['mediobanca'],
    careersUrl: 'https://careers.mediobanca.com/' },

  { keys: ['eurazeo'],
    careersUrl: 'https://www.eurazeo.com/en/careers/' },

  { keys: ['robeco'],
    careersUrl: 'https://careers.robeco.com/' },

  { keys: ['alantra'],
    careersUrl: 'https://www.alantra.com/careers' },
]

// Normalize a company name for map lookup.
function normalizeCompany(company) {
  return (company || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Find the best matching entry in the careers map.
function findEntry(company) {
  const norm = normalizeCompany(company)
  for (const entry of CAREERS_MAP) {
    for (const key of entry.keys) {
      if (key.length <= 3) {
        // Short keys (e.g. "ey", "ubs") require word-boundary match to avoid false positives.
        const re = new RegExp(`(?:^|\\s)${key}(?:\\s|$)`)
        if (re.test(norm)) return entry
      } else if (norm.includes(key)) {
        return entry
      }
    }
  }
  return null
}

/**
 * Build a direct-apply URL for a given company and job title.
 * Returns the company's careers portal search URL if known,
 * otherwise falls back to a Google search.
 */
export function buildDirectUrl(company, title) {
  const entry = findEntry(company)
  const query = encodeURIComponent(title || '')

  if (entry) {
    if (entry.searchUrl) {
      return entry.searchUrl.replace('{query}', query)
    }
    return entry.careersUrl
  }

  // Unknown company — Google search pre-scoped to company + job title
  const q = encodeURIComponent(`"${company || ''}" careers "${title || ''}"`)
  return `https://www.google.com/search?q=${q}`
}

/**
 * Returns true if the company is in the known map (direct portal link),
 * false if it will fall back to a Google search.
 */
export function isKnownEmployer(company) {
  return findEntry(company) !== null
}
