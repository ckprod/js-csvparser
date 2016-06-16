'use strict';

export function detectLineEnding(data) {
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