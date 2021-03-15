const chalk = require('chalk')

const noop = (message) => {
  console.log(message)
}

const log = (fn) => {
  return (...args) => {
    console.log(fn(args[0]), ...Array.prototype.slice.call(args, 1))
  }
}

module.exports = {
  success: log(chalk.green),
  error: log(chalk.red),
  warn: log(chalk.yellow),
  info: log(chalk.cyan),
  log: log(noop),
}
