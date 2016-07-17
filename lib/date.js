'use strict';

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

export function isDate(dateString, formatString) {
    if (getDate(dateString, formatString) === 'NaD') {
        return false;
    }
    return true;
}


export function getDate(dateString, formatString) {
    dateString = '' + dateString;

    let formattingTokens = /(\[[^\[]*\])|(\\)?(yyyy|yy|mm|m|dd|d|HH|H|MM|M|SS|S|.)/g;
    //let formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|mm?m?m?|Do|DDDo|dd?d?d?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|yyyy|yy|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    let tokens = formatString.match(formattingTokens) || [];
    let second = 0, minute = 0, hour = 0, day = null, month = null, year = null;
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
            // don't parse dates within text strings
            let skipped = dateString.substr(0, dateString.indexOf(parsedInput));
            if (skipped.length > 0) {
                return 'NaD';
            }

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

    if (year===null || month===null || day===null || checkOverflow(year, month, day, hour, minute, second)) {
        return 'NaD';
    } else {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
}

