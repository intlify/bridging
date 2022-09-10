const fs = require('fs')
const { join, resolve } = require('path')
const { execSync } = require('child_process')

const [agent, pkg, vueVersion, type = 'commonjs'] = process.argv.slice(2)

function getPkgVersion(pkg) {
  let version = ''
  try {
    version = require(`../packages/${pkg}/package.json`).version
  } catch (e) {
    throw e
  }
  return version
}

function getRootAndDir(pkg, type) {
  const target = resolve(__dirname, `../packages/${pkg}`)
  const test = resolve(target, `../../${pkg}-test-${type}`)
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

  let installCmd = agent === 'yarn' ? `${agent} add` : `${agent} i`
  execSync(`${installCmd} ${packageDeps}`, { cwd: dir.test, stdio: 'inherit' })
  execSync(`${installCmd} ${agent === 'yarn' ? `file:${tarball}` : tarball} --force`, {
    cwd: dir.test,
    stdio: 'inherit'
  })
}

function prepareTestPackage(params) {
  const { type, pkg, dir, versions } = params

  if (fs.existsSync(dir.test)) {
    fs.rmSync(dir.test, { recursive: true })
  }

  fs.mkdirSync(dir.test)
  fs.writeFileSync(
    join(dir.test, 'package.json'),
    JSON.stringify({
      name: `${pkg}-test-${type}`,
      version: versions.target,
      type
    }),
    'utf-8'
  )

  installDeps(params)
}

function getModule(testDir, pkg, index) {
  const mod = fs.readFileSync(resolve(testDir, `node_modules/@intlify/${pkg}/lib/${index}`), 'utf-8')
  console.log('mod', mod)
  return mod
}

function getTest(pkg) {
  try {
    const target = resolve(__dirname, `./test/${pkg}.js`)
    console.log('target test module', target)
    return require(target)
  } catch (e) {
    throw e
  }
}

const testMod = getTest(pkg)
console.log('testMod', testMod)
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
    target: getPkgVersion(pkg)
  },
  dir: {
    target: targetDir,
    test: testDir
  },
  packageDeps: testMod.getPackageDeps(isVue2, isVue27)
}

prepareTestPackage(params)

const indexFile = isCjs ? 'index.cjs' : 'index.mjs'
const mod = getModule(testDir, pkg, indexFile)

let failed = testMod.test()

if (failed) {
  setTimeout(() => {
    process.exit(1)
  }, 0)
}
