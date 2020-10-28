const cliff = require('../lib/cliff');

var rows = [
  ['Name',  'Flavor',    'Dessert'],
  ['Alice', 'cherry',    /^aa/],
  ['Bob',   'carmel',    undefined],
  ['Joe',   'chocolate', null],
  ['Nick',  'vanilla',   111]
];

console.log(cliff.stringifyRows(rows, ['red', 'blue', 'green']));
cliff.putRows('data', rows, ['red', 'blue', 'green']);

var objs = [], obj = {
  name: "bazz",
  address: "1234 Nowhere Dr.",
};

for (var i = 0; i < 10; i++) {
  objs.push({
    name: obj.name,
    address: obj.address,
    id: Math.random().toString()
  });
}

console.log(cliff.stringifyObjectRows(objs, ['id', 'name', 'address'], ['red', 'blue', 'green']));
cliff.putObjectRows('data', objs, ['id', 'name', 'address']);


var rowsClr = [
  ['Name',        'Flavor',              'Dessert'],
  ['Alice'.grey,  'cherry'.cyan,         'yogurt'.yellow],
  ['Bob'.magenta, 'carmel'.rainbow,      'apples'.white],
  ['Joe'.italic,  'chocolate'.underline, 'cake'.inverse],
  ['Nick'.bold,   'vanilla',             'ice cream']
];

cliff.putRows('data', rowsClr, ['red', 'blue', 'green']);

cliff.