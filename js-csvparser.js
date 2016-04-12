;(function () {
    "use strict";

    const RECORD_SEP = String.fromCharCode(30);
    const UNIT_SEP = String.fromCharCode(31);

    function detectLineEnding(data) {
        data = data.substr(0, 1024 * 1024);	// max length 1 MB

        data = data.replace(/"[^"]*"/g, ''); // replace all quoted fields

        //console.log(data);

        let n = data.split('\n');
        let r = data.split('\r');
        let rn = data.split('\r\n');

        let arr = [{ type: '\n', data: n, length: n.length - rn.length }, { type: '\r', data: r, length: r.length - rn.length }, { type: '\r\n', data: rn, length: rn.length - 1 }];
        arr.sort(function(a, b) {
            return b.length - a.length;
        });

        //console.log(arr);

        if (arr[0].length == 0)
            return '\n'; // default, no line breaks
        if (arr[0].length == arr[1].length) // mixed line breaks
            return arr[0].data[0].length <= arr[1].data[0].length ? arr[0].type : arr[1].type; // use first occurrence

        return arr[0].type;
    }

    function parse(data, delimiter, lineEnding, comment, maxRows) {
        delimiter = typeof delimiter !== 'undefined' ? delimiter : ',';
        lineEnding = typeof lineEnding !== 'undefined' ? lineEnding : '\n';
        comment = typeof comment !== 'undefined' ? comment : '#'
        maxRows = typeof maxRows !== 'undefined' ? maxRows : 0;

        let out = [], row = [];
        let len = data.length;

        if (len === 0) return out;

        loop1:
        for (let start = 0, end = 0, rows = 0; ; end++) {
            if (end === len || end > len) { // EOF
                row.push(data.substring(start, end));
                out.push(row);
                row = [];
                break;
            }

            if (data[end] === delimiter) { // field
                row.push(data.substring(start, end));
                start = end + 1;
                continue;
            }

            if (data[end] === lineEnding || (lineEnding === '\r\n' && data[end] === '\r' && data[end + 1] === '\n')) { // line
                row.push(data.substring(start, end));
                out.push(row);
                row = [];
                rows++;
                if (lineEnding === '\r\n') end = end + 1;
                start = end + 1;
                if (rows === maxRows) break;
                continue;
            }

            if ((end === 0 || data[end - 1] === lineEnding) && data[end] === comment) { // comment
                for (; data[end] !== lineEnding && end !== len; end++); // search for next line or EOF
                if (end === len) break;  // EOF
                start = end + 1;
                continue;
            }

            if (data[end] === '"') {  // first quote of quoted field, or misplaced quote
                if (end === 0 || data[end - 1] === lineEnding || data[end - 1] === delimiter) { // first quote of quoted field
                    start = end = end + 1;
                    // search for closing quote

                    loop2:
                    for (; ; end++) {
                        if (end === len) { // misplaced quote, EOF
                            row.push(data.substring(start, end));
                            out.push(row);
                            row = [];
                            break loop1;
                            // return -1;
                        }

                        if (data[end] === '"') {
                            if (end === len - 1) { // EOF
                                row.push(data.substring(start, end).replace(/""/g, '"'));
                                out.push(row);
                                row = [];
                                start = end = end + 1;
                                break loop1;
                            }

                            if (data[end + 1] === '"') { // escape quote
                                end = end + 1;
                                continue;
                            }

                            if (data[end + 1] === delimiter) { // field
                                row.push(data.substring(start, end).replace(/""/g, '"'));
                                end = end + 1;
                                start = end + 1;
                                break;
                            }

                            if (data[end + 1] === lineEnding) { // line
                                row.push(data.substring(start, end).replace(/""/g, '"'));
                                out.push(row);
                                row = [];
                                rows++;
                                end = end + 1;
                                start = end + 1;
                                if (rows === maxRows)
                                    break loop1;
                                else
                                    break;
                            }
                        }
                    }
                } else {
                    if (data[end + 1] === delimiter || end === len - 1) { // misplaced quote at end of field (might EOF)
                        end = end + 1;
                        row.push(data.substring(start, end));
                        start = end + 1;
                        continue;
                    }
                }
            }
        }
        return out;
    }

    function detectDelimiter(data, lineEnding) {
        let delimiters = [',', ';', '\t', '|', RECORD_SEP, UNIT_SEP];
        let res = [];

        for (let i = 0; i < delimiters.length; i++) {
            let example = parse(data, delimiters[i], lineEnding, 10);
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
        res.sort(function(a, b) {
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

        //console.log(res);

        return delimiters[res[0][3]];
    }

    function csvparse(data, options) {
        options = options || {};
        let delimiter = typeof options.delimiter !== 'undefined' ? options.delimiter : 'auto';
        let lineEnding = typeof options.lineEnding !== 'undefined' ? options.lineEnding : 'auto';
        let comment = typeof options.comment !== 'undefined' ? options.comment : '#';
        let convert = typeof options.convert !== 'undefined' ? options.convert : false;
        let lines = typeof options.lines !== 'undefined' ? options.lines : 0;
        let skipEmptyLines = typeof options.skipEmptyLines !== 'undefined' ? options.skipEmptyLines : false;

        if (lineEnding === 'auto') lineEnding = detectLineEnding(data);
        if (delimiter === 'auto') delimiter = detectDelimiter(data, lineEnding);

        let output = parse(data, delimiter, lineEnding, comment, lines);

        if (skipEmptyLines) {
            for (let i = 0; i < output.length; i++) {
                if (output[i].length === 1 && output[i][0] === '') {
                    output.splice(i--, 1);
                }
            }
        }

        if (convert) {
            for (let i = 0; i < output.length; i++) {
                for (let j = 0; j < output[i].length; j++) {
                    let value = output[i][j];
                    if (value === 'true' || value === 'TRUE') {
                        output[i][j] = true;
                    } else if (value === 'false' || value === 'FALSE') {
                        output[i][j] = false;
                    } else if (!isNaN(Number(value))) {
                        output[i][j] = Number(value);
                    } else {
                        output[i][j] = String(value);
                    }
                }
            }
        }

        return { delimiter: delimiter, lineEnding: lineEnding, convert: convert, data: output };
    }

    // export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.csvparse = csvparse;
    } else {
        window.csvparse = csvparse;
    }

})();

//console.log(module.exports.csvparse('1,2.2,1e3\r\n-4,-4.5,-4e-5\r\n-,5a,5-2', {convert: true}));