
(function app() {
  var input,
      output = document.getElementById('output'),
      chain = document.getElementById('chain'),
      operatorCount = 0, // Prevents sequential operators from being input */
      numCount = 0,
      decimalCount = 0,
      solution = false,
      error = false,
      inputArr = [],
      main = document.querySelector('main'),
      regexNumeric = /[0-9.]+$/g, // Any floating point numbers at end
      regexOperator = /[-+*\/]+$/g; // Specified operators at end

  /***** CONTROL *****/

  // Handler uses event delegation; e.target bubbles up to main
  main.onclick = getInput;

  // Get input and store to inputArr
  function getInput(e) {

    // If error has occurred allow clear button to reset
    if (error === true && e.target.id === 'c') {
      error = false;
      clear(e.target.id);
    }

    // On initial state don't accept operators or functions
    if (e.target.className === 'nonNumeric operator' && inputArr[0] === undefined ||
        e.target.className === 'nonNumeric function' && inputArr[0] === undefined) return;

    // If a solution has been calculated, check if next input is numeric or non-numeric
    if (solution === true) {

      // If numeric input, reset inputArr
      if (e.target.className === 'numeric') {
        inputArr = [];
        solution = false;

      // If non-numeric input, chain solution to next input
      } else { solution = false; }
    }

    // Special cases for buttons that perform functions
    switch (e.target.id) {
      case 'c':
        clear(e.target.id);
        break;
      case 'ce':
        clear(e.target.id);
        break;
      case 'equals':
        calculate();
        break;
    }

    // Numeric input pushed to inputArr if valid pattern
    if (e.target.nodeName === 'BUTTON' && e.target.className === 'numeric') {
      numCount++;
      input = e.target.value;

      // Decimal counter prevents more than one per numeric entry
      if (e.target.id === 'decimal') decimalCount++;
      if (decimalCount > 1 && e.target.id === 'decimal') return;

      // If inputArr is empty, clear out the default zeros
      if (inputArr[0] === undefined) clearAll();

      // Clear the output for new number if operator button pressed
      if (operatorCount === 1) clearOutput();

      operatorCount = 0;

      // If operator is present, clear for new number
      if (inputArr[inputArr.length - 1] === '+' ||
          inputArr[inputArr.length - 1] === '-' ||
          inputArr[inputArr.length - 1] === '*' ||
          inputArr[inputArr.length - 1] === '/') {
            clearOutput();
          }

      // Limit input to 9 numbers per entry
      if (numCount <= 9) {
        inputArr.push(input);
        renderOutput(input);
        renderChain(input);

      // If more than 9 numbers throw error
      } else {
        error = true;
        numCount = 0;
        inputArr = [];
        renderError();
      }

      // console.group('event info');
      //   console.log(e);
      //   console.log(e.target);
      //   console.log(e.target.nodeName);
      //   console.log(input);
      //   console.log(inputArr);
      //   console.log('error state:', error);
      //   console.log('numCount:', numCount);
      // console.groupEnd();
    }

    // Operators pushed to inputArr if valid pattern
    if (e.target.nodeName === 'BUTTON' &&
        e.target.className === 'nonNumeric operator') {

      numCount = 0;
      decimalCount = 0;

      // Only push first operator to inputArr
      operatorCount++;
      if (operatorCount === 1) {
        input = e.target.value;

        // If CE was pressed prevents pushing sequential operators
        if (inputArr[inputArr.length - 1] !== '+' &&
            inputArr[inputArr.length - 1] !== '-' &&
            inputArr[inputArr.length - 1] !== '/' &&
            inputArr[inputArr.length - 1] !== '*') {
          clearOutput();
          inputArr.push(input);
          renderChain(input);
          renderOutput(input);
        }
      }
    }
  }

  /***** MODEL *****/

  // If an error has occurred reset to default
  if (error === true) {
    clearAll();
    defaultState();
    error = false;
  }

  // Calculate values from joined array with eval()
  function calculate() {
    var searchStr = inputArr.join(''),
        solutionLength;
    error = false;
    numCount = 0;
    decimalCount = 0;

    // If last index is operator don't eval
    if (inputArr[inputArr.length - 1] === String(searchStr.match(regexOperator))) return;

    // Eval runs JS evaluator on joined expression
    solution = eval(inputArr.join(''));
    solutionLength = solution.toString().length;
    inputArr = [solution];

    // If solution exceeds 10 digits display error message
    if (solutionLength >= 10) {
      error = true;
      inputArr = [];
      renderError();
    } else {
      renderSolution(solution);
      solution = true;
    }
  }

  // Clear functions for C and CE buttons
  function clear(target) {
    var lastValue, searchStr;

    numCount = 0;

    // C - clears all
    operatorCount = 0;
    if (target === 'c') {
      inputArr = [];
      decimalCount = 0;
      numCount = 0;
      clearAll();
      defaultState();

    // CE - clears last entry
    } else if (target === 'ce') {
      searchStr = inputArr.join('');

      // If number is last regex match:
      if (searchStr.match(regexNumeric)) {
        inputArr = searchStr.replace(regexNumeric, '').split(''); // remove entry
        lastValue = inputArr[inputArr.length - 1]; // assign operator as lastValue
      }

      // If operator is last regex match
      if (searchStr.match(regexOperator)) {
        inputArr.pop() // remove operator
        searchStr = inputArr.join('');
        lastValue = searchStr.match(regexNumeric);
      }
      clearLastEntry(lastValue);
    }
  }

  /***** VIEW *****/

  defaultState();

  // Displays zeros in output and chain
  function defaultState() {
    var spanOutput,
        textOutput,
        spanChain,
        textChain;

    inputArr = [];
    clearAll();

    spanOutput = document.createElement('span');
    spanOutput.setAttribute('class', 'output');
    textOutput = document.createTextNode('0');
    spanOutput.appendChild(textOutput);
    output.appendChild(spanOutput);

    spanChain = document.createElement('span');
    spanChain.setAttribute('class', 'chain');
    textChain = document.createTextNode('0');
    spanChain.appendChild(textChain);
    chain.appendChild(spanChain);
  }

  function clearAll() {
    output.textContent = '';
    chain.textContent = '';
  }

  function clearOutput() {
    output.textContent = '';
  }

  function clearLastEntry(lastValue) {
    var spanOutput,
        textOutput,
        spanChain,
        textChain;

    if (inputArr.length < 1) {
      clearAll();
      defaultState();
    } else {
      clearAll();
      spanOutput = document.createElement('span');
      spanOutput.setAttribute('class', 'output');
      textOutput = document.createTextNode(lastValue);
      spanOutput.appendChild(textOutput);
      output.appendChild(spanOutput);

      spanChain = document.createElement('span');
      spanChain.setAttribute('class', 'chain');
      textChain = document.createTextNode(inputArr.join(''));
      spanChain.appendChild(textChain);
      chain.appendChild(spanChain);
    }
  }

  // Renders numbers only
  function renderOutput(input) {
    var span, value;

    span = document.createElement('span');
    span.setAttribute('class', 'output');
    value = document.createTextNode(input);
    span.appendChild(value);
    output.appendChild(span);
  }

  // Renders numbers and operators in chain
  function renderChain(input) {
    var span,
        value,
        chainedOutput;

    span = document.createElement('span');
    span.setAttribute('class', 'chain');
    value = document.createTextNode(input);
    span.appendChild(value);
    chain.appendChild(span);
  }

  function renderSolution(solution) {
    var spanOutput,
        textOutput,
        spanChain,
        textChain;
    clearAll();

    spanOutput = document.createElement('span');
    spanOutput.setAttribute('class', 'output');
    textOutput = document.createTextNode(solution);
    spanOutput.appendChild(textOutput);
    output.appendChild(spanOutput);

    spanChain = document.createElement('span');
    spanChain.setAttribute('class', 'chain');
    textChain = document.createTextNode(solution);
    spanChain.appendChild(textChain);
    chain.appendChild(spanChain);
  }

  function renderError() {
    var spanOutput,
        textOutput,
        spanChain,
        textChain;
    clearAll();

    spanOutput = document.createElement('span');
    spanOutput.setAttribute('class', 'output');
    textOutput = document.createTextNode('0');
    spanOutput.appendChild(textOutput);
    output.appendChild(spanOutput);

    spanChain = document.createElement('span');
    spanChain.setAttribute('class', 'chain');
    textChain = document.createTextNode('Digit limit met');
    spanChain.appendChild(textChain);
    chain.appendChild(spanChain);
  }
})();

/***** NOTES *****

TODO: Round floating point numbers to display N digits ex. 89/6
TODO: Incorporate keyboard input
TODO: Fix negative return values, if CE pressed clear both - and value
TODO: Refactor with jQuery to simplify View logic :-)

Requirements from Free Code Camp advanced project 1:
https://www.freecodecamp.org/challenges/build-a-javascript-calculator

  -- Build a CodePen.io app that is functionally similar to this: https://codepen.io/FreeCodeCamp/full/rLJZrA/.
  -- I can add, subtract, multiply and divide two numbers.
  -- I can clear the input field with a clear button.
  -- I can keep chaining mathematical operations together until I hit the equal button, and the calculator will tell me the correct output.


Event Delegation:
https://davidwalsh.name/event-delegate
Can use Element.matches API to target more specific selectors:
https://davidwalsh.name/element-matches-selector

*/
