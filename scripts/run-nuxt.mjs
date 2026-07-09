import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const command = process.argv[2]

if (!command) {
    console.error('Missing Nuxt command. Use: dev or preview.')
    process.exit(1)
}

const cwd = resolve(import.meta.dirname, '..')
const envPath = resolve(cwd, '.env')

const loadDotEnv = (filePath) => {
    try {
        const content = readFileSync(filePath, 'utf8')

        for (const rawLine of content.split(/\r?\n/)) {
            const line = rawLine.trim()

            if (!line || line.startsWith('#')) {
                continue
            }

            const separatorIndex = line.indexOf('=')

            if (separatorIndex === -1) {
                continue
            }

            const key = line.slice(0, separatorIndex).trim()
            let value = line.slice(separatorIndex + 1).trim()

            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }

            if (!(key in process.env)) {
                process.env[key] = value
            }
        }
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            return
        }

        throw error
    }
}

loadDotEnv(envPath)

const host = process.env.FRONTEND_HOST || '0.0.0.0'
const port = process.env.FRONTEND_PORT || '15007'
const forwardedArgs = process.argv.slice(3)
const cliPath = resolve(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'nuxt.cmd' : 'nuxt')

const child = spawn(
    cliPath,
    [command, ...forwardedArgs],
    {
        cwd,
        env: {
            ...process.env,
            FRONTEND_HOST: host,
            FRONTEND_PORT: port,
            HOST: host,
            PORT: port,
            NUXT_HOST: host,
            NUXT_PORT: port,
            NITRO_HOST: host,
            NITRO_PORT: port,
        },
        stdio: 'inherit',
    },
)

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal)
        return
    }

    process.exit(code ?? 0)
})

child.on('error', (error) => {
    console.error(error)
    process.exit(1)
})
