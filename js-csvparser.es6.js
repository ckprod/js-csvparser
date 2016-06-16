// util
// code snippets from https://github.com/moment/moment
function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function checkOverflow(year, month, day, hour, minute, second) {
    if (month && (month < 0 || month > 11)) return true;
    if (day && (day < 0 || day > daysInMonth(year, month))) return true;
    if (hour && (hour < 0 || hour > 24 || (hour === 24 && (minute !== 0 || second !== 0)))) return true;
    if (minute && (minute < 0 || minute > 59)) return true;
    if (second && (second < 0 || second > 59)) return true;

    return false;
}

function parseTwoDigitYear(input) {
    return Number(input) + (Number(input) > 68 ? 1900 : 2000);
}

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s) {
    return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
    }));
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// export

function isDate(dateString, formatString) {
    if (getDate(dateString, formatString) === 'NaD') {
        return false;
    }
    return true;
}


function getDate(dateString, formatString) {
    dateString = '' + dateString;

    let formattingTokens = /(\[[^\[]*\])|(\\)?(yyyy|yy|mm|m|dd|d|HH|H|MM|M|SS|S|.)/g;
    //let formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|mm?m?m?|Do|DDDo|dd?d?d?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|yyyy|yy|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    let tokens = formatString.match(formattingTokens) || [];
    let second = 0, minute = 0, hour = 0, day, month, year;
    let regex;

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        if (token === 'd' || token === 'm' || token === 'H' || token === 'M' || token === 'S') {
            regex = /\d\d?/;
        } else if (token === 'dd' || token === 'mm' || token === 'yy' || token === 'HH' || token === 'MM' || token === 'SS') {
            regex = /\d\d/;
        } else if (token === 'yyyy') {
            regex = /\d{4}/;
        } else {
            regex = new RegExp(unescapeFormat(token));
        }

        let parsedInput = (dateString.match(regex) || [])[0];

        if (parsedInput) {
            dateString = dateString.slice(dateString.indexOf(parsedInput) + parsedInput.length);

            //console.log(parsedInput);

            if (token === 'S' || token === 'SS') {
                second = Number(parsedInput);
            } else if (token === 'M' || token === 'MM') {
                minute = Number(parsedInput);
            } else if (token === 'H' || token === 'HH') {
                hour = Number(parsedInput);
            } else if (token === 'd' || token === 'dd') {
                day = Number(parsedInput);
            } else if (token === 'm' || token === 'mm') {
                month = Number(parsedInput) - 1;
            } else if (token === 'yy') {
                year = parseTwoDigitYear(parsedInput);
            } else if (token === 'yyyy') {
                year = parsedInput.length === 2 ? parseTwoDigitYear(parsedInput) : Number(parsedInput);
            }
        }
    }

    if (!year || !month || !day || checkOverflow(year, month, day, hour, minute, second)) {
        return 'NaD';
    } else {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
}

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
function findDecimal(output) {
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

function unionOptions(defaultOptions, options) {
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

function parse(data, options) {

    let defaultOptions = {
        delimiter: ',',
        lineEnding: '\n',
        comment: '#',
        maxRows: 0,
        maxColumns: {
            numberOfColumns: -1,
            cutRemaining: false
        }
    };

    // union options and defaultOptions
    options = unionOptions(defaultOptions, options);

    let out = [], row = [];
    let len = data.length;

    if (len === 0) return out;

    loop1:
    for (let start = 0, end = 0, rows = 0, columns = 0; ; end++) {
        if (end >= len) { // EOF
            //if (start < end) 
            row.push(data.substring(start, end));
            if (row.length > 0) out.push(row);
            break;
        }

        if (data[end] === options.delimiter) { // field
            columns++;
            if (columns === options.maxColumns.numberOfColumns) { // max columns reached
                if (options.maxColumns.cutRemaining) { // find next row
                    row.push(data.substring(start, end));
                    end = nextLineOrEOF(end); // search for next line or EOF
                } else { // 
                    end = nextLineOrEOF(end); // search for next line or EOF
                    row.push(data.substring(start, end));

                }
                out.push(row);
                row = [];
                columns = 0;
                rows++;
                if (end === len || rows === options.maxRows) break;  // EOF or max rows
                if (options.lineEnding === '\r\n') end = end + 1;
            } else {
                row.push(data.substring(start, end));
            }
            start = end + 1;
            continue;
        }

        if (data[end] === options.lineEnding || (options.lineEnding === '\r\n' && data[end] === '\r' && data[end + 1] === '\n')) { // line, the case '\r\n' is covered
            row.push(data.substring(start, end));
            out.push(row);
            row = [];
            columns = 0;
            rows++;
            if (rows === options.maxRows) break;
            if (options.lineEnding === '\r\n') end = end + 1;
            start = end + 1;
            continue;
        }

        if (startOrNewLine(end) && data[end] === options.comment) { // comment
            end = nextLineOrEOF(end); // search for next line or EOF
            if (end === len) break;  // EOF
            if (options.lineEnding === '\r\n') end = end + 1;
            start = end + 1;
            continue;
        }

        if (data[end] === '"') {  // first quote of quoted field, or misplaced quote
            if (startOrNewLine(end) || data[end - 1] === options.delimiter) { // first quote of quoted field
                start = end = end + 1;

                // search for closing quote
                loop2:
                for (; ; end++) {
                    if (end === len) { // misplaced quote, EOF
                        row.push(data.substring(start, end));
                        out.push(row);
                        break loop1;
                    }

                    if (data[end] === '"') {
                        if (end === len - 1) { // EOF
                            row.push(data.substring(start, end).replace(/""/g, '"'));
                            out.push(row);
                            break loop1;
                        }

                        if (data[end + 1] === '"') { // escape quote
                            end = end + 1;
                            continue;
                        }

                        if (data[end + 1] === options.delimiter) { // field
                            columns++;
                            if (columns === options.maxColumns.numberOfColumns) { // max columns reached
                                if (options.maxColumns.cutRemaining) { // find next row
                                    row.push(data.substring(start, end).replace(/""/g, '"'));

                                    end = nextLineOrEOF(end); // search for next line or EOF
                                } else { // 
                                    end = nextLineOrEOF(end); // search for next line or EOF
                                    row.push(data.substring(start, data[end - 1] === '"' ? (end - 1) : end).replace(/""/g, '"').replace(/","/g, ','));
                                }
                                out.push(row);
                                row = [];
                                columns = 0;
                                rows++;
                                if (end === len || rows === options.maxRows) break loop1;
                                if (options.lineEnding === '\r\n') end = end + 1;
                            } else {
                                row.push(data.substring(start, end).replace(/""/g, '"'));
                                end = end + 1;
                            }
                            start = end + 1;
                            break;
                        }

                        if (data[end + 1] === options.lineEnding || (options.lineEnding === '\r\n' && data[end + 1] === '\r' && data[end + 2] === '\n')) { // line, the case '\r\n' is covered
                            row.push(data.substring(start, end).replace(/""/g, '"'));
                            out.push(row);
                            row = [];
                            columns = 0;
                            rows++;
                            if (rows === options.maxRows) break loop1;
                            if (options.lineEnding === '\r\n') end = end + 1;
                            end = end + 1;
                            start = end + 1;
                            break;
                        }
                    }
                }
            } else {
                if (data[end + 1] === options.delimiter || end === len - 1) { // misplaced quote at end of field (might EOF)
                    end = end + 1;
                    columns++;
                    if (columns === options.maxColumns.numberOfColumns) { // max columns reached
                        if (options.maxColumns.cutRemaining) { // find next row
                            row.push(data.substring(start, end));
                            end = nextLineOrEOF(end); // search for next line or EOF
                        } else { // 
                            end = nextLineOrEOF(end); // search for next line or EOF
                            row.push(data.substring(start, end));
                        }
                        out.push(row);
                        row = [];
                        columns = 0;
                        rows++;
                        if (end === len || rows === options.maxRows) break;  // EOF or max rows
                        if (options.lineEnding === '\r\n') end = end + 1;
                    } else {
                        row.push(data.substring(start, end));
                    }
                    start = end + 1;
                    continue;
                }
            }
        }
    }

    function startOrNewLine(end) { // search for next line or EOF
        if (end === 0 || data[end - 1] === options.lineEnding || (end > 1 && options.lineEnding === '\r\n' && data[end - 2] === '\r' && data[end - 1] === '\n')) return true;
        return false;
    }

    function nextLineOrEOF(end) { // search for next line or EOF
        for (; end !== len && !(data[end] === options.lineEnding || (options.lineEnding === '\r\n' && data[end] === '\r' && data[end + 1] === '\n')); end++);
        return end;
    }

    return out;
}

const RECORD_SEP = String.fromCharCode(30);
const UNIT_SEP = String.fromCharCode(31);

function detectDelimiter(data, lineEnding) {
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

function detectLineEnding(data) {
    data = data.substr(0, 1024 * 1024);	// max length 1 MB

    data = data.replace(/"[^"]*"/g, ''); // replace all quoted fields

    //console.log(data);

    let n = data.split('\n');
    let r = data.split('\r');
    let rn = data.split('\r\n');

    let arr = [{ type: '\n', data: n, length: n.length - rn.length }, { type: '\r', data: r, length: r.length - rn.length }, { type: '\r\n', data: rn, length: rn.length - 1 }];
    arr.sort(function (a, b) {
        return b.length - a.length;
    });

    //console.log(arr);

    if (arr[0].length == 0)
        return '\n'; // default, no line breaks
    if (arr[0].length == arr[1].length) // mixed line breaks
        return arr[0].data[0].length <= arr[1].data[0].length ? arr[0].type : arr[1].type; // use first occurrence

    return arr[0].type;
}

function csvparse(data, options) {

    let defaultOptions = {
        delimiter: 'auto',
        lineEnding: 'auto',
        comment: '#',
        convertToTypes: {
            convert: false,
            decimalDelimiter: 'auto',
            dateFormat: 'YYYY-MM-DD'
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