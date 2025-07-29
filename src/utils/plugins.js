"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlugin = getPlugin;
exports.loadPlugin = loadPlugin;
var internal_1 = require("../internal");
/** Plugin utilities */
var plugins = {};
function getPlugin(pluginKey) {
    var plugin = plugins[pluginKey];
    if (!plugin) {
        (0, internal_1.die)(0, pluginKey);
    }
    // @ts-ignore
    return plugin;
}
function loadPlugin(pluginKey, implementation) {
    if (!plugins[pluginKey])
        plugins[pluginKey] = implementation;
}
