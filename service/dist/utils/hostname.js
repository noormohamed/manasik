"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostname = hostname;
exports.urlDomain = urlDomain;
function hostname(origin) {
    return origin.replace(/(^\w+:|^)\/\//, "").split("/")[0].split(":")[0];
}
function urlDomain(ctx) {
    const origin = ctx.get("origin");
    return hostname(origin);
}
