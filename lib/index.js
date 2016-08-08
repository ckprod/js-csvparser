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
        },
        header: 'auto'
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
                    value = value.replace(reg, '');
                    value = value.replace(options.convertToTypes.decimalDelimiter, '.');
                    if (value.endsWith('-')) value = '-' + value.substring(0, value.length - 1);
                    if (value !== '' && !isNaN(Number(value))) { // Number
                        output[i][j] = Number(value);
                    } else { // String
                        ; // do nothing
                    }
                }
            }
        }
    }

    let header = [];
    if (output.length === 1) options.header = 0;
    if (options.header === 'auto') {
        let temp = [];
        let firstRowColumns = 0;
        for (let i = 0, j = 0; i < output.length; i++) {
            if (i === 0) firstRowColumns = output[i].length;
            if (output[i].length === firstRowColumns) { // only use rows with the same number of columns like the first row
                let t = [];
                for (let j = 0; j < output[i].length; j++) {
                    t.push(output[i][j]);
                }
                temp.push(t);
                j++;
            }

            if (j == 20) break; // no more than 20 rows are used for detection
        }


        if (!options.convertToTypes.convert) {
            let reg = /[,' ،.]/g;

            for (let i = 0; i < temp.length; i++) {
                for (let j = 0; j < temp[i].length; j++) {
                    let value = temp[i][j];
                    if (value === 'true' || value === 'TRUE') { // Boolean
                        temp[i][j] = true;
                    } else if (value === 'false' || value === 'FALSE') { // Boolean
                        temp[i][j] = false;
                    } else if (/[0-9]{2}\.[0-9]{2}\./.test(value)) { // maybe a date, eg. 01.01.
                        ; // do nothing
                    } else {
                        value = checkDate(value);

                        if (value.date) {
                            temp[i][j] = value.value;
                        } else {
                            value = value.value;
                            value = value.replace(reg, '');
                            if (value.endsWith('-')) value = '-' + value.substring(0, value.length - 1);
                            if (value !== '' && !isNaN(Number(value))) { // Number
                                temp[i][j] = Number(value);
                            } else { // String
                                ; // do nothing
                            }
                        }
                    }
                }
            }
        }

        let headerRows = 0;
        let rows = temp.length,
            columns = rows ? temp[0].length : 0,
            relColumns = 0;

        for (let i = 0; i < columns; i++) {
            let stringRows = 0,
                otherRows = 0;
            for (let j = 0; j < rows; j++) {
                if (typeof temp[j][i] === 'string') stringRows += 1;
                else {
                    otherRows += 1;
                    break;
                }
            }

            if (stringRows>0 && stringRows !== rows) {
                relColumns += 1;
                headerRows += stringRows
            }
        }

        if (relColumns) headerRows /= relColumns;
        headerRows = Math.round(headerRows);

        options.header = headerRows;
    }
    if (options.header) { // positive number or true
        if (options.header === true) options.header = 1;
        header = output.slice(0, options.header);
        output.splice(0, options.header);
    }

    return { options: options, data: output, header: header};
}

function checkDate (value) {
    // some formats according to https://en.wikipedia.org/wiki/Date_format_by_country
    let formats = ['dd.mm.yy', 'd.m.yy',
                   'dd.mm.yyyy', 'd.m.yyyy',
                   'dd/mm/yy', 'd/m/yy',
                   'dd/mm/yyyy', 'd/m/yyyy',
                   'dd-mm-yy', 'd-m-yy',
                   'dd-mm-yyyy', 'd-m-yyyy',
                   'yyyy-mm-dd', 'yy-mm-dd',
                   'yyyy/mm/dd', 'yy/mm/dd',
                   'yyyy mm dd',
                   'mm/dd/yy', 'm/d/yy',
                   'mm/dd/yyyy', 'm/d/yyyy']

    for (let format of formats) {
        if (isDate(value, format)) return { date: true, value: getDate(value, format) };
    }

    return { date: false, value: value };
}

export default csvparse;