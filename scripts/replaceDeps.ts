import { promises as fs, constants as FS_CONSTANTS } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPackageJSON, writePackageJSON } from 'pkg-types'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const TGZ_MAP = new Map<string, string>()
const PKG_MAP = {
  'vue-i18n-v8-vue2': 'vue-i18n-bridge',
  'vue-i18n-v9-vue3': 'vue-i18n-bridge',
  'vue-router-v3-vue2': 'vue-router-bridge',
  'vue-router-v36-vue2': 'vue-router-bridge',
  'vue-router-v4-vue3': 'vue-router-bridge'
} as Record<string, string>

export async function isExists(path: string) {
  try {
    await fs.access(path, FS_CONSTANTS.F_OK)
    return true
  } catch {
    return false
  }
}

async function main() {
  const packagesPath = resolve(__dirname, '../packages')
  for (const pkg of await fs.readdir(packagesPath)) {
    const pkgJson = await readPackageJSON(resolve(packagesPath, pkg, 'package.json'))
    const tgzPath = resolve(packagesPath, pkg, `intlify-${pkg}-${pkgJson.version}.tgz`)
    if (await isExists(tgzPath)) {
      TGZ_MAP.set(pkg, tgzPath)
    }
  }
  const examplesPath = resolve(__dirname, '../examples')
  const projectPkgJson = await readPackageJSON(resolve(__dirname, 'package.json'))
  for (const ex of await fs.readdir(examplesPath)) {
    const examplePath = resolve(examplesPath, ex, 'package.json')
    const pkgJson = await readPackageJSON(examplePath)
    const pkg = PKG_MAP[ex]
    const tgzPath = TGZ_MAP.get(pkg)

    if (pkgJson.dependencies) {
      if (tgzPath) {
        pkgJson.dependencies[`@intlify/${pkg}`] = `file:${tgzPath}`
      }

      if (projectPkgJson && projectPkgJson.devDependencies?.playwright) {
        pkgJson.devDependencies['playwright'] = projectPkgJson.devDependencies.playwright
      }
      await writePackageJSON(examplePath, pkgJson)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
