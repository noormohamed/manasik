"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = void 0;
const logging_1 = require("./analytics/logging");
class errors extends Error {
    /**
     * Creates a new error instance with a custom HTTP status code and message.
     *
     * @param status - HTTP status code (e.g. 400, 401).
     * @param message - Error message to describe the problem.
     * @returns An Error object with an added `statusCode` property.
     */
    static manage(status, message, info) {
        return __awaiter(this, void 0, void 0, function* () {
            let err = new Error(message);
            err.statusCode = status;
            // Extract calling method name from the stack trace
            const stackLines = (new Error().stack || '').split('\n');
            const callerLine = stackLines[2] || '';
            const match = callerLine.match(/at (\w+)/);
            const callerName = match ? match[1] : 'unknown';
            if (status) {
                err.statusCode = status;
            }
            if (info) {
                err.info = JSON.parse(info);
            }
            yield (0, logging_1.logging)({
                statusCode: err.statusCode,
                info: err.statusCode,
                message: err.message,
                source: callerName
            });
            return err;
        });
    }
    /**
     * Throws an HTTP 401 error for invalid signatures.
     *
     * @param expects - A description of the expected signature format or value.
     * @throws Error with statusCode 401 and a message about the invalid signature.
     */
    static InvalidSignature(expects) {
        throw errors.manage(401, 'Invalid signature - ' + expects);
    }
    /**
     * Throws an HTTP 401 error when a required `x-signature` header is missing.
     *
     * @throws Error with statusCode 401 and a message about the missing signature.
     */
    static MissingSignature() {
        throw errors.manage(401, 'Missing Signature x-signature is required');
    }
    /**
     * Throws an HTTP 400 error when a chat message is required but missing.
     *
     * @throws Error with statusCode 400 and a message indicating the message is required.
     */
    static MessageIsRequired() {
        throw errors.manage(400, 'Chat Message is required');
    }
    /**
     * Throws an HTTP 400 error for invalid request inputs.
     *
     * @param v - Validation errors or input data that caused the failure.
     * @throws Error with statusCode 400 and a message detailing the validation issue.
     */
    static InvalidRequest(v) {
        throw errors.manage(400, 'Invalid Request', JSON.stringify(v));
    }
    static jwdManager(error) {
        switch (error.message) {
            case 'jwt malformed':
                throw errors.manage(401, 'Invalid Request', JSON.stringify({ message: 'Malformed JWT Token' }));
                break;
            case 'Token IP mismatch':
                throw errors.manage(401, 'Invalid Request', JSON.stringify({ message: 'Token IP mismatch' }));
                break;
            case 'Missing x-signature header':
                throw errors.manage(401, 'Invalid Request', JSON.stringify({ message: 'Missing x-signature header' }));
                break;
        }
    }
    static UnableToCreateAccount(payload) {
        throw errors.manage(400, 'Unable to create account', JSON.stringify(payload));
    }
    static AccountNotFound() {
        throw errors.manage(400, 'The account does not exists');
    }
    static UserAlreadyExists() {
        return 'The account already exists';
    }
    static NoContactPasswordLogin() {
        return 'The email or password is incorrect';
    }
}
exports.errors = errors;
