/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const thresholds = {
  lines: 80,
  functions: 80,
  branches: 75,
}

function parseLcov(lcovText) {
  const lines = lcovText.split(/\r?\n/)
  let totalLF = 0
  let totalLH = 0
  let totalFNF = 0
  let totalFNH = 0
  let totalBRF = 0
  let totalBRH = 0

  for (const l of lines) {
    if (l.startsWith('LF:')) totalLF += parseInt(l.slice(3), 10) || 0
    else if (l.startsWith('LH:')) totalLH += parseInt(l.slice(3), 10) || 0
    else if (l.startsWith('FNF:')) totalFNF += parseInt(l.slice(4), 10) || 0
    else if (l.startsWith('FNH:')) totalFNH += parseInt(l.slice(4), 10) || 0
    else if (l.startsWith('BRF:')) totalBRF += parseInt(l.slice(4), 10) || 0
    else if (l.startsWith('BRH:')) totalBRH += parseInt(l.slice(4), 10) || 0
  }

  return {
    lines: { found: totalLF, hit: totalLH },
    functions: { found: totalFNF, hit: totalFNH },
    branches: { found: totalBRF, hit: totalBRH },
  }
}

function percent(hit, found) {
  if (!found || found === 0) return 100
  return (hit / found) * 100
}

function main() {
  const lcovPath = path.resolve(process.cwd(), 'coverage', 'lcov.info')
  if (!fs.existsSync(lcovPath)) {
    console.warn('Coverage report not found at coverage/lcov.info — skipping threshold check')
    process.exit(0)
  }

  const txt = fs.readFileSync(lcovPath, 'utf8')
  const parsed = parseLcov(txt)

  const results = {
    lines: percent(parsed.lines.hit, parsed.lines.found),
    functions: percent(parsed.functions.hit, parsed.functions.found),
    branches: percent(parsed.branches.hit, parsed.branches.found),
  }

  console.log('Coverage summary:')
  console.log(`  lines: ${results.lines.toFixed(2)}% (${parsed.lines.hit}/${parsed.lines.found})`)
  console.log(`  functions: ${results.functions.toFixed(2)}% (${parsed.functions.hit}/${parsed.functions.found})`)
  console.log(`  branches: ${results.branches.toFixed(2)}% (${parsed.branches.hit}/${parsed.branches.found})`)

  let ok = true
  if (results.lines < thresholds.lines) {
    console.error(`Line coverage ${results.lines.toFixed(2)}% < ${thresholds.lines}%`)
    ok = false
  }
  if (results.functions < thresholds.functions) {
    console.error(`Function coverage ${results.functions.toFixed(2)}% < ${thresholds.functions}%`)
    ok = false
  }
  if (results.branches < thresholds.branches) {
    console.error(`Branch coverage ${results.branches.toFixed(2)}% < ${thresholds.branches}%`)
    ok = false
  }

  if (!ok) process.exit(2)
  console.log('Coverage thresholds met')
}

main()
