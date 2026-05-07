#!/usr/bin/env node

/**
 * Skills Sync Script
 * Automatically detects installed agent targets and syncs valid source skills.
 * Usage: node scripts/sync-skills.mjs [--force] [--agent=agent-name]
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const SKILLS_SOURCE = path.join(ROOT_DIR, '.agents', 'skills')
const FORCE_FLAG = process.argv.includes('--force')
const AGENT_FLAG = process.argv.find((arg) => arg.startsWith('--agent='))?.split('=')[1]
const NPX_BINARY = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const AGENT_TARGETS = {
  'claude-code': [path.join(ROOT_DIR, '.claude', 'skills')],
  cursor: [path.join(ROOT_DIR, '.cursor', 'skills')],
  opencode: [path.join(ROOT_DIR, '.opencode', 'skills')],
  'github-copilot': [path.join(ROOT_DIR, '.github', 'skills'), path.join(ROOT_DIR, '.copilot', 'skills')],
  codex: [path.join(ROOT_DIR, '.codex', 'skills')],
  cline: [path.join(ROOT_DIR, '.cline', 'skills')],
  'vscode-copilot': [path.join(ROOT_DIR, '.copilot', 'skills')],
}

function hasRequiredFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)

  if (!frontmatterMatch) {
    return false
  }

  const frontmatter = frontmatterMatch[1]

  return /^name:\s*.+$/m.test(frontmatter) && /^description:\s*.+$/m.test(frontmatter)
}

function getValidSkillDirs() {
  if (!fs.existsSync(SKILLS_SOURCE)) {
    return []
  }

  return fs
    .readdirSync(SKILLS_SOURCE, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(SKILLS_SOURCE, entry.name))
    .filter((skillDir) => {
      const skillFile = path.join(skillDir, 'SKILL.md')

      if (!fs.existsSync(skillFile)) {
        return false
      }

      return hasRequiredFrontmatter(fs.readFileSync(skillFile, 'utf8'))
    })
}

function detectAgents() {
  return Object.entries(AGENT_TARGETS)
    .filter(([, targetPaths]) => targetPaths.some((targetPath) => fs.existsSync(targetPath)))
    .map(([agentName]) => agentName)
}

function runSkillsCommand(args) {
  const result = spawnSync(NPX_BINARY, ['skills', ...args], {
    cwd: ROOT_DIR,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`skills ${args.join(' ')} exited with code ${result.status}`)
  }
}

function syncAgent(agent, skillDirs) {
  try {
    console.log(`\nSyncing ${skillDirs.length} skill${skillDirs.length === 1 ? '' : 's'} to ${agent}...`)

    if (FORCE_FLAG) {
      runSkillsCommand(['remove', '*', '--agent', agent, '-y'])
    }

    for (const skillDir of skillDirs) {
      const relativeSkillDir = path.relative(ROOT_DIR, skillDir).replace(/\\/g, '/')
      runSkillsCommand(['add', `./${relativeSkillDir}`, '--agent', agent, '-y'])
    }

    console.log(`${agent} synced successfully\n`)
    return true
  } catch (error) {
    console.error(`Failed to sync ${agent}: ${error.message}`)
    return false
  }
}

async function main() {
  const skillDirs = getValidSkillDirs()
  const skillNames = skillDirs.map((skillDir) => path.basename(skillDir))

  console.log('\nSkills Synchronization Manager\n')
  console.log('Source: ./.agents/skills')
  console.log(`Mode: ${FORCE_FLAG ? 'FORCE (resync all)' : 'Normal (incremental)'}`)
  console.log(`Valid source skills: ${skillDirs.length} (${skillNames.join(', ')})\n`)

  if (skillDirs.length === 0) {
    console.error(
      'No valid skills found in .agents/skills. Each skill directory must contain a SKILL.md with name and description frontmatter.',
    )
    process.exit(1)
  }

  const agents = AGENT_FLAG ? [AGENT_FLAG] : detectAgents()
  const targetAgents = agents.length > 0 ? agents : ['claude-code']

  console.log(`Detected agents: ${targetAgents.join(', ')}\n`)
  console.log('Starting synchronization...\n')

  const results = {
    success: [],
    failed: [],
  }

  for (const agent of targetAgents) {
    if (syncAgent(agent, skillDirs)) {
      results.success.push(agent)
    } else {
      results.failed.push(agent)
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log('Synchronization Summary\n')
  console.log(`Successful: ${results.success.length} (${results.success.join(', ')})`)

  if (results.failed.length > 0) {
    console.log(`Failed: ${results.failed.length} (${results.failed.join(', ')})`)
  }

  console.log(`${'='.repeat(50)}\n`)

  process.exit(results.failed.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
