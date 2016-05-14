// many test sets from papaparse (https://github.com/mholt/PapaParse)

'use strict';

const assert = require('assert');
const csvparse = require('../js-csvparser.js');

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
		input: 'a,b,c\nd,e,f\rg,h,i\n ',
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f\rg', 'h', 'i'], [' ']],
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
		expected: {
			data: [[1, 2.2, 1000], [-4, -4.5, -0.00004], ["-", "5a", "5-2"]],
			errors: []
		}
	},
	{
		description: "Dynamic typing converts boolean literals",
		input: 'true,false,T,F,TRUE,FALSE,True,False',
        config: { transform: true },
		expected: {
			data: [[true, false, "T", "F", true, false, "True", "False"]],
			errors: []
		}
	},
	{
		description: "Dynamic typing doesn't convert other types",
		input: 'A,B,C\r\nundefined,null,[\r\nvar,float,if',
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
		config: { maxRows: 1 },
		expected: {
			data: [['a', 'b', 'c']],
			errors: []
		}
	},
	{
		description: "Preview 2 rows",
		input: 'a,b,c\r\nd,e,f\r\ng,h,i',
		config: { maxRows: 2 },
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
	},
	{
		description: "One row",
		input: 'A,b,c',
		expected: {
			data: [['A', 'b', 'c']],
			errors: []
		}
	},
	{
		description: "Two rows",
		input: 'A,b,c\nd,E,f',
		expected: {
			data: [['A', 'b', 'c'], ['d', 'E', 'f']],
			errors: []
		}
	},
	{
		description: "Three rows",
		input: 'A,b,c\nd,E,f\nG,h,i',
		expected: {
			data: [['A', 'b', 'c'], ['d', 'E', 'f'], ['G', 'h', 'i']],
			errors: []
		}
	},
	{
		description: "Whitespace at edges of unquoted field",
		input: 'a,  b ,c',
		notes: "Extra whitespace should graciously be preserved",
		expected: {
			data: [['a', '  b ', 'c']],
			errors: []
		}
	},
	{
		description: "Quoted field",
		input: 'A,"B",C',
		expected: {
			data: [['A', 'B', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with extra whitespace on edges",
		input: 'A," B  ",C',
		expected: {
			data: [['A', ' B  ', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with delimiter",
		input: 'A,"B,B",C',
		expected: {
			data: [['A', 'B,B', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with line break",
		input: 'A,"B\nB",C',
		expected: {
			data: [['A', 'B\nB', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted fields with line breaks",
		input: 'A,"B\nB","C\nC\nC"',
		expected: {
			data: [['A', 'B\nB', 'C\nC\nC']],
			errors: []
		}
	},
	{
		description: "Quoted fields at end of row with delimiter and line break",
		input: 'a,b,"c,c\nc"\nd,e,f',
		expected: {
			data: [['a', 'b', 'c,c\nc'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Quoted field with escaped quotes",
		input: 'A,"B""B""B",C',
		expected: {
			data: [['A', 'B"B"B', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with escaped quotes at boundaries",
		input: 'A,"""B""",C',
		expected: {
			data: [['A', '"B"', 'C']],
			errors: []
		}
	},
	{
		description: "Unquoted field with quotes at end of field",
		notes: "The quotes character is misplaced, but shouldn't generate an error or break the parser",
		input: 'A,B",C',
		expected: {
			data: [['A', 'B"', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with quotes around delimiter",
		input: 'A,""",""",C',
		notes: "For a boundary to exist immediately before the quotes, we must not already be in quotes",
		expected: {
			data: [['A', '","', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with quotes on right side of delimiter",
		input: 'A,",""",C',
		notes: "Similar to the test above but with quotes only after the comma",
		expected: {
			data: [['A', ',"', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with quotes on left side of delimiter",
		input: 'A,""",",C',
		notes: "Similar to the test above but with quotes only before the comma",
		expected: {
			data: [['A', '",', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field with 5 quotes in a row and a delimiter in there, too",
		input: '"1","cnonce="""",nc=""""","2"',
		notes: "Actual input reported in issue #121",
		expected: {
			data: [['1', 'cnonce="",nc=""', '2']],
			errors: []
		}
	},
	{
		description: "Quoted field with whitespace around quotes",
		input: 'A, "B" ,C',
		notes: "The quotes must be immediately adjacent to the delimiter to indicate a quoted field",
		expected: {
			data: [['A', ' "B" ', 'C']],
			errors: []
		}
	},
	{
		description: "Misplaced quotes at end of field",
		input: 'A,B,C",D',
		notes: "The input is technically malformed, but this syntax should not cause an error",
		expected: {
			data: [['A', 'B', 'C"', 'D']],
			errors: []
		}
	},
	{
		description: "Misplaced quotes in data, not as opening quotes",
		input: 'A,B "B",C',
		notes: "The input is technically malformed, but this syntax should not cause an error",
		expected: {
			data: [['A', 'B "B"', 'C']],
			errors: []
		}
	},
	{
		description: "Quoted field has no closing quote",
		input: 'a,"b,c\nd,e,f',
		expected: {
			data: [['a', 'b,c\nd,e,f']],
			errors: [{
				"type": "Quotes",
				"code": "MissingQuotes",
				"message": "Quoted field unterminated",
				"row": 0,
				"index": 3
			}]
		}
	},
	{
		description: "Line starts with quoted field",
		input: 'a,b,c\n"d",e,f',
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Line ends with quoted field",
		input: 'a,b,c\nd,e,f\n"g","h","i"\n"j","k","l"',
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l']],
			errors: []
		}
	},
	{
		description: "Quoted field at end of row (but not at EOF) has quotes",
		input: 'a,b,"c""c"""\nd,e,f',
		expected: {
			data: [['a', 'b', 'c"c"'], ['d', 'e', 'f']],
			errors: []
		}
	},
    {
        description: "Empty quoted field at EOF is empty",
        input: 'a,b,""\na,b,""',
        expected: {
            data: [['a', 'b', ''], ['a', 'b', '']],
            errors: []
        }
    },
	{
		description: "Multiple consecutive empty fields",
		input: 'a,b,,,c,d\n,,e,,,f',
		expected: {
			data: [['a', 'b', '', '', 'c', 'd'], ['', '', 'e', '', '', 'f']],
			errors: []
		}
	},
	{
		description: "Empty input string",
		input: '',
		expected: {
			data: [],
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
		description: "Input is just empty fields",
		input: ',,\n,,,',
		expected: {
			data: [['', '', ''], ['', '', '', '']],
			errors: []
		}
	},
	{
		description: "Input is just a string (a single field)",
		input: 'Abc def',
		expected: {
			data: [['Abc def']],
			errors: []
		}
	},
	{
		description: "Input without comments with line starting with whitespace",
		input: 'a\n b\nc',
		config: { delimiter: ',' },
		notes: "\" \" == false, but \" \" !== false, so === comparison is required",
		expected: {
			data: [['a'], [' b'], ['c']],
			errors: []
		}
	},
	{
		description: "Multiple rows, one column (no delimiter found)",
		input: 'a\nb\nc\nd\ne',
		expected: {
			data: [['a'], ['b'], ['c'], ['d'], ['e']],
			errors: []
		}
	},
	{
		description: "One column input with empty fields",
		input: 'a\nb\n\n\nc\nd\ne\n',
		expected: {
			data: [['a'], ['b'], [''], [''], ['c'], ['d'], ['e'], ['']],
			errors: []
		}
	},
{
		description: "Commented line at beginning",
		input: '# Comment!\na,b,c',
		config: { comments: true },
		expected: {
			data: [['a', 'b', 'c']],
			errors: []
		}
	},
	{
		description: "Commented line in middle",
		input: 'a,b,c\n# Comment\nd,e,f',
		config: { comments: true },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Commented line at end",
		input: 'a,true,false\n# Comment',
		config: { comments: true },
		expected: {
			data: [['a', 'true', 'false']],
			errors: []
		}
	},
	{
		description: "Two comment lines consecutively",
		input: 'a,b,c\n#comment1\n#comment2\nd,e,f',
		config: { comments: true },
		expected: {
			data: [['a', 'b', 'c'], ['d', 'e', 'f']],
			errors: []
		}
	},
	{
		description: "Two comment lines consecutively at end of file",
		input: 'a,b,c\n#comment1\n#comment2',
		config: { comments: true },
		expected: {
			data: [['a', 'b', 'c']],
			errors: []
		}
	},
	{
		description: "Three comment lines consecutively at beginning of file",
		input: '#comment1\n#comment2\n#comment3\na,b,c',
		config: { comments: true },
		expected: {
			data: [['a', 'b', 'c']],
			errors: []
		}
	},
	{
		description: "Entire file is comment lines",
		input: '#comment1\n#comment2\n#comment3',
		config: { comments: true },
		expected: {
			data: [],
			errors: []
		}
	},
    {
		description: "Input with only a commented line",
		input: '#commented line',
		config: { comments: true, delimiter: ',' },
		expected: {
			data: [],
			errors: []
		}
	},
	{
		description: "Input with only a commented line and blank line after",
		input: '#commented line\n',
		config: { comments: true, delimiter: ',' },
		expected: {
			data: [['']],
			errors: []
		}
	},
	{
		description: "Consider only 3 columns",
		input: '"a","as","asd",asdf\n"a2","as2","asd2","asdf2"',
		config: { maxColumns: { numberOfColumns: 3, cutRemaining: true } },
		expected: {
			data: [ [ 'a', 'as', 'asd' ], [ 'a2', 'as2', 'asd2' ] ],
			errors: []
		}
	},
	{
		description: "Consider only 3 columns, unite thereafter",
		input: '"a","as","asd",asdf\n"a2","as2","asd2","asdf2"',
		config: { maxColumns: { numberOfColumns: 3, cutRemaining: false } },
		expected: {
			data: [ [ 'a', 'as', 'asd",asdf' ], [ 'a2', 'as2', 'asd2,asdf2' ] ],
			errors: []
		}
	}
];

describe('csvparser test', function() {
    for (let i = 0; i < CSVPARSER_TESTS.length; i++) {
        let test = CSVPARSER_TESTS[i];
        it(test.description, function() {
            let guess = csvparse(test.input, test.config);
            assert.deepEqual(guess.data, test.expected.data);
        });
    }
});