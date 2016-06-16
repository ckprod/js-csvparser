'use strict';

function detectDecimalDelimiter(input) {
    input = input.trim();

    let c = input.split(',').length - 1;

    if (c > 1) return '.'; // '123,456,789' or '123,456,789.12'
    if (input.indexOf(' ') >= 0) return ','; // '123 456'
    if (input.indexOf('،') >= 0) return '.'; // '123،456'
    if (input.indexOf('\'') >= 0) return '.'; // '123\'456'

    let d = input.split('.').length - 1;
    if (c === 1 && d === 1) { // '123,456.789' or '1.234,45'
        let ci = input.lastIndexOf(',');
        let di = input.lastIndexOf('.');
        if (di > ci) return '.';
        else return ',';
    }

    if (c + d === 1) {
        let ci = input.indexOf(',');
        let di = input.indexOf('.');
        let len = input.length;

        if (ci !== -1 && len - ci !== 4) return ',';
        if (di !== -1 && len - di !== 4) return '.';
    }

    return 'ambiguous';
}

// default delimiter '.'
export function findDecimal(output) {
    for (let i = 0; i < output.length; i++) {
        for (let j = 0; j < output[i].length; j++) {
            if (/^[0-9.,' ،-]+$/.test(output[i][j])) {
                let delimiter = detectDecimalDelimiter(output[i][j]);
                if (delimiter !== 'ambiguous') {
                    return delimiter;
                }
            }
        }
    }
    return '.';
}