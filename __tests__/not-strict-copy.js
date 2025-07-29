"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = require("../src/immer");
describe.each([true, false, "class_only"])("setUseStrictShallowCopy(true)", function (strictMode) {
    test("keep descriptors, mode: " + strictMode, function () {
        (0, immer_1.setUseStrictShallowCopy)(strictMode);
        var base = {};
        Object.defineProperty(base, "foo", {
            value: "foo",
            writable: false,
            configurable: false
        });
        var copy = (0, immer_1.produce)(base, function (draft) {
            draft.bar = "bar";
        });
        if (strictMode === true) {
            expect(Object.getOwnPropertyDescriptor(copy, "foo")).toStrictEqual(Object.getOwnPropertyDescriptor(base, "foo"));
        }
        else {
            expect(Object.getOwnPropertyDescriptor(copy, "foo")).toBeUndefined();
        }
    });
    test("keep non-enumerable class descriptors, mode: " + strictMode, function () {
        var _a;
        (0, immer_1.setUseStrictShallowCopy)(strictMode);
        (0, immer_1.setAutoFreeze)(false);
        var X = /** @class */ (function () {
            function X() {
                this[_a] = true;
                this.foo = "foo";
                Object.defineProperty(this, "bar", {
                    get: function () {
                        return this.foo + "bar";
                    },
                    configurable: false,
                    enumerable: false
                });
            }
            Object.defineProperty(X.prototype, "baz", {
                get: function () {
                    return this.foo + "baz";
                },
                enumerable: false,
                configurable: true
            });
            return X;
        }());
        _a = immer_1.immerable;
        var copy = (0, immer_1.produce)(new X(), function (draft) {
            draft.foo = "FOO";
        });
        var strict = strictMode === true || strictMode === "class_only";
        // descriptors on the prototype are unaffected, so this is still a getter
        expect(copy.baz).toBe("FOObaz");
        // descriptors on the instance are found, even when non-enumerable, and read during copy
        // so new values won't be reflected
        expect(copy.bar).toBe(strict ? "foobar" : undefined);
        copy.foo = "fluff";
        // not updated, the own prop became a value
        expect(copy.bar).toBe(strict ? "foobar" : undefined);
        // updated, it is still a getter
        expect(copy.baz).toBe("fluffbaz");
    });
});
