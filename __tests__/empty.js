"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = require("../src/immer");
var internal_1 = require("../src/internal");
(0, immer_1.enableMapSet)();
(0, immer_1.enablePatches)();
test("empty stub test", function () {
    expect(true).toBe(true);
});
describe("map set - proxy", function () {
    test("can assign set value", function () {
        var baseState = new Map([["x", 1]]);
        var nextState = (0, immer_1.produce)(baseState, function (s) {
            s.set("x", 2);
        });
        expect(baseState.get("x")).toEqual(1);
        expect(nextState).not.toBe(baseState);
        expect(nextState.get("x")).toEqual(2);
    });
    test("can assign by key", function () {
        var baseState = new Map([["x", { a: 1 }]]);
        var nextState = (0, immer_1.produce)(baseState, function (s) {
            s.get("x").a++;
        });
        expect(nextState.get("x").a).toEqual(2);
        expect(baseState.get("x").a).toEqual(1);
        expect(nextState).not.toBe(baseState);
    });
    test("deep change bubbles up", function () {
        var baseState = createBaseState();
        var nextState = (0, immer_1.produce)(baseState, function (s) {
            s.anObject.nested.yummie = false;
        });
        expect(nextState).not.toBe(baseState);
        expect(nextState.anObject).not.toBe(baseState.anObject);
        expect(baseState.anObject.nested.yummie).toBe(true);
        expect(nextState.anObject.nested.yummie).toBe(false);
        expect(nextState.anArray).toBe(baseState.anArray);
    });
    it("can assign by key", function () {
        var baseState = createBaseState();
        var nextState = (0, immer_1.produce)(baseState, function (s) {
            // Map.prototype.set should return the Map itself
            var res = s.aMap.set("force", true);
            // @ts-ignore
            if (!global.USES_BUILD)
                expect(res).toBe(s.aMap[internal_1.DRAFT_STATE].draft_);
        });
        expect(nextState).not.toBe(baseState);
        expect(nextState.aMap).not.toBe(baseState.aMap);
        expect(nextState.aMap.get("force")).toEqual(true);
    });
    it("can use 'delete' to remove items", function () {
        var baseState = createBaseState();
        var nextState = (0, immer_1.produce)(baseState, function (s) {
            expect(s.aMap.has("jedi")).toBe(true);
            expect(s.aMap.delete("jedi")).toBe(true);
            expect(s.aMap.has("jedi")).toBe(false);
        });
        expect(nextState.aMap).not.toBe(baseState.aMap);
        expect(nextState.aMap.size).toBe(baseState.aMap.size - 1);
        expect(baseState.aMap.has("jedi")).toBe(true);
        expect(nextState.aMap.has("jedi")).toBe(false);
    });
    it("support 'has'", function () {
        var baseState = createBaseState();
        var nextState = (0, immer_1.produce)(baseState, function (s) {
            expect(s.aMap.has("newKey")).toBe(false);
            s.aMap.set("newKey", true);
            expect(s.aMap.has("newKey")).toBe(true);
        });
        expect(nextState).not.toBe(baseState);
        expect(nextState.aMap).not.toBe(baseState.aMap);
        expect(baseState.aMap.has("newKey")).toBe(false);
        expect(nextState.aMap.has("newKey")).toBe(true);
    });
});
function createBaseState() {
    var data = {
        anInstance: new (/** @class */ (function () {
            function class_1() {
            }
            return class_1;
        }()))(),
        anArray: [3, 2, { c: 3 }, 1],
        aMap: new Map([
            ["jedi", { name: "Luke", skill: 10 }],
            ["jediTotal", 42],
            ["force", "these aren't the droids you're looking for"]
        ]),
        aSet: new Set([
            "Luke",
            42,
            {
                jedi: "Yoda"
            }
        ]),
        aProp: "hi",
        anObject: {
            nested: {
                yummie: true
            },
            coffee: false
        }
    };
    return data;
}
describe("#768", function () {
    var _a;
    var Stock = /** @class */ (function () {
        function Stock(price) {
            this.price = price;
            this[_a] = true;
        }
        Stock.prototype.pushPrice = function (price) {
            this.price = price;
        };
        return Stock;
    }());
    _a = immer_1.immerable;
    test("bla", function () {
        // Set up conditions to produce the error
        var errorProducingPatch = [
            {
                op: "replace",
                path: ["stock"],
                value: new Stock(200)
            }
        ];
        // Start with modified state
        var state = {
            stock: new Stock(100)
        };
        expect(state.stock.price).toEqual(100);
        expect(state.stock[immer_1.immerable]).toBeTruthy();
        // Use patch to "replace" stocks
        var resetState = (0, immer_1.applyPatches)(state, errorProducingPatch);
        expect(state.stock.price).toEqual(100);
        expect(resetState.stock.price).toEqual(200);
        expect(resetState.stock[immer_1.immerable]).toBeTruthy();
        // Problems come in when resetState is modified
        var updatedState = (0, immer_1.produce)(resetState, function (draft) {
            draft.stock.pushPrice(300);
        });
        expect(state.stock.price).toEqual(100);
        expect(updatedState.stock.price).toEqual(300);
        expect(updatedState.stock[immer_1.immerable]).toBeTruthy();
        expect(resetState.stock.price).toEqual(200);
    });
});
