import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..', '..')
const source = resolve(root, 'taskist', 'public', 'frontend', 'index.html')
const target = resolve(root, 'taskist', 'www', 'taskist.html')

mkdirSync(dirname(target), { recursive: true })
copyFileSync(source, target)
