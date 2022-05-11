/**
 * Takes any number of functions and invokes them all one after the other
 *
 * @param  {...function(...any):any} fns
 * @returns
 */
export const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x)
