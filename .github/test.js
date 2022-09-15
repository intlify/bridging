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

function eval(snippet, { inherit = false, esm = false, testDir }) {
  const options = { cwd: testDir }
  if (inherit) {
    options.stdio = 'inherit'
  }
  const ret = execSync(`node --input-type=${esm ? 'module' : 'commonjs'} -e "${snippet}"`, options)
  return ret != null ? ret.toString().trim() : 'null'
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
// eval(`console.log(require('@intlify/${pkg}'))`, { testDir, inherit: true })

let failed = false

// check flag
;(function checkFlags() {
  if (pkg === 'vue-i18n-bridge') {
    if (isCjs && !mod.includes(`${vueVersion.startsWith('2') ? 'VueI18n' : 'VueI18nLegacy'}.isVueI18n8 = ${isVue2}`)) {
      console.log('CJS:', mod)
      failed = true
    }

    if (!isCjs && !/export\s*\{\s*isVueI18n8,\s*isVueI18n9/gm.test(mod)) {
      console.log('ESM:', mod)
      failed = true
    }
  } else {
    // for vue-router-bridge
    if (
      isCjs &&
      !mod.includes(`${vueVersion.startsWith('2') ? 'VueRouter' : 'VueRouterLegacy'}.isVueRouter3 = ${isVue2}`)
    ) {
      console.log('CJS:', mod)
      failed = true
    }

    if (!isCjs && !/isVueRouter3/gm.test(mod) && !/isVueRouter4/gm.test(mod)) {
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
  let result = ''
  if (pkg === 'vue-i18n-bridge') {
    if (type === 'commonjs') {
      if (vueVersion !== '3') {
        // default export
        snippetCjs = `const Vue = require('vue');
const VueI18n = require('@intlify/vue-i18n-bridge');
Vue.use(VueI18n);
const i18n = new VueI18n({ locale: 'ja' });
console.log(i18n.locale);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `ja`) {
          console.log(`default export (cjs): ${result} !== ja`)
          failed = true
        }

        // createI18n
        snippetCjs = `const Vue = require('vue');
const VueI18n = require('@intlify/vue-i18n-bridge')
const { createI18n } = require('@intlify/vue-i18n-bridge');
Vue.use(VueI18n);
const i18n = createI18n({ locale: 'fr' }, VueI18n);
console.log(i18n.global.locale.value);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `fr`) {
          console.log(`createI18n (cjs): ${result} !== fr`)
          failed = true
        }
      } else {
        // for vue 3
        // default export
        snippetCjs = `const VueI18n = require('@intlify/vue-i18n-bridge');
const i18n = new VueI18n({ locale: 'ja' });
console.log(i18n.locale);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `undefined`) {
          console.log(`default export (cjs): ${result} !== undefined`)
          failed = true
        }

        // createI18n
        snippetCjs = `const { createI18n } = require('@intlify/vue-i18n-bridge');
const i18n = createI18n({ legacy: false, locale: 'fr' });
console.log(i18n.global.locale.value);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `fr`) {
          console.log(`createI18n (cjs): ${result} !== fr`)
          failed = true
        }
      }
    } else {
      // for esm
      if (vueVersion !== '3') {
        // default export
        snippetEsm = `import Vue from 'vue';
import VueI18n from '@intlify/vue-i18n-bridge';
Vue.use(VueI18n);
const i18n = new VueI18n({ locale: 'ja' });
console.log(i18n.locale);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `ja`) {
          console.log(`default export (esm): ${result} !== ja`)
          failed = true
        }

        // createI18n
        snippetEsm = `import Vue from 'vue';
import VueI18n from '@intlify/vue-i18n-bridge';
import { createI18n } from '@intlify/vue-i18n-bridge';
Vue.use(VueI18n);
const i18n = createI18n({ locale: 'ja' }, VueI18n);
console.log(i18n.global.locale.value);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `ja`) {
          console.log(`createI18n (esm): ${result} !== ja`)
          failed = true
        }
      } else {
        // for vue3
        // default export
        snippetEsm = `import VueI18n from '@intlify/vue-i18n-bridge';
const i18n = new VueI18n({ locale: 'ja' });
console.log(!!i18n);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `true`) {
          console.log(`default export (esm): ${result} !== true`)
          failed = true
        }

        // createI18n
        snippetEsm = `import { createI18n } from '@intlify/vue-i18n-bridge';
const i18n = createI18n({ legacy: false, locale: 'ja' });
console.log(i18n.global.locale.value);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `ja`) {
          console.log(`createI18n (esm): ${result} !== ja`)
          failed = true
        }
      }
    }
  } else {
    // for vue-router-bridge
    if (type === 'commonjs') {
      if (vueVersion !== '3') {
        // default export
        snippetCjs = `const Vue = require('vue');
const VueRouter = require('@intlify/vue-router-bridge');
Vue.use(VueRouter);
const router = new VueRouter();
console.log(router.mode);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `abstract`) {
          console.log(`default export (cjs): ${result} !== abstract`)
          failed = true
        }

        // createRouter
        snippetCjs = `const Vue = require('vue');
const VueRouter = require('@intlify/vue-router-bridge');
Vue.use(VueRouter);
const { createRouter, createMemoryHistory } = require('@intlify/vue-router-bridge');
const router = createRouter({
  routes: [],
  history: createMemoryHistory()
})
console.log(!!router);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `true`) {
          console.log(`createRouter (cjs): ${result} !== true`)
          failed = true
        }
      } else {
        // for vue 3
        // default export
        snippetCjs = `const VueRouter = require('@intlify/vue-router-bridge');
const router = new VueRouter();
console.log(!!router);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `true`) {
          console.log(`default export (cjs): ${result} !== true`)
          failed = true
        }

        // createRouter
        snippetCjs = `
const { createRouter, createMemoryHistory } = require('@intlify/vue-router-bridge');
const router = createRouter({
  routes: [],
  history: createMemoryHistory()
})
console.log(!!router.currentRoute);
`
        result = eval(snippetCjs, { testDir })
        if (result !== `true`) {
          console.log(`createRouter (cjs): ${result} !== true`)
          failed = true
        }
      }
    } else {
      // for esm
      if (vueVersion !== '3') {
        // default export
        snippetEsm = `import Vue from 'vue';
import VueRouter from '@intlify/vue-router-bridge'
Vue.use(VueRouter);
const router = new VueRouter()
console.log(router.mode);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `abstract`) {
          console.log(`default export (esm): ${result} !== abstract`)
          failed = true
        }

        // createRouter
        snippetEsm = `import Vue from 'vue';
import VueRouter from '@intlify/vue-router-bridge'
import { createRouter, createMemoryHistory } from '@intlify/vue-router-bridge'
Vue.use(VueRouter);
const router = createRouter({
  routes: [],
  history: createMemoryHistory()
})
console.log(!!router.currentRoute);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `true`) {
          console.log(`createRouter (esm): ${result} !== true`)
          failed = true
        }
      } else {
        // for vue3
        // default export
        snippetEsm = `import VueRouter from '@intlify/vue-router-bridge'
const router = new VueRouter();
console.log(!!router);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `true`) {
          console.log(`default export (esm): ${result} !== true`)
          failed = true
        }

        // createRouter
        snippetEsm = `import { createRouter, createMemoryHistory } from '@intlify/vue-router-bridge'
const router = createRouter({
  routes: [],
  history: createMemoryHistory()
})
console.log(!!router.currentRoute);
`
        result = eval(snippetEsm, { esm: true, testDir })
        if (result !== `true`) {
          console.log(`createRouter (esm): ${result} !== true`)
          failed = true
        }
      }
    }
  }
})()

if (failed) {
  setTimeout(() => {
    process.exit(1)
  }, 0)
}
