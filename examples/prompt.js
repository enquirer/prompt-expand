(async function() {

var Prompt = require('..');
var prompt = new Prompt({
  message: 'Conflict on file.js',
  name: 'conflict',
  default: 'x',
  choices: [
    {
      key: 'y',
      name: 'Yes, overwrite this file',
      value: 'yes'
    },
    {
      key: 'n',
      name: 'No, do not overwrite this file',
      value: 'no'
    },
    {
      key: 'a',
      name: 'Overwrite this file and all remaining files',
      value: 'all'
    },
    {
      key: 'x',
      name: 'Abort',
      value: 'abort'
    },
    {
      key: 'd',
      name: 'Show the difference between the existing and the new',
      value: 'diff'
    }
  ]
});

console.log(await prompt.run());

})();
