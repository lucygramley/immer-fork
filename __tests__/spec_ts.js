"use strict";
/**
 * This file is literally copied from https://github.com/aleclarson/spec.ts/blob/master/index.d.ts.
 * For the sole reason, that the package somehow fails to install in our GitHub workflow.
 * It is unclear why, but all credits to @aleclarson!
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._ = exports.assert = exports.Any = void 0;
// Give "any" its own class
var Any = /** @class */ (function () {
    function Any() {
    }
    return Any;
}());
exports.Any = Any;
/**
 * Raise a compiler error when both argument types are not identical.
 */
var assert = function (x) { return x; };
exports.assert = assert;
/**
 * Placeholder value followed by "as T"
 */
exports._ = Symbol("spec.ts placeholder");
test("empty test to silence jest", function () {
    expect(true).toBeTruthy();
});
