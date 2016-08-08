js-csvparser (Javascript CSV Parser)
========================================

[![NPM version](http://img.shields.io/npm/v/js-csvparser.svg)](https://www.npmjs.org/package/js-csvparser)
![](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
[![Build Status](https://travis-ci.org/irhc/js-csvparser.png?branch=master)](https://travis-ci.org/irhc/js-csvparser)

Fast and feature rich CSV parser with great auto detection for line ending and delimiter. It can be used as node module or in the browser. It is completely independent from other javascript libraries but should work side-by-side with any other library.

###Usage

```javascript
// A simple echo program:
const csvparse = require('js-csvparser');

console.log(csvparse('h1,h2,h3\r\n1,2,3\r\n4,5,6'));
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

console.log(csvparse('h1,h2,h3\r\n1,2,3\r\n4,5,6', defaultOptions));
```

###Node.js Installation

`npm install js-csvparser`

Current version should work with all Node.js versions, at least with version 4 and above.

###Features

- Easy to use
- Great auto detection for line ending and delimiter
- Can handle header rows with simple auto detection
- Configurable delimiter, line ending and comment character
- Can handle empty lines, even at the beginning
- Ignores lines starting with comment character
- No external dependencies
- Very fast (each character will be accessed only once, despite the usual access for the output data)
- Can convert numbers, booleans and dates to their types

###Options

You can set different options for parsing the data.
```javascript
let defaultOptions = {
    // Specify the delimiter for each cell. Leave blank to auto-detect.
    // If specified, it must be a string of length 1.
    delimiter: 'auto',
    
    // Specify the line ending character. Leave blank to auto-detect. 
    // If specified, it must be one of  \r, \n, or \r\n.
    lineEnding: 'auto',
    
    // Specify the escape character. Lines starting with this string 
    // will be skipped. If specified, it must be a string of length 1.
    comment: '#', 
    
    convertToTypes: {
        // If true, numeric, boolean and date data will be converted
        // to their type instead of remaining strings.
        convert: false,
        
        // Specify the decimal delimiter for converting numeric data.
        // Leave blank to auto-detect. If specified, it must be '.' or ','.
        decimalDelimiter: 'auto',
        
        // Specify the date format using one of the following tokens:
        // token| description       | example
        // yyyy | 4 or 2 digit year | 2014
        // yy 	| 2 digit year      |   14
        // m mm | month number      | 1..12
        // d dd	| day number        | 1..31
        // H HH | 24 hour time      | 0..23
        // M MM	| Minutes           | 0..59
        // S SS | Seconds           | 0..59
        dateFormat: 'yyyy-mm-dd'
    },

    // If true, lines that are completely empty will be skipped. An empty 
    // line is defined to be one which evaluates to empty string.
    skipEmptyLines: false,
    
    // Limit the number of parsed lines, 0 means no limit (e.g. parse the 
    // whole file).
    maxRows: 0,
     
    maxColumns: {
        // Limit the number of parsed columns, -1 means no limit (e.g. parse 
        // all columns).
        numberOfColumns: -1,
        
        // If there is a column limit, specify how to procced with the 
        // remaining date of the row: If true, the last column of the output 
        // will contain the remaining data of the parsed row, otherwise the 
        // remaining data of the row will be omitted.
        cutRemaining: false
    },

    // One of 'auto', true (meaning one header row), false (no header row) or
    // any non negative number (meaning the number of header rows). In the case 
    // of 'auto', js-csvparser is try its best to detect the number of header rows.
    header: 'auto'
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
