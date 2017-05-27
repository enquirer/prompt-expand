var Prompt = require('..');
var prompt = new Prompt({
  message: 'Conflict on file.js',
  name: 'conflict',
  default: 'x',
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
    new Prompt.Separator(),
    {
      key: 'x',
      name: 'Abort',
      value: 'abort'
    }
  ]
});

prompt.run()
  .then(function(answer) {
    console.log({file: answer});
  })
  .catch(function(err) {
    console.log(err);
  });
