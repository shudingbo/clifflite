/*
 * cliff.js: CLI output formatting tools: "Your CLI Formatting Friend".
 *
 * (C) 2010, Charlie Robbins & the Contributors
 *
 */
const colors = require('colors');
const eyes = require('eyes');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


const cliff = exports;


/** stringifyRows (rows, colors)
 * Outputs the specified `rows` as fixed-width columns, adding
 * colorized headers if `colors` are supplied.
 * 
 * @param {Array[]} rows Matrix of properties to output in row major form
 * @param {String[]} colors Set of colors to use for the headers
 * @param {{columnSpacing?:number}} options 
 */
cliff.stringifyRows = function (rows, colors, options) {
  let lengths, columns, output = [], headers;

  options = options || {};
  options.columnSpacing = options.columnSpacing || 2;

  columns = columnMajor(rows);
  lengths = arrayLengths(columns);

  function stringifyRow(row, colorize) {
    let rowtext = '', padding, item, i, length;
    for (i = 0; i < row.length; i += 1) {
      item = stringifyLiteral(row[i]);

      if(colorize) {
        item = item[colors[i]] || item[colors[colors.length -1]] || item;
      }

      length = realLength(item);
      padding = length < lengths[i] ? lengths[i] - length + options.columnSpacing  : options.columnSpacing ;
      rowtext += item + new Array(padding).join(' ');
    }

    output.push(rowtext);
  }

  // If we were passed colors, then assume the first row
  // is the headers for the rows
  if (colors) {
    headers = rows.splice(0, 1)[0];
    stringifyRow(headers, true);
  }

  rows.forEach(function (row) {
    stringifyRow(row, false);
  });

  return output.join('\n');
};


/** function rowifyObjects (objs, properties, colors)
 * Extracts the lists of `properties` from the specified `objs`
 * and formats them according to `cliff.stringifyRows`.
 *
 * @param {Array} objs List of objects to create output for
 * @param {Array} properties List of properties to output
 * @param {Array} colors Set of colors to use for the specified row(s) headers.
 */
cliff.stringifyObjectRows = cliff.rowifyObjects = function (objs, properties, colors, options) {
  let rows = [properties].concat(objs.map(function (obj) {
    return extractFrom(obj, properties);
  }));

  return cliff.stringifyRows(rows, colors, options);
};


/** putRows (level, rows, colors)
 * Logs the stringified table result from `rows` at the appropriate `level`.
 * If `colors` are supplied then use those when stringifying `rows`.
 * 
 * @param {String} level Log-level to use
 * @param {Array} rows Array of rows to log at the specified level
 * @param {Array} colors Set of colors to use for the specified row(s) headers.
 */
cliff.putRows = function (level, rows, colors) {
  cliff.stringifyRows(rows, colors).split('\n').forEach(function (str) {
    let t = level+': ';
    console.log(t[level], str);
  });
};


/** putObjectRows (level, rows, colors)
 *  Logs the stringified table result from `objs` at the appropriate `level`.
 *  If `colors` are supplied then use those when stringifying `objs`.
 * @param {String} level Log-level to use
 * @param {Array} objs List of objects to create output for
 * @param {Array} properties List of properties to output
 * @param {Array} colors Set of colors to use for the headers
 */
cliff.putObjectRows = function (level, objs, properties, colors) {
  cliff.rowifyObjects(objs, properties, colors).split('\n').forEach(function (str) {
    let t = level+': ';
    console.log(t[level], str);
  });
};

cliff.arrayLengths = arrayLengths;
cliff.columnMajor = columnMajor;

//
// Expose a default `eyes` inspector.
//
cliff.inspector = eyes.inspector;
cliff.inspect   = eyes.inspector({ stream: null,
  styles: {               // Styles applied to stdout
    all:     null,        // Overall style applied to everything
    label:   'underline', // Inspection labels, like 'array' in `array: [1, 2, 3]`
    other:   'inverted',  // Objects which don't have a literal representation, such as functions
    key:     'grey',      // The keys in object literals, like 'a' in `{a: 1}`
    special: 'grey',      // null, undefined...
    number:  'blue',      // 0, 1, 2...
    bool:    'magenta',   // true false
    regexp:  'green'      // /\d+/
  }
});



function stringifyLiteral (literal) {
  switch (typeOf(literal)) {
    case 'number'   : return literal + '';
    case 'null'     : return 'null';
    case 'undefined': return 'undefined';
    case 'boolean'  : return literal + '';
    default         : return literal;
  }
};

function typeOf(value) {
  let s = typeof(value),
      types = [Object, Array, String, RegExp, Number, Function, Boolean, Date];

  if (s === 'object' || s === 'function') {
    if (value) {
      types.forEach(function (t) {
        if (value instanceof t) {
          s = t.name.toLowerCase();
        }
      });
    } else {
      s = 'null';
    }
  }

  return s;
};

function realLength(str) {
  let len = 0;
  str = escape(("" + str).replace(/\u001b\[\d+m/g,''));
  for (i=0;i<str.length;i++,len++) {
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return len;
}

function longestElement(a) {
  let l = 0;
  for (let i = 0; i < a.length; i++) {
    let new_l = realLength(a[i]);
    if (l < new_l) {
      l = new_l;
    }
  }

  return l;
}

/** 
 * Transposes the row-major Matrix, represented as an array of rows,
 * into column major form (i.e. an array of columns).
 *
 * @param {Array[]} rows Row-major Matrix to transpose
 */
function columnMajor(rows) {
  let columns = [];
  rows.forEach(function (row) {
    for (let i = 0; i < row.length; i += 1) {
      if (!columns[i]) {
        columns[i] = [];
      }

      columns[i].push(row[i]);
    }
  });

  return columns;
};

/** Creates an array with values each representing the length
 * of an array in the set provided.
 * 
 * @param {Array[]} arrs Arrays to calculate lengths for
 */
function arrayLengths(arrs) {
  let i, lengths = [];
  for (i = 0; i < arrs.length; i += 1) {
    lengths.push(longestElement(arrs[i].map(stringifyLiteral)));
  }
  return lengths;
};

/** Creates an array representing the values for `properties` in `obj`.
 * 
 * @param {Object} obj Object to extract properties from.
 * @param {Array} properties List of properties to output.
 */
function extractFrom(obj, properties) {
  return properties.map(function (p) {
    return obj[p];
  });
};