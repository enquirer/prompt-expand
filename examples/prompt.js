var Prompt = require('..');
var prompt = new Prompt({
  message: 'Conflict on file.js',
  name: 'conflict',
  default: 'x',
  choices: [
    {
      key: 'y',
      name: 'Yes, overwrite this file',
      value: 'Overwrite'
    },
    {
      key: 'a',
      name: 'Overwrite this file and all remaining files',
      value: 'Overwrite All'
    },
    {
      key: 'n',
      name: 'No, do not overwrite this file',
      value: 'No'
    },
    {
      key: 'x',
      name: 'Abort',
      value: 'Abort'
    },
    {
      key: 'd',
      name: 'Show the difference between the existing and the new',
      value: 'Diff'
    }
  ]
  // choices: [
  //   {
  //     key: 'y',
  //     name: 'Overwrite',
  //     value: 'overwrite'
  //   },
  //   {
  //     key: 'a',
  //     name: 'Overwrite this one and all next',
  //     value: 'overwrite_all'
  //   },
  //   {
  //     key: 'd',
  //     name: 'Show diff',
  //     value: 'diff'
  //   },
  //   new Prompt.Separator(),
  //   {
  //     key: 'x',
  //     name: 'Abort',
  //     value: 'abort'
  //   }
  // ]
});

prompt
  .run()
  .then(function(answer) {
    console.log({ file: answer });
  })
  .catch(function(err) {
    console.log(err);
  });
