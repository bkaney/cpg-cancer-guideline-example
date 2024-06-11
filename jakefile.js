const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const generatedResourcePath = path.join(__dirname, 'fsh-generated', 'resources')
const resourcePath = path.join(__dirname, 'input', 'resources')
const cqlSourcePath = path.join(__dirname, 'input', 'cql')
const testDir = path.resolve(path.join(__dirname, 'input', 'tests'))
const valueSetDir = path.resolve(
  path.join(__dirname, 'input', 'vocabulary', 'valueset')
)
const codeSystemDir = path.resolve(
  path.join(__dirname, 'input', 'vocabulary', 'codesystem')
)

desc('(default task) runs build:publish and simplifier')
task('default', ['build:publish' ], () => {})

namespace('build', () => {
  desc('Run sushi')
  task('sushi', ['test:clear'], () => run('sushi .'))

  desc('Run IG Publisher')
  task('publish', ['test:clear'], () => run('./_genonce.sh'))
})

namespace('test', () => {
  desc('Clean test -related directories')
  task('clear', () => {
    console.log("Clearing out tests...")
    run(
      `rm -rf ${testDir} && rm -rf ${valueSetDir} && rm -rf ${codeSystemDir} ` +
        `&& mkdir -p ${valueSetDir} && mkdir -p ${codeSystemDir}`
    )
  })

  // If there is a patient in the bundle, and the bundle has a meta.tag 'test'
  desc('Prepare for VSCode plugin, see README.md')
  task('prepare', ['test:clear', 'build:sushi'], () => {
    // Vocabulary
    // const valueSets = generatedResourcesByResourceType('ValueSet')
    // Object.keys(valueSets).forEach((file) => {
    //   run(
    //     `cp -f ${path.join(generatedResourcePath, file)} ${(valueSetDir, file)}`
    //   )
    // })
    run(
      `cp -f ${resourcePath}/ValueSet* ${valueSetDir} 2>&1 >/dev/null || true`
    )
    run(
      `cp -f ${generatedResourcePath}/ValueSet* ${valueSetDir} 2>&1 >/dev/null || true`
    )

    // const codeSystems = generatedResourcesByResourceType('CodeSystem')
    // Object.keys(codeSystems).forEach((file) => {
    //   run(
    //     `echo cp -f ${path.join(generatedResourcePath, file)} ${path.join(
    //       codeSystemDir,
    //       file
    //     )}`
    //   )
    // })
    run(
      `cp -f ${resourcePath}/CodeSystem* ${codeSystemDir} 2>&1 >/dev/null || true`
    )
    run(
      `cp -f ${generatedResourcePath}/CodeSystem* ${codeSystemDir} 2>&1 >/dev/null || true`
    )

    // Tests
    fs.readdirSync(cqlSourcePath)
      .filter((f) => f.endsWith('.cql'))
      .forEach((file) => {
        const content = fs.readFileSync(path.join(cqlSourcePath, file), {
          encoding: 'utf-8',
        })
        const libraryName = content.match(/library ([^\s]*)/)?.[1]
        if (libraryName != null) {
          const testCases = generatedResourcesByResourceType('Bundle')
          Object.keys(testCases).forEach((file) => {
            const bundle = testCases[file]
            const patient = bundle?.entry
              ?.map((e) => e.resource)
              ?.find((r) => r.resourceType === 'Patient')
            if (
              bundle.meta?.tag?.map((t) => t.code)?.includes('test') &&
              patient != null
            ) {
              const useCaseDir = path.join(testDir, libraryName, patient.id)
              run(
                `mkdir -p ${useCaseDir} && cp ${path.join(
                  generatedResourcePath,
                  file
                )} ${useCaseDir}`
              )
            }
          })
        }
      })
  })
})

/**
 * Run a command in sync
 */
const run = (command) => {
  child_process.execSync(command, { cwd: __dirname, stdio: 'inherit' })
}

/**
 * Returns a dict of filename: resource matching specified resourceType
 */
const generatedResourcesByResourceType = (resourceType) => {
  const generatedFiles = fs.readdirSync(generatedResourcePath)
  return generatedFiles.reduce((acc, file) => {
    if (path.extname(file) == '.json') {
      const resource = JSON.parse(
        fs
          .readFileSync(path.join(generatedResourcePath, file), {
            encoding: 'utf-8',
          })
          .toString()
      )
      if (resource.resourceType === resourceType) {
        acc[file] = resource
      }
    }
    return acc
  }, {})
}
