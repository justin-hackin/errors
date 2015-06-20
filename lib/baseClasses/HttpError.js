'use strict';

var util    = require('util');

var WError  = require('verror').WError;

var helpers = require('./../helpers');

/**
 * Base HttpError class. inherits from WError.
 * Variadic signature, first two are special to Restify, using a options obj.
 * 1) new HttpError(anotherErr, {...});
 * 2) new HttpError({...});
 * Last one is a straight pass through to WError
 * 3) new HttpError('my special error message');
 * @public
 * @class
 */
function HttpError() {

    var self = this;

    // normalize the signatures
    var parsed = helpers.parseVariadicArgs(arguments, true);
    var options = parsed.options;
    var args = parsed.args;

    // inherit from WError, call super first before doing anything else!
    WError.apply(self, args);

    /**
     * the error message.
     * when message isn't passed in with options, expect WError constructor
     * to fill in the message for us with the passed through args,
     * usually via sprintf or just straight strings.
     * @property
     * @type     {String}
     */
    self.message = (options.message || self.message) || '';

    /**
     * the http status code of the error.
     * because inherited classes have status code set on the prototype,
     * only assign a status code if truthy.
     * @property
     * @type     {Number}
     */
    if (options.statusCode) {
        self.statusCode = options.statusCode;
    }

    /**
     * an object used to render the error when passed
     * to res.send()
     * @property
     * @type     {Object}
     */
    self.body = {
        // this is a bit unintuitive, but code actually refers to the name
        // of the error, and not the http statusCode.
        code: self.name,
        message: self.message || ''
    };

    // capture the stack trace because that doesn't happen automatically.
    // the second parameter into captureStackTrace() is used to filter out
    // parts of the stack trace that aren't relevant to the users.
    // i.e., the error constructors shouldn't show up in the stack trace.
    Error.captureStackTrace(self, options.constructorOpt || self.constructor);
}
util.inherits(HttpError, WError);

/**
 * assign non-standard display name property on the CONSTRUCTOR (not prototype),
 * which is supported by all VMs. useful for stack trace output.
 * @type {String}
 */
HttpError.displayName = 'HttpError';

/**
 * the name of the error, used in the stack trace output
 * @type {String}
 */
HttpError.prototype.name = 'HttpError';


module.exports = HttpError;
