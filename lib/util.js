'use strict';

export function unionOptions(defaultOptions, options) {
    for (let prop in options) {
        if (typeof options[prop] === 'object') {
            if (typeof defaultOptions[prop] !== 'undefined') {
                unionOptions(defaultOptions[prop], options[prop]);
            }
        } else {
            defaultOptions[prop] = options[prop];
        }
    }
    return defaultOptions;
}