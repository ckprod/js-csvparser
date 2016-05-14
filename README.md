js-csvparser (Javascript CSV Parser)
========================================

[![Build Status](https://travis-ci.org/irhc/js-csvparser.png?branch=master)](https://travis-ci.org/irhc/js-csvparser)

Fast and feature rich CSV parser with great auto detection for line ending and delimiter. It can be used as node module or in the browser. It has only one dependency: the [Moment.js](http://momentjs.com/) library for converting formatted date strings to date objects.

###Usage

```javascript
// A simple echo program:
const csvparse = require('js-csvparser');

console.log(csvparse('\r\na,b,c\r\nd,e,f', {skipEmptyLines: true}));
```

If you don't want to use default options, pass in an options object as second parameter.
```javascript
// A simple echo program:
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

console.log(csvparse('\r\na,b,c\r\nd,e,f', defaultOptions));
```

###Node.js Installation

`npm install js-csvparser`

Current version should work with all Node.js versions, at least with version 4 and above.

###Features

- Easy to use
- Great auto detection for line ending and delimiter
- Configurable delimiter, line ending and comment character
- Can handle empty lines, even at the beginning
- Ignores lines starting with comment character
- No external dependencies
- Very fast (each character will be accessed only once, despite the usual access for the output data)
- Can convert numbers, booleans and dates to their types

###Options

- delimiter (default auto): Specify the delimiter for each cell. Leave blank to auto-detect. If specified, it must be a string of length 1.
- lineEnding (default auto): Specify the line ending character. Leave blank to auto-detect. If specified, it must be one of  \r, \n, or \r\n.
- comment (default #): Specify the escape character. Lines starting with this string will be skipped. If specified, it must be a string of length 1.
- convertToTypes (default false): If true, numeric, boolean and date data will be converted to their type instead of remaining strings. 
- skipEmptyLines (default false): If true, lines that are completely empty will be skipped. An empty line is defined to be one which evaluates to empty string.
- maxRows (default 0): Limit the number of parsed lines, 0 means no limit (e.g. parse the whole file).
- maxColumns (default -1): Limit the number of parsed columns, -1 means no limit (e.g. parse all columns). If the suboption cutRemaining (default false) is false, the last valid column will contain the remaining data of the row, otherwise the remaining data of the row will be cutoff.

You can set different options for parsing the data. The default options and descriptions are as follows:
```javascript
let defaultOptions = {
    delimiter: 'auto', // Specify the delimiter for each cell. Leave blank to auto-detect. If specified, it must be a string of length 1.
    lineEnding: 'auto', // Specify the line ending character. Leave blank to auto-detect. If specified, it must be one of  \r, \n, or \r\n.
    comment: '#', // Specify the escape character. Lines starting with this string will be skipped. If specified, it must be a string of length 1.
    convertToTypes: {
        convert: false, // If true, numeric, boolean and date data will be converted to their type instead of remaining strings. 
        decimalDelimiter: 'auto', // Specify the decimal delimiter for converting numeric data. Leave blank to auto-detect. If specified, it must be '.' or ','.
        dateFormat: 'YYYY-MM-DD' // Specify the date format.
    },
    skipEmptyLines: false, // If true, lines that are completely empty will be skipped. An empty line is defined to be one which evaluates to empty string.
    maxRows: 0, // Limit the number of parsed lines, 0 means no limit (e.g. parse the whole file).
    maxColumns: {
        numberOfColumns: -1, // Limit the number of parsed columns, -1 means no limit (e.g. parse all columns).
        cutRemaining: false // If there is a column limit, specify how to procced with the remaining date of the row: If true, the last column of the output will contain the remaining data of the parsed row, otherwise the remaining data of the row will be omitted.
    }
};
 ```

###References

Several other good csvparser with slightly different features were used as guideline:

- [papaparse](https://github.com/mholt/PapaParse)
- [ya-csv](https://github.com/koles/ya-csv)

This small javascript component uses or is based on other javascript projects and code snippets:

- [detect-decimal-delimiter](https://github.com/irhc/detect-decimal-delimiter)
- [moment](https://github.com/moment/moment)

### Licence

MIT
