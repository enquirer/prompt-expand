var Enquirer = require('enquirer');
var enquirer = new Enquirer();

enquirer.register('expand', require('..'));

(async function() {

var questions = [
  {
    type: 'expand',
    message: 'Conflict on `file.js`: ',
    default: 'x',
    name: 'file',
    choices: [
      {
        key: 'y',
        name: 'Overwrite',
        value: 'overwrite'
      },
      {
        key: 'a',
        name: 'Overwrite this one and all next',
        value: 'overwrite_all'
      },
      {
        key: 'd',
        name: 'Show diff',
        value: 'diff'
      },
      enquirer.separator(),
      {
        key: 'x',
        name: 'Abort',
        value: 'abort'
      }
    ]
  }
];

const answer = await enquirer.ask(questions).catch(console.error);
console.log(answer);

})();
