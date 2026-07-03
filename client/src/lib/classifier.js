const CLASSIFY_RULES = [
  {
    grandCategory: 'Graduate Program', subType: 'Graduate',
    kws: ['graduate', 'grad programme', 'grad program', 'grad scheme', 'graduate scheme',
          'graduate programme', 'graduate program', 'newly qualified', 'new grad'],
  },
  { grandCategory: 'Graduate Program', subType: 'Trainee',    kws: ['trainee', 'in training'] },
  { grandCategory: 'Graduate Program', subType: 'Junior',     kws: ['junior', 'jr.'] },
  { grandCategory: 'Graduate Program', subType: 'Apprentice', kws: ['apprentice', 'apprenticeship', 'school leaver'] },
  { grandCategory: 'Internship',       subType: 'Internship', kws: ['intern', 'internship'] },
  { grandCategory: 'Internship',       subType: 'Placement',  kws: ['placement', 'industrial placement', 'year in industry'] },
  { grandCategory: 'Internship',       subType: 'Work Experience', kws: ['work experience', 'shadowing'] },
  { grandCategory: 'Analyst Role',     subType: 'Quantitative', kws: ['quant', 'quantitative'] },
  { grandCategory: 'Analyst Role',     subType: 'Research',   kws: ['research', 'researcher'] },
  { grandCategory: 'Analyst Role',     subType: 'Analyst',    kws: ['analyst'] },
  { grandCategory: 'Associate',        subType: 'Associate',  kws: ['associate'] },
  { grandCategory: 'Associate',        subType: 'Assistant',  kws: ['assistant'] },
  { grandCategory: 'Business Role',    subType: 'Consultant', kws: ['consultant', 'consulting'] },
  { grandCategory: 'Business Role',    subType: 'Specialist', kws: ['specialist'] },
  { grandCategory: 'Business Role',    subType: 'Officer',    kws: ['officer'] },
  { grandCategory: 'Business Role',    subType: 'Coordinator', kws: ['coordinator'] },
  { grandCategory: 'Business Role',    subType: 'Executive',  kws: ['executive'] },
  { grandCategory: 'Business Role',    subType: 'Product',    kws: ['product'] },
  { grandCategory: 'Business Role',    subType: 'Operations', kws: ['operations', 'operation'] },
]

export function classifyJob(title = '') {
  const t = title.toLowerCase()
  for (const { grandCategory, subType, kws } of CLASSIFY_RULES) {
    for (const kw of kws) {
      if (t.includes(kw)) return { grandCategory, subType }
    }
  }
  return { grandCategory: 'Entry-Level', subType: 'General' }
}
