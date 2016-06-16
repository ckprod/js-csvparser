'use strict';

import { parse } from './parse';

const RECORD_SEP = String.fromCharCode(30);
const UNIT_SEP = String.fromCharCode(31);

export function detectDelimiter(data, lineEnding) {
    let delimiters = [',', ';', '\t', '|', RECORD_SEP, UNIT_SEP];
    let res = [];

    for (let i = 0; i < delimiters.length; i++) {
        let example = parse(data, { delimiter: delimiters[i], lineEnding: lineEnding, maxRows: 10 });
        //console.log(example);
        let fields = 0, first = 0, delta = 1000;
        let firstRow = false, secondRow = false;

        for (let j = 0; j < example.length; j++) {
            // skip empty rows
            if (example[j] === '') {
                continue;
            }
            let fieldCount = example[j].length;
            fields += fieldCount;
            // first non-empty row
            if (!firstRow) {
                firstRow = true;
                first = example[j].length;
            }
            // second non-empty row
            if (!secondRow) {
                secondRow = true;
                delta = Math.abs(first - fieldCount);
            }
        }

        res.push([first, delta, fields, i]);
    }

    //console.log(res);

    // order by (max fields first row - desc) (difference first second row - asc) (max fields - desc)
    res.sort(function (a, b) {
        let a0 = a[0], b0 = b[0];
        let a1 = a[1], b1 = b[1];
        let a2 = a[2], b2 = b[2];
        if (a0 < b0) return 1;
        if (a0 > b0) return -1;
        if (a1 < b1) return -1;
        if (a1 > b1) return 1;
        if (a2 < b2) return 1;
        if (a2 > b2) return -1;
        return 0;
    });

    return delimiters[res[0][3]];
}
