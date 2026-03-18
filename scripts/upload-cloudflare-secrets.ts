#!/usr/bin/env tsx
/**
 * Upload Cloudflare Secrets Script
 *
 * Uploads environment variables from .env to Cloudflare Workers secrets.
 * Uses .env.cloudflare.local for Cloudflare API credentials.
 *
 * Usage:
 *   npx tsx scripts/upload-cloudflare-secrets.ts
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdtempSync } from 'fs'
import { resolve, join } from 'path'
import { tmpdir } from 'os'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const content = readFileSync(filePath, 'utf-8')
  const env: Record<string, string> = {}

  for (const line of content.split('\n')) {
    if (line.trim().startsWith('#') || !line.trim()) continue

    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      // If value is a file path, read file contents
      if ((value.startsWith('./') || value.startsWith('/')) && existsSync(resolve(filePath, '..', value))) {
        env[key] = readFileSync(resolve(filePath, '..', value), 'utf-8').trim()
      } else {
        env[key] = value
      }
    }
  }

  return env
}

function uploadSecret(key: string, value: string, projectName: string): boolean {
  let tempFile: string | null = null

  try {
    const tempDir = mkdtempSync(join(tmpdir(), 'cf-secrets-'))
    tempFile = join(tempDir, `${key}.txt`)
    writeFileSync(tempFile, value, 'utf-8')

    execSync(`wrangler versions secret put ${key} --name ${projectName} < ${tempFile}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
      shell: '/bin/bash',
    })

    return true
  } catch (err) {
    log(`  Failed to upload ${key}: ${err instanceof Error ? err.message : String(err)}`, 'red')
    return false
  } finally {
    if (tempFile && existsSync(tempFile)) {
      try { unlinkSync(tempFile) } catch {}
    }
  }
}

async function main() {
  log('\n🚀 Cloudflare Secrets Upload Script\n', 'cyan')

  const envFileArg = process.argv.indexOf('--env-file')
  const envFileName = envFileArg !== -1 && process.argv[envFileArg + 1]
    ? process.argv[envFileArg + 1]
    : '.env'

  const envPath = resolve(process.cwd(), envFileName)
  const cloudflareEnvPath = resolve(process.cwd(), '.env.cloudflare.local')

  if (!existsSync(envPath)) {
    log(`❌ ${envFileName} file not found`, 'red')
    process.exit(1)
  }

  if (!existsSync(cloudflareEnvPath)) {
    log('❌ .env.cloudflare.local file not found', 'red')
    process.exit(1)
  }

  const cloudflareEnv = parseEnvFile(cloudflareEnvPath)

  if (!cloudflareEnv.CLOUDFLARE_API_KEY || !cloudflareEnv.CLOUDFLARE_EMAIL) {
    log('❌ CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL must be set in .env.cloudflare.local', 'red')
    process.exit(1)
  }

  process.env.CLOUDFLARE_API_KEY = cloudflareEnv.CLOUDFLARE_API_KEY
  process.env.CLOUDFLARE_EMAIL = cloudflareEnv.CLOUDFLARE_EMAIL
  if (cloudflareEnv.CLOUDFLARE_ACCOUNT_ID) {
    process.env.CLOUDFLARE_ACCOUNT_ID = cloudflareEnv.CLOUDFLARE_ACCOUNT_ID
  }

  // Get project name from wrangler.toml
  let projectName = 'cloudcut-media'
  try {
    const wranglerConfig = readFileSync(resolve(process.cwd(), 'wrangler.toml'), 'utf-8')
    const nameMatch = wranglerConfig.match(/name\s*=\s*"([^"]+)"/)
    if (nameMatch) projectName = nameMatch[1]
  } catch {}

  log(`Project: ${projectName}`, 'blue')
  log(`Cloudflare Email: ${cloudflareEnv.CLOUDFLARE_EMAIL}\n`, 'blue')

  const secrets = parseEnvFile(envPath)
  const secretKeys = Object.keys(secrets).filter(key => !key.startsWith('VITE_'))

  if (secretKeys.length === 0) {
    log('No secrets found to upload (excluding VITE_ variables)', 'yellow')
    process.exit(0)
  }

  log(`Found ${secretKeys.length} secrets to upload:\n`, 'blue')
  secretKeys.forEach(key => {
    const preview = secrets[key].length > 50
      ? `${secrets[key].substring(0, 50)}...`
      : secrets[key]
    log(`  - ${key}: ${preview}`, 'yellow')
  })

  log('\n⚠️  This will overwrite existing secrets. Press Ctrl+C to cancel, waiting 5s...\n', 'yellow')
  await new Promise(resolve => setTimeout(resolve, 5000))

  let successCount = 0
  let failCount = 0

  for (const key of secretKeys) {
    process.stdout.write(`Uploading ${key}... `)
    if (uploadSecret(key, secrets[key], projectName)) {
      log('✅', 'green')
      successCount++
    } else {
      log('❌', 'red')
      failCount++
    }
  }

  log(`\nDone: ${successCount} succeeded, ${failCount} failed\n`, 'cyan')
  if (failCount > 0) process.exit(1)
}

main().catch(err => {
  log(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`, 'red')
  process.exit(1)
})
