import {Context} from "koa";

export function hostname(origin: string) {
    return origin.replace(/(^\w+:|^)\/\//, "").split("/")[0].split(":")[0];
}

export function urlDomain(ctx: Context) {
    const origin = ctx.get("origin");
    return hostname(origin);
}