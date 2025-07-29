"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableMapSet = enableMapSet;
// types only!
var internal_1 = require("../internal");
function enableMapSet() {
    var DraftMap = /** @class */ (function (_super) {
        __extends(DraftMap, _super);
        function DraftMap(target, parent) {
            var _this = _super.call(this) || this;
            _this[internal_1.DRAFT_STATE] = {
                type_: 2 /* ArchType.Map */,
                parent_: parent,
                scope_: parent ? parent.scope_ : (0, internal_1.getCurrentScope)(),
                modified_: false,
                finalized_: false,
                copy_: undefined,
                assigned_: undefined,
                base_: target,
                draft_: _this,
                isManual_: false,
                revoked_: false
            };
            return _this;
        }
        Object.defineProperty(DraftMap.prototype, "size", {
            get: function () {
                return (0, internal_1.latest)(this[internal_1.DRAFT_STATE]).size;
            },
            enumerable: false,
            configurable: true
        });
        DraftMap.prototype.has = function (key) {
            return (0, internal_1.latest)(this[internal_1.DRAFT_STATE]).has(key);
        };
        DraftMap.prototype.set = function (key, value) {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            if (!(0, internal_1.latest)(state).has(key) || (0, internal_1.latest)(state).get(key) !== value) {
                prepareMapCopy(state);
                (0, internal_1.markChanged)(state);
                state.assigned_.set(key, true);
                state.copy_.set(key, value);
                state.assigned_.set(key, true);
            }
            return this;
        };
        DraftMap.prototype.delete = function (key) {
            if (!this.has(key)) {
                return false;
            }
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            prepareMapCopy(state);
            (0, internal_1.markChanged)(state);
            if (state.base_.has(key)) {
                state.assigned_.set(key, false);
            }
            else {
                state.assigned_.delete(key);
            }
            state.copy_.delete(key);
            return true;
        };
        DraftMap.prototype.clear = function () {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            if ((0, internal_1.latest)(state).size) {
                prepareMapCopy(state);
                (0, internal_1.markChanged)(state);
                state.assigned_ = new Map();
                (0, internal_1.each)(state.base_, function (key) {
                    state.assigned_.set(key, false);
                });
                state.copy_.clear();
            }
        };
        DraftMap.prototype.forEach = function (cb, thisArg) {
            var _this = this;
            var state = this[internal_1.DRAFT_STATE];
            (0, internal_1.latest)(state).forEach(function (_value, key, _map) {
                cb.call(thisArg, _this.get(key), key, _this);
            });
        };
        DraftMap.prototype.get = function (key) {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            var value = (0, internal_1.latest)(state).get(key);
            if (state.finalized_ || !(0, internal_1.isDraftable)(value)) {
                return value;
            }
            if (value !== state.base_.get(key)) {
                return value; // either already drafted or reassigned
            }
            // despite what it looks, this creates a draft only once, see above condition
            var draft = (0, internal_1.createProxy)(value, state);
            prepareMapCopy(state);
            state.copy_.set(key, draft);
            return draft;
        };
        DraftMap.prototype.keys = function () {
            return (0, internal_1.latest)(this[internal_1.DRAFT_STATE]).keys();
        };
        DraftMap.prototype.values = function () {
            var _a;
            var _this = this;
            var iterator = this.keys();
            return _a = {},
                _a[Symbol.iterator] = function () { return _this.values(); },
                _a.next = function () {
                    var r = iterator.next();
                    /* istanbul ignore next */
                    if (r.done)
                        return r;
                    var value = _this.get(r.value);
                    return {
                        done: false,
                        value: value
                    };
                },
                _a;
        };
        DraftMap.prototype.entries = function () {
            var _a;
            var _this = this;
            var iterator = this.keys();
            return _a = {},
                _a[Symbol.iterator] = function () { return _this.entries(); },
                _a.next = function () {
                    var r = iterator.next();
                    /* istanbul ignore next */
                    if (r.done)
                        return r;
                    var value = _this.get(r.value);
                    return {
                        done: false,
                        value: [r.value, value]
                    };
                },
                _a;
        };
        DraftMap.prototype[Symbol.iterator] = function () {
            return this.entries();
        };
        return DraftMap;
    }(Map));
    function proxyMap_(target, parent) {
        // @ts-ignore
        return new DraftMap(target, parent);
    }
    function prepareMapCopy(state) {
        if (!state.copy_) {
            state.assigned_ = new Map();
            state.copy_ = new Map(state.base_);
        }
    }
    var DraftSet = /** @class */ (function (_super) {
        __extends(DraftSet, _super);
        function DraftSet(target, parent) {
            var _this = _super.call(this) || this;
            _this[internal_1.DRAFT_STATE] = {
                type_: 3 /* ArchType.Set */,
                parent_: parent,
                scope_: parent ? parent.scope_ : (0, internal_1.getCurrentScope)(),
                modified_: false,
                finalized_: false,
                copy_: undefined,
                base_: target,
                draft_: _this,
                drafts_: new Map(),
                revoked_: false,
                isManual_: false
            };
            return _this;
        }
        Object.defineProperty(DraftSet.prototype, "size", {
            get: function () {
                return (0, internal_1.latest)(this[internal_1.DRAFT_STATE]).size;
            },
            enumerable: false,
            configurable: true
        });
        DraftSet.prototype.has = function (value) {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            // bit of trickery here, to be able to recognize both the value, and the draft of its value
            if (!state.copy_) {
                return state.base_.has(value);
            }
            if (state.copy_.has(value))
                return true;
            if (state.drafts_.has(value) && state.copy_.has(state.drafts_.get(value)))
                return true;
            return false;
        };
        DraftSet.prototype.add = function (value) {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            if (!this.has(value)) {
                prepareSetCopy(state);
                (0, internal_1.markChanged)(state);
                state.copy_.add(value);
            }
            return this;
        };
        DraftSet.prototype.delete = function (value) {
            if (!this.has(value)) {
                return false;
            }
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            prepareSetCopy(state);
            (0, internal_1.markChanged)(state);
            return (state.copy_.delete(value) ||
                (state.drafts_.has(value)
                    ? state.copy_.delete(state.drafts_.get(value))
                    : /* istanbul ignore next */ false));
        };
        DraftSet.prototype.clear = function () {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            if ((0, internal_1.latest)(state).size) {
                prepareSetCopy(state);
                (0, internal_1.markChanged)(state);
                state.copy_.clear();
            }
        };
        DraftSet.prototype.values = function () {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            prepareSetCopy(state);
            return state.copy_.values();
        };
        DraftSet.prototype.entries = function () {
            var state = this[internal_1.DRAFT_STATE];
            assertUnrevoked(state);
            prepareSetCopy(state);
            return state.copy_.entries();
        };
        DraftSet.prototype.keys = function () {
            return this.values();
        };
        DraftSet.prototype[Symbol.iterator] = function () {
            return this.values();
        };
        DraftSet.prototype.forEach = function (cb, thisArg) {
            var iterator = this.values();
            var result = iterator.next();
            while (!result.done) {
                cb.call(thisArg, result.value, result.value, this);
                result = iterator.next();
            }
        };
        return DraftSet;
    }(Set));
    function proxySet_(target, parent) {
        // @ts-ignore
        return new DraftSet(target, parent);
    }
    function prepareSetCopy(state) {
        if (!state.copy_) {
            // create drafts for all entries to preserve insertion order
            state.copy_ = new Set();
            state.base_.forEach(function (value) {
                if ((0, internal_1.isDraftable)(value)) {
                    var draft = (0, internal_1.createProxy)(value, state);
                    state.drafts_.set(value, draft);
                    state.copy_.add(draft);
                }
                else {
                    state.copy_.add(value);
                }
            });
        }
    }
    function assertUnrevoked(state /*ES5State | MapState | SetState*/) {
        if (state.revoked_)
            (0, internal_1.die)(3, JSON.stringify((0, internal_1.latest)(state)));
    }
    (0, internal_1.loadPlugin)("MapSet", { proxyMap_: proxyMap_, proxySet_: proxySet_ });
}
