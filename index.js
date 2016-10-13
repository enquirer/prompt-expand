/**
 * `expand` type prompt
 */

var util = require('util');
var Paginator = require('terminal-paginator');
var Prompt = require('prompt-base');
var log = require('log-utils');

/**
 * Constructor
 */

function Expand(/*question, answers, ui*/) {
  Prompt.apply(this, arguments);

  if (!this.choices) {
    throw new TypeError('expected "options.choices" to be an object or array');
  }

  this.keymap = {};
  this.validateChoices(this.choices);
  var help = {
    key: 'h',
    name: 'Help, list all options',
    value: 'help'
  };

  // Add the default `help` (/expand) option
  this.choices.items.push(help);
  var keymap = this.keymap;
  keymap.h = help;

  this.question.validate = function(line) {
    var choice = keymap[line];
    if (choice == null) {
      return 'Please enter a valid command';
    }
    // no error
    return false;
  };

  // Create the `default` string (capitalizes the default key)
  this.question.default = this.createShortcuts();
  this.choices.options.symbol = '';
  this.choices.options.format = function() {
    var val = this.key + ') ' + this.name;
    if (this.key === this.position) {
      val = log.cyan(val);
    }
    return val;
  };

  this.paginator = new Paginator(this.options.pageSize);
}

/**
 * Inherit `Base` prompt module
 */

util.inherits(Expand, Prompt);

/**
 * Start the prompt
 * @param  {Function} `cb` Callback to call with the answer when the answer is submitted.
 * @return {Object} Returns the `Prompt` instance
 * @api public
 */

Expand.prototype.ask = function(cb) {
  this.callback = cb;
  this.ui.on('line', this.onSubmit.bind(this));
  this.ui.on('keypress', this.onKeypress.bind(this));
  this.render();
  return this;
};

/**
 * Get the current value based on user input.
 *
 * @param {String} `input`
 * @return {Object}
 */

Expand.prototype.getCurrentValue = function(event) {
  var input = event.key.name;
  if (!input) input = this.rawDefault;
  var key = input.toLowerCase().trim();
  var val = this.keymap[key];
  if (!val) {
    var error = this.question.validate(key);
    return {error: error, value: null};
  }
  return val;
};

/**
 * Render the prompt to the terminal
 */

Expand.prototype.render = function(error, hint) {
  var message = this.message;
  var append = '';

  if (this.status === 'answered') {
    message += log.cyan(this.answer);
  }

  if (this.status === 'expanded') {
    var choicesStr = '\n' + this.choices.render(this.position);
    message += this.paginator.paginate(choicesStr, this.position);
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

/**
 * When the answer is submitted (user presses `enter` key), re-render
 * and pass answer to callback.
 *
 * @param {Object} `event`
 */

Expand.prototype.onSubmit = function(line) {
  var error = this.question.validate(line);
  if (error) {
    return this.onError(error);
  }

  var choice = this.keymap[line];
  if (choice.value === 'help') {
    this.status = 'expanded';
    this.render();
    return;
  }

  this.status = 'answered';
  this.answer = choice.value;
  this.submitAnswer();
};

/**
 * When the user presses a key.
 */

Expand.prototype.onKeypress = function(e) {
  var event = this.getCurrentValue(e);
  if (event && event.error) {
    this.onError(event.error);
    return;
  }

  this.position = this.rl.line.toLowerCase();
  var selected = this.keymap[this.position];
  this.render(null, selected ? selected.name : null);
};

/**
 * Handle error events
 * @param {Object} `event`
 */

Expand.prototype.onHelp = function(event) {
  this.render(event.help);
};

/**
 * Handle error events
 * @param {Object} `event`
 */

Expand.prototype.onError = function(error) {
  this.render(error);
};

/**
 * Validate the choices
 * @param {Array} `choices`
 */

Expand.prototype.validateChoices = function(choices) {
  var len = choices.items.length;
  var idx = -1;

  while (++idx < len) {
    var choice = choices.items[idx];
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

Expand.prototype.createShortcuts = function() {
  var key = this.question.default || 0;
  var shortcuts = this.choices.pluck('key');
  var idx = shortcuts.indexOf(key);
  this.rawDefault = key;
  shortcuts[idx] = String(shortcuts[idx]).toUpperCase();
  return shortcuts.join('');
};

/**
 * Module exports
 */

module.exports = Expand;
