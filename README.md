js-csvparser (Javascript CSV Parser)
========================================

[![Build Status](https://travis-ci.org/irhc/js-csvparser.png?branch=master)](https://travis-ci.org/irhc/js-csvparser)

Fast and feature rich CSV parser with great auto detection for line ending and delimiter. It can be used as node module or in the browser. It is completely independent from other javascript libraries but should work side-by-side with any other library like jQuery,etc.

###Usage

```html
// A simple echo program:
var csvparser = require('js-csvparser');

console.log(csvparser.csvparse('\r\na,b,c\r\nd,e,f', {skipEmptyLines: true}));
```

If you don't want to use default options, pass in an options object as second parameter

###Node.js Installation

```html
npm install js-csvparser
```
Current version should work with all Node.js versions, at least with version 4.8 and above.

###Features

- Easy to use
- Great auto detection for line ending and delimiter
- Configurable delimiter, line ending and comment character
- Can handle empty lines, even at the beginning
- Ignores lines starting with comment character
- No external dependencies
- Very fast (each character will be accessed only once)
- Can convert numbers and booleans to their types

###Options

- delimiter (default auto): Specify the delimiter for each cell. Leave blank to auto-detect. If specified, it must be a string of length 1.
- lineEnding (default auto): Specify the line ending character. Leave blank to auto-detect. If specified, it must be one of  \r, \n, or \r\n.
- comment (default #): Specify the escape character. Lines starting with this string will be skipped. If specified, it must be a string of length 1.
- lines (default 0): Limit the number of parsed lines, 0 means no limit (e.g. parse the whole file).
- convert (default false): 	If true, numeric and boolean data will be converted to their type instead of remaining strings. Numeric data must conform to the definition of a decimal literal. (European-formatted numbers must have commas and dots swapped.)
- skipEmptyLines (default false): If true, lines that are completely empty will be skipped. An empty line is defined to be one which evaluates to empty string.

###Speed

TESTS
- TODO


###References

Several other good csvparser with slightly different features were used as guideline:

- [papaparse](https://github.com/mholt/PapaParse)
- [ya-csv](https://github.com/koles/ya-csv)
- []

### Licence

MIT
