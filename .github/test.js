const fs = require('fs')
const { join, resolve } = require('path')
const { execSync } = require('child_process')

const [agent, pkg, vueVersion, type = 'commonjs'] = process.argv.slice(2)

function getPkgVersion(target) {
  let version = ''
  try {
    const pkgMetaPath = resolve(target, 'package.json')
    console.log('pkgMetaPath', pkgMetaPath)
    version = JSON.parse(fs.readFileSync(pkgMetaPath, 'utf-8')).version
  } catch (e) {
    throw e
  }
  return version
}

function getRootAndDir(pkg, type) {
  const target = resolve(__dirname, `../packages/${pkg}`)
  const test = resolve(target, `../../../${pkg}-test-${type}`)
  console.log(`target: ${target}`)
  console.log(`test: ${test}`)
  return [target, test]
}

function pack(params) {
  const { pkg, versions, dir } = params

  execSync('npm pack', { cwd: dir.target, stdio: 'inherit' })
  return join(dir.target, `intlify-${pkg}-${versions.target}.tgz`)
}

function installDeps(params) {
  const { agent, dir, packageDeps } = params

  const tarball = pack(params)

  let installCmd = agent.startsWith('yarn') ? `yarn add` : `${agent} i`
  console.log('install deps', packageDeps)
  execSync(`${installCmd} ${packageDeps}`, { cwd: dir.test, stdio: 'inherit' })
  console.log('install tarball', tarball)
  // prettier-ignore
  execSync(`${installCmd} ${agent.startsWith('yarn')
    ? agent !== 'yarn@berry'
      ? `file:${tarball}`
      : tarball
    : tarball}${agent !== 'yarn@berry' ? ' --force' : ''}`, {
    cwd: dir.test,
    stdio: 'inherit'
  })
  // debug
  if (agent === 'yarn@berry') {
    execSync(`find .`, { cwd: dir.test, stdio: 'inherit' })
  }
}

function prepareTestPackage(params) {
  const { agent, type, pkg, dir, versions } = params

  if (fs.existsSync(dir.test)) {
    fs.rmSync(dir.test, { recursive: true })
  }

  fs.mkdirSync(dir.test)
  fs.writeFileSync(
    join(dir.test, 'package.json'),
    JSON.stringify({
      name: `${pkg}-test-${type}`,
      version: versions.target,
      type,
      // for yarn v3
      installConfig: {
        hoistingLimits: 'workspaces'
      }
    }),
    'utf-8'
  )
  if (agent === 'yarn@berry') {
    // TODO: support for yarn berry and v3
    // disable pnp
    execSync(`touch yarn.lock`, { cwd: dir.test, stdio: 'inherit' })
    const yarnVersion = execSync(`yarn -v`).toString().trim()
    console.log('yarn vertion', yarnVersion)
    execSync(`touch .yarnrc.yml`, { cwd: dir.test, stdio: 'inherit' })
    // prettier-ignore
    fs.writeFileSync(
      join(dir.test, '.yarnrc.yml'), `yarnPath: .yarn/releases/yarn-${yarnVersion}.cjs
nodeLinker: node-modules`,
      'utf-8'
    )
    execSync(`yarn set version ${yarnVersion}`, { cwd: dir.test, stdio: 'inherit' })
    execSync(`yarn install`, { cwd: dir.test, stdio: 'inherit' })
    execSync(`find .`, { cwd: dir.test, stdio: 'inherit' })
  } else if (agent === 'pnpm') {
    // for `postinstall` script
    fs.writeFileSync(join(dir.test, '.npmrc'), `side-effects-cache=false`, 'utf-8')
  }

  installDeps(params)
}

function getModule(testDir, pkg, index) {
  const mod = fs.readFileSync(resolve(testDir, `node_modules/@intlify/${pkg}/lib/${index}`), 'utf-8')
  // TODO: remove
  console.log('mod', mod)
  return mod
}

function getPackageDeps(pkg, isVue2, isVue27) {
  if (pkg === 'vue-i18n-bridge') {
    // prettier-ignore
    return isVue27
      ? 'vue@2.7 vue-i18n@8 vue-i18n-bridge@9'
      : isVue2
        ? `vue@2.6 @vue/composition-api vue-i18n@8 vue-i18n-bridge@9`
        : 'vue@3 vue-i18n@9'
  } else {
    // for vue-router-bridge
    // prettier-ignore
    return isVue27
      ? 'vue@2.7 vue-router@3.6'
      : isVue2
        ? `vue@2.6 @vue/composition-api vue-router@3`
        : 'vue@3 vue-router@4'
  }
}

function eval(snippet, { inherit = false, testDir }) {
  const options = { cwd: testDir }
  if (inherit) {
    options.stdio = 'inherit'
  }
  return execSync(`node -e "${snippet}"`, options).toString().trim()
}

const [targetDir, testDir] = getRootAndDir(pkg, type)
const isVue2 = vueVersion.startsWith('2')
const isVue27 = vueVersion.startsWith('2.7')
const isCjs = type === 'commonjs'

const params = {
  agent,
  type,
  pkg,
  versions: {
    vue: vueVersion,
    target: getPkgVersion(targetDir)
  },
  dir: {
    target: targetDir,
    test: testDir
  },
  packageDeps: getPackageDeps(pkg, isVue2, isVue27)
}

prepareTestPackage(params)

const indexFile = isCjs ? 'index.cjs' : 'index.mjs'
const mod = getModule(testDir, pkg, indexFile)
// TODO: remove
eval(`console.log(require('@intlify/${pkg}'))`, { testDir, inherit: true })

let failed = false

// check flag
;(function checkFlags() {
  if (pkg === 'vue-i18n-bridge') {
    if (isCjs && !mod.includes(`exports.isVueI18n8 = ${isVue2}`)) {
      console.log('CJS:', mod)
      failed = true
    }

    if (!isCjs && !/export\s*\{\s*isVueI18n8,\s*isVueI18n9/gm.test(mod)) {
      console.log('ESM:', mod)
      failed = true
    }
  } else {
    // for vue-router-bridge
    if (isCjs && !mod.includes(`exports.isVueRouter3 = ${isVue2}`)) {
      console.log('CJS:', mod)
      failed = true
    }

    if (!isCjs && !mod.includes(`export default VueRouter`)) {
      console.log('ESM:', mod)
      failed = true
    }
  }
})()

// check version
;(function checkVersion() {
  if (pkg === 'vue-i18n-bridge') {
    const outputVersion = eval(`console.log(require('@intlify/vue-i18n-bridge').version)`, {
      testDir
    })
    console.log('version: ' + outputVersion)

    // isVueI18n8
    const is8 = eval(`console.log(require('@intlify/vue-i18n-bridge').isVueI18n8)`, { testDir })

    if (is8 !== `${isVue2}`) {
      console.log(`isVueI18n8: ${is8} !== ${isVue2}`)
      eval(`console.log(require('@intlify/vue-i18n-bridge'))`, { testDir, inherit: true })
      failed = true
    }
  } else {
    // for vue-router-bridge
    // isVueRouter3
    const is3 = eval(`console.log(require('@intlify/vue-router-bridge').isVueRouter3)`, { testDir })

    if (is3 !== `${isVue2}`) {
      console.log(`isVueRouter3: ${is3} !== ${isVue2}`)
      eval(`console.log(require('@intlify/vue-router-bridge'))`, { testDir, inherit: true })
      failed = true
    }
  }
})()

// check exporting
;(function checkExporting() {
  let snippetCjs = ''
  let snippetEsm = ''
  if (pkg === 'vue-i18n-bridge') {
    // default export
    snippetCjs = `const VueI18n = require('@intlify/vue-i18n-bridge'); console.log(!!VueI18n);`
    let ret = eval(snippetCjs, { testDir })
    if (ret !== `true`) {
      console.log(`default export (cjs): ${result} !== true`)
      failed = true
    }
    snippetEsm = `import VueI18n from '@intlify/vue-i18n-bridge'; console.log(!!VueI18n);`
    ret = eval(snippetEsm, { testDir })
    if (ret !== `true`) {
      console.log(`default export (esm): ${result} !== true`)
      failed = true
    }

    // createI18n
    snippetCjs = `const { createI18n } = require('@intlify/vue-i18n-bridge'); console.log(!!creteaI18n);`
    ret = eval(snippetCjs, { testDir })
    if (ret !== `true`) {
      console.log(`createI18n (cjs): ${result} !== true`)
      failed = true
    }
    snippetEsm = `import { createI18n } from '@intlify/vue-i18n-bridge'; console.log(!!createI18n);`
    ret = eval(snippetEsm, { testDir })
    if (ret !== `true`) {
      console.log(`createI18n (esm): ${result} !== true`)
      failed = true
    }
  } else {
    // for vue-router-bridge
    // TODO:
  }
})()

if (failed) {
  setTimeout(() => {
    process.exit(1)
  }, 0)
}
