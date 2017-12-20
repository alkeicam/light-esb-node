var debug = require('debug');

/**
 * Writes messages to stdout.
 * Log messages are suppressed by default, but can be enabled by setting the DEBUG variable.
 *
 * @param   {string}    message  - The error message.  May include format strings (%s, %d, %j)
 * @param   {...*}      [params] - One or more params to be passed to {@link util#format}
 * @type {function}
 */
exports.debug = debug('esb:core');
exports.debugComponent = debug('esb:component');
exports.debugMessage = debug('esb:messages');
exports.debugCall = debug('esb:calls');
