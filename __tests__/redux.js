"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_ts_1 = require("./spec_ts");
var immer_1 = require("../src/immer");
var redux = require("redux");
// Mutable Redux
{
    var initialState_1 = {
        counter: 0
    };
    /// =============== Actions
    var reduceCounterProducer = function (state, action) {
        if (state === void 0) { state = initialState_1; }
        return (0, immer_1.produce)(state, function (draftState) {
            switch (action.type) {
                case "ADD_TO_COUNTER":
                    draftState.counter += action.payload;
                    break;
                case "SUB_FROM_COUNTER":
                    draftState.counter -= action.payload;
                    break;
            }
        });
    };
    var reduceCounterCurriedProducer = (0, immer_1.produce)(function (draftState, action) {
        switch (action.type) {
            case "ADD_TO_COUNTER":
                draftState.counter += action.payload;
                break;
            case "SUB_FROM_COUNTER":
                draftState.counter -= action.payload;
                break;
        }
    }, initialState_1);
    /// =============== Reducers
    var reduce = redux.combineReducers({
        counterReducer: reduceCounterProducer
    });
    var curredReduce = redux.combineReducers({
        counterReducer: reduceCounterCurriedProducer
    });
    // reducing the current state to get the next state!
    // console.log(reduce(initialState, addToCounter(12));
    // ================ store
    var store_1 = redux.createStore(reduce);
    var curriedStore_1 = redux.createStore(curredReduce);
    it("#470 works with Redux combine reducers", function () {
        (0, spec_ts_1.assert)(store_1.getState().counterReducer, spec_ts_1._);
        (0, spec_ts_1.assert)(curriedStore_1.getState().counterReducer, spec_ts_1._);
    });
}
// Readonly Redux
{
    {
        var initialState_2 = {
            counter: 0
        };
        /// =============== Actions
        var reduceCounterProducer = function (state, action) {
            if (state === void 0) { state = initialState_2; }
            return (0, immer_1.produce)(state, function (draftState) {
                switch (action.type) {
                    case "ADD_TO_COUNTER":
                        draftState.counter += action.payload;
                        break;
                    case "SUB_FROM_COUNTER":
                        draftState.counter -= action.payload;
                        break;
                }
            });
        };
        var reduceCounterCurriedProducer = (0, immer_1.produce)(function (draftState, action) {
            switch (action.type) {
                case "ADD_TO_COUNTER":
                    draftState.counter += action.payload;
                    break;
                case "SUB_FROM_COUNTER":
                    draftState.counter -= action.payload;
                    break;
            }
        }, initialState_2);
        /// =============== Reducers
        var reduce = redux.combineReducers({
            counterReducer: reduceCounterProducer
        });
        var curredReduce = redux.combineReducers({
            counterReducer: reduceCounterCurriedProducer
        });
        // reducing the current state to get the next state!
        // console.log(reduce(initialState, addToCounter(12));
        // ================ store
        var store_2 = redux.createStore(reduce);
        var curriedStore_2 = redux.createStore(curredReduce);
        it("#470 works with Redux combine readonly reducers", function () {
            (0, spec_ts_1.assert)(store_2.getState().counterReducer, spec_ts_1._);
            (0, spec_ts_1.assert)(curriedStore_2.getState().counterReducer, spec_ts_1._);
        });
    }
}
it("works with inferred curried reducer", function () {
    var defaultState = {
        count: 3
    };
    var store = redux.createStore((0, immer_1.produce)(function (state, action) {
        if (action.type === "inc")
            state.count += action.count;
        // @ts-expect-error
        state.count2;
    }, defaultState));
    (0, spec_ts_1.assert)(store.getState(), spec_ts_1._);
    store.dispatch({
        type: "inc",
        count: 2
    });
    store.dispatch({
        // @ts-expect-error
        type: "inc2",
        count: 2
    });
});
it("works with inferred curried reducer - readonly", function () {
    var defaultState = {
        count: 3
    };
    var store = redux.createStore((0, immer_1.produce)(function (state, action) {
        if (action.type === "inc")
            state.count += action.count;
        // @ts-expect-error
        state.count2;
    }, defaultState));
    (0, spec_ts_1.assert)(store.getState(), spec_ts_1._);
    store.dispatch({
        type: "inc",
        count: 2
    });
    store.dispatch({
        // @ts-expect-error
        type: "inc2",
        count: 2
    });
});
