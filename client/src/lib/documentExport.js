function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeFilePart(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function paragraphsFromText(text = '') {
  return String(text)
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

export function downloadCoverLetterDoc(letter = {}, application = {}) {
  const title = letter.title || `Cover letter - ${application.title || 'Application'}`
  const fileName = [
    'cover-letter',
    safeFilePart(application.company),
    safeFilePart(application.title),
  ].filter(Boolean).join('-') || 'cover-letter'

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #111827;
      font-size: 11pt;
      line-height: 1.55;
      max-width: 680px;
      margin: 48px auto;
    }
    h1 {
      font-size: 16pt;
      margin: 0 0 18px;
    }
    p {
      margin: 0 0 12px;
    }
    .meta {
      color: #4b5563;
      font-size: 9pt;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml([application.title, application.company].filter(Boolean).join(' at '))}</p>
  ${paragraphsFromText(letter.cover_letter || '')}
</body>
</html>`

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.doc`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
