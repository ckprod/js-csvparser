// test sets from papaparse (https://github.com/mholt/PapaParse)

'use strict';

const assert = require('assert');
const csvparser = require('../js-csvparser.js');

const RECORD_SEP = String.fromCharCode(30);
const UNIT_SEP = String.fromCharCode(31);

var CSVPARSER_TESTS = [
	{
		description: "Two rows, just \\r",
		input: 'A,b,c\rd,E,f',
		expected: {
			data: [['A', 'b', 'c'], ['d', 'E', 'f']],
			errors: []
		}
	},
	{
		description: "Two rows, \\r\\n",
		input: 'A,b,c\r\nd,E,f',
		expected: {
			data: [['A', 'b', 'c'], ['d', 'E', 'f']],
			errors: []
		}
	},
	{
		description: "Quoted field with \\r\\n",
		input: 'A,"B\r\nB",C',
		expected: {
			data: [['A', 'B\r\nB', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with \\r",
		input: 'A,"B\rB",C',
		expected: {
			data: [['A', 'B\rB', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with \\n",
		input: 'A,"B\nB",C',
		expected: {
			data: [['A', 'B\nB', 'C']],
			errors: []
		}
	},
	{
		description: "Mixed slash n and slash r should choose first as precident",
		input: 'a,b,c\nd,e,f\rg,h,i\n',
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f\rg', 'h', 'i'], ['']],
			errors: []
		}
	},
	{
		description: "Row with enough fields but blank field at end",
		input: 'A,B,C\r\na,b,',
		expected: {
			data: [['A', 'B', 'C'], ['a', 'b', '']],
			errors: []
		}
	},
	{
		description: "Tab delimiter",
		input: 'a\tb\tc\r\nd\te\tf',
		config: { delimiter: "\t" },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Pipe delimiter",
		input: 'a|b|c\r\nd|e|f',
		config: { delimiter: "|" },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "ASCII 30 delimiter",
		input: 'a'+RECORD_SEP+'b'+RECORD_SEP+'c\r\nd'+RECORD_SEP+'e'+RECORD_SEP+'f',
		config: { delimiter: RECORD_SEP },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "ASCII 31 delimiter",
		input: 'a'+UNIT_SEP+'b'+UNIT_SEP+'c\r\nd'+UNIT_SEP+'e'+UNIT_SEP+'f',
		config: { delimiter: UNIT_SEP },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Dynamic typing converts numeric literals",
		input: '1,2.2,1e3\r\n-4,-4.5,-4e-5\r\n-,5a,5-2',
		config: { convert: true },
		expected: {
			data: [[1, 2.2, 1000], [-4, -4.5, -0.00004], ["-", "5a", "5-2"]],
			errors: []
		}
	},
	{
		description: "Dynamic typing converts boolean literals",
		input: 'true,false,T,F,TRUE,FALSE,True,False',
        config: { convert: true },
		expected: {
			data: [[true, false, "T", "F", true, false, "True", "False"]],
			errors: []
		}
	},
	{
		description: "Dynamic typing doesn't convert other types",
		input: 'A,B,C\r\nundefined,null,[\r\nvar,float,if',
		config: { convert: true },
		expected: {
			data: [["A", "B", "C"], ["undefined", "null", "["], ["var", "float", "if"]],
			errors: []
		}
	},
	{
		description: "Blank line at beginning",
		input: '\r\na,b,c\r\nd,e,f',
		expected: {
			data: [[''], ['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Blank line in middle",
		input: 'a,b,c\r\n\r\nd,e,f',
		expected: {
			data: [['a', 'b', 'c'], [''], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Blank lines at end",
		input: 'a,b,c\nd,e,f\n\n',
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f'], [''], ['']],
			errors: []
		}
	},
	{
		description: "Blank line in middle with whitespace",
		input: 'a,b,c\r\n \r\nd,e,f',
		expected: {
			data: [['a', 'b', 'c'], [" "], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "First field of a line is empty",
		input: 'a,b,c\r\n,e,f',
		expected: {
			data: [['a', 'b', 'c'], ['', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Last field of a line is empty",
		input: 'a,b,\r\nd,e,f',
		expected: {
			data: [['a', 'b', ''], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Other fields are empty",
		input: 'a,,c\r\n,,',
		expected: {
			data: [['a', '', 'c'], ['', '', '']],
			errors: []
		}
	},
	{
		description: "Input is just the delimiter (2 empty fields)",
		input: ',',
		expected: {
			data: [['', '']],
			errors: []
		}
	},
	{
		description: "Preview 0 rows should default to parsing all",
		input: 'a,b,c\r\nd,e,f\r\ng,h,i',
		config: { lines: 0 },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
			errors: []
		}
	},
	{
		description: "Preview 1 row",
		input: 'a,b,c\r\nd,e,f\r\ng,h,i',
		config: { lines: 1 },
		expected: {
			data: [['a', 'b', 'c']],
			errors: []
		}
	},
	{
		description: "Preview 2 rows",
		input: 'a,b,c\r\nd,e,f\r\ng,h,i',
		config: { lines: 2 },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Preview all (3) rows",
		input: 'a,b,c\r\nd,e,f\r\ng,h,i',
		config: { lines: 3 },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
			errors: []
		}
	},
	{
		description: "Preview more rows than input has",
		input: 'a,b,c\r\nd,e,f\r\ng,h,i',
		config: { lines: 4 },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
			errors: []
		}
	},
	{
		description: "Preview should count rows, not lines",
		input: 'a,b,c\r\nd,e,"f\r\nf",g,h,i',
		config: { lines: 2 },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f\r\nf', 'g', 'h', 'i']],
			errors: []
		}
	},
	{
		description: "Empty lines",
		input: '\na,b,c\n\nd,e,f\n\n',
		expected: {
			data: [[''], ['a', 'b', 'c'], [''], ['d', 'e', 'f'], [''], ['']],
			errors: []
		}
	},
	{
		description: "Skip empty lines",
		input: 'a,b,c\n\nd,e,f',
		config: { skipEmptyLines: true },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Skip empty lines, with newline at end of input",
		input: 'a,b,c\r\n\r\nd,e,f\r\n',
		config: { skipEmptyLines: true },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Skip empty lines, with empty input",
		input: '',
		config: { skipEmptyLines: true },
		expected: {
			data: [],
			errors: [
				{
					"type": "Delimiter",
					"code": "UndetectableDelimiter",
					"message": "Unable to auto-detect delimiting character; defaulted to ','"
				}
			]
		}
	},
	{
		description: "Skip empty lines, with first line only whitespace",
		notes: "A line must be absolutely empty to be considered empty",
		input: ' \na,b,c',
		config: { skipEmptyLines: true, delimiter: ',' },
		expected: {
			data: [[" "], ['a', 'b', 'c']],
			errors: []
		}
	}
];

describe('csvparser test', function() {
    for (let i = 0; i < CSVPARSER_TESTS.length; i++) {
        let test = CSVPARSER_TESTS[i];
        it(test.description, function() {
            let guess = csvparser.csvparse(test.input, test.config);

            assert.deepEqual(guess.data, test.expected.data);
        });
    }
});