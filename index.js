const OSS = require('ali-oss')
const slash = require('slash')
const globby = require('globby')
const chalk = require('chalk')
const path = require('path')
const log = require('./lib/log')

class AliOssPlugin {
  constructor(options) {
    this.options = Object.assign(
      {
        debug: false,
        ossPath: '',
        patterns: '',
        verbose: true,
        timeout: 60 * 100,
        overwrite: true,
        bucket: 'oss-cn-hangzhou',
      },
      options
    )

    const { region, accessKeyId, accessKeySecret, bucket } = options

    // init oss
    this.store = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
    })

    this.filesIgnored = []
  }

  apply(compiler) {
    // asset to output dir
    compiler.hooks.afterEmit.tapPromise('AliOssPlugin', async (compilation) => {
      const optionsError = this.checkOptions()
      if (optionsError) {
        compilation.errors.push(new Error(optionsError))
        return Promise.resolve()
      }

      const outputPath = path.resolve(slash(compiler.options.output.path))

      const { verbose, patterns } = this.options

      // all files
      const fromPatterns = patterns || [outputPath + '/**']

      let filepaths = await globby(fromPatterns)

      filepaths = filepaths.map((file) => path.resolve(file))

      if (filepaths.length) {
        return this.upload(filepaths, outputPath)
      } else {
        verbose && log.error('There is no files need to upload to oss')
        return Promise.resolve()
      }
    })
  }

  async upload(filepaths, outputPath) {
    const { debug, ossPath, timeout, verbose, overwrite } = this.options

    try {
      for (let filepath of filepaths) {
        const uploadPath = slash(
          path.join(ossPath, filepath.split(outputPath)[1] || '')
        )

        const fileExists = await this.fileExists(uploadPath)
        if (fileExists && !overwrite) {
          this.filesIgnored.push(filepath)
          continue
        }

        if (debug) {
          console.log(
            chalk.blue(filepath) +
              ' is ready to upload to ' +
              chalk.green(uploadPath)
          )
          continue
        }

        const result = await this.store.put(uploadPath, filepath, {
          timeout,
          headers: overwrite ? {} : { 'x-oss-forbid-overwrite': true },
        })

        verbose &&
          console.log(
            chalk.blue(filepath),
            'upload to ',
            chalk.blue(uploadPath),
            'success, cdn url => ',
            chalk.green(result.url)
          )
      }
    } catch (e) {
      log.error('Failed to upload to ali oss, ' + e)
    }

    // if has files ignored due to x-oss-forbid-overwrite
    verbose &&
      this.filesIgnored.length &&
      log.warn('ignored files:', this.filesIgnored)
  }

  fileExists(filepath) {
    return this.store
      .get(filepath)
      .then((result) => {
        return result.res.status === 200
      })
      .catch((e) => {
        if (e.name === 'NoSuchKeyError') {
          return false
        }
      })
  }

  checkOptions() {
    const { region, accessKeyId, accessKeySecret, bucket } = this.options
    let errStr = ''
    if (!region) {
      errStr += '\nregion is not specified'
    }
    if (!accessKeyId) {
      errStr += '\naccessKeyId is not specified'
    }
    if (!accessKeySecret) {
      errStr += '\naccessKeySecret is not specified'
    }
    if (!bucket) {
      errStr += '\nbucket is not specified'
    }

    return errStr
  }
}

module.exports = AliOssPlugin
