/**
 * `expand` type prompt
 */

var util = require('util');
var Paginator = require('terminal-paginator');
var BasePrompt = require('enquirer-prompt');
var log = require('log-utils');

/**
 * Constructor
 */

function Prompt(/*question, answers, rl*/) {
  BasePrompt.apply(this, arguments);

  if (!this.question.choices) {
    throw new TypeError('expected "options.choices" to be an array');
  }

  this.keymap = {};
  this.validateChoices(this.question.choices.all);
  var help = {
    key: 'h',
    name: 'Help, list all options',
    value: 'help'
  };

  // Add the default `help` (/expand) option
  this.question.choices.push(help);
  this.keymap.h = help;

  this.question.validate = function(choice) {
    if (choice == null) {
      return 'Please enter a valid command';
    }
    return choice !== 'help';
  };

  // Create the `default` string (capitalizes the default key)
  this.question.default = this.createShortcuts();
  this.paginator = new Paginator();
}

/**
 * Inherit `Base` prompt module
 */

util.inherits(Prompt, BasePrompt);

/**
 * Start the prompt session
 * @param  {Function} `cb` Callback when prompt is finished
 * @return {Object} Returns the `Prompt` instance
 */

Prompt.prototype.ask = function(cb) {
  var self = this;
  this.callback = cb;

  this.ui.on('line', function(e) {
    var event = self.getCurrentValue(e);
    if (event.value === 'help' || event.error) {
      self.onError(event);
    } else {
      self.onSubmit(event);
    }
  });

  this.ui.on('keypress', this.onKeypress.bind(this));
  this.render();
  return this;
};

/**
 * Render the prompt to the terminal
 */

Prompt.prototype.render = function(error, hint) {
  var message = this.message;
  var append = '';

  if (this.status === 'answered') {
    message += log.cyan(this.answer);
  }

  if (this.status === 'expanded') {
    var choicesStr = renderChoices(this.question.choices, this.selectedKey);
    message += this.paginator.paginate(choicesStr, this.selectedKey, this.question.pageSize);
    message += '\n  Answer: ';
  }

  message += this.rl.line;
  if (error) {
    append = log.red('>> ') + error;
  }
  if (hint) {
    append = log.cyan('>> ') + hint;
  }

  this.ui.render(message, append);
};

Prompt.prototype.onError = function(state) {
  if (state.value === 'help') {
    this.selectedKey = '';
    this.status = 'expanded';
    this.render();
    return;
  }
  this.render(state.error);
};

/**
 * When user press `enter` key
 */

Prompt.prototype.onSubmit = function(state) {
  this.status = 'answered';
  var choice = this.keymap[state.key];
  this.answer = choice.short || choice.name;

  // Re-render prompt
  this.render();
  this.ui.write();
  this.callback(state.value);
};

/**
 * When user press a key
 */

Prompt.prototype.onKeypress = function(e) {
  this.selectedKey = this.rl.line.toLowerCase();
  var selected = this.keymap[this.selectedKey];
  if (this.status === 'expanded') {
    this.render();
    return;
  }
  this.render(null, selected ? selected.name : null);
};

/**
 * Get the current value based on user input.
 *
 * @param {String} `input`
 * @return {Object}
 */

Prompt.prototype.getCurrentValue = function(input) {
  if (!input) input = this.rawDefault;
  var key = input.toLowerCase().trim();
  var val = this.keymap[key];
  if (!val) {
    var error = this.question.validate(val);
    return {error: error, value: null};
  }
  return val;
};

/**
 * Validate the choices
 * @param {Array} `choices`
 */

Prompt.prototype.validateChoices = function(choices) {
  var len = choices.length;
  var idx = -1;

  while (++idx < len) {
    var choice = choices[idx];
    if (choice.type === 'separator') {
      continue;
    }
    if (!choice.key || choice.key.length !== 1) {
      throw new Error('Format error: `key` param must be a single letter and is required.');
    }
    if (this.keymap[choice.key]) {
      throw new Error(`Duplicate key error: "key" param must be unique: ${choice.key}`);
    }
    if (choice.key === 'h') {
      throw new Error('Reserved key error: "key" param cannot be `h` - this value is reserved.');
    }
    choice.key = String(choice.key).toLowerCase();
    this.keymap[choice.key] = choice;
  }
};

/**
 * Generate a string of shortcuts from choices keys (e.g. `Yadxh`)
 * @return {String} The created shortcut string
 */

Prompt.prototype.createShortcuts = function() {
  var key = this.question.default || 0;
  var choice = this.question.choices.getChoice(key);
  var shortcuts = this.question.choices.pluck('key');
  var idx = shortcuts.indexOf(choice.key);
  this.rawDefault = choice.key;
  shortcuts[idx] = String(shortcuts[idx]).toUpperCase();
  return shortcuts.join('');
};

/**
 * Function for rendering checkbox choices
 * @param  {String} pointer Selected key
 * @return {String} Rendered content
 */

function renderChoices(choices, selectedKey) {
  var str = '';

  choices.forEach(function(choice) {
    str += '\n  ';

    if (choice.type === 'separator') {
      str += ' ' + choice;
      return;
    }

    var val = choice.key + ') ' + choice.name;
    if (selectedKey === choice.key) {
      val = log.cyan(val);
    }
    str += val;
  });

  return str;
}

/**
 * Module exports
 */

module.exports = Prompt;
