'use strict';
    
import { isDate, getDate } from './date';
import { findDecimal } from './decimalDelimiter';
import { detectDelimiter } from './fieldDelimiter';
import { detectLineEnding } from './lineEnding';
import { parse } from './parse';
import { unionOptions } from './util';

function csvparse(data, options) {

    let defaultOptions = {
        delimiter: 'auto',
        lineEnding: 'auto',
        comment: '#',
        convertToTypes: {
            convert: false,
            decimalDelimiter: 'auto',
            dateFormat: 'yyyy-mm-dd'
        },
        skipEmptyLines: false,
        maxRows: 0,
        maxColumns: {
            numberOfColumns: -1,
            cutRemaining: false
        }
    };

    // union options and defaultOptions
    options = unionOptions(defaultOptions, options);

    if (options.lineEnding === 'auto') options.lineEnding = detectLineEnding(data);
    if (options.delimiter === 'auto') options.delimiter = detectDelimiter(data, options.lineEnding);

    let output = parse(data, options);

    if (options.skipEmptyLines) {
        for (let i = 0; i < output.length; i++) {
            if (output[i].length === 1 && output[i][0] === '') {
                output.splice(i--, 1);
            }
        }
    }

    if (options.convertToTypes.convert) {
        if (options.convertToTypes.decimalDelimiter === 'auto') options.convertToTypes.decimalDelimiter = findDecimal(output);
        let reg;
        if (options.convertToTypes.decimalDelimiter === '.') {
            reg = /[,' ،]/g;
        } else {
            reg = /[\.' ،]/g;
        }

        for (let i = 0; i < output.length; i++) {
            for (let j = 0; j < output[i].length; j++) {
                let value = output[i][j];
                if (value === 'true' || value === 'TRUE') { // Boolean
                    output[i][j] = true;
                } else if (value === 'false' || value === 'FALSE') { // Boolean
                    output[i][j] = false;
                } else if (isDate(value, options.convertToTypes.dateFormat)) { // Date
                    output[i][j] = getDate(value, options.convertToTypes.dateFormat);
                } else if (/[0-9]{2}\.[0-9]{2}\./.test(value)) { // maybe a date, eg. 01.01.
                    ; // do nothing
                } else {
                    value = value.replace(reg, '').replace(/(.*)-/, "-$1").replace(options.convertToTypes.decimalDelimiter, '.');
                    if (!isNaN(Number(value))) { // Number
                        output[i][j] = Number(value);
                    } else { // String
                        ; // do nothing
                    }
                }
            }
        }
    }

    return { options: options, data: output };
}

export default csvparse;