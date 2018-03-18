// TO-DO:
// Add keyboard support
// fix chaining operation on very large number

const buttons = document.querySelectorAll('button');
const screenTop = document.querySelector('#screen-top');
const screenBottom = document.querySelector('#screen-bottom');

let input = '',
  lastInput = '',
  isDotted = false,
  mathJS = false,
  displayData = 0,
  ans = 0;

buttons.forEach((btn) => {
  btn.addEventListener('click', (el) => {
    switch (el.target.className) {
      case 'digit':
        if (lastInput === '=') {
          clearAll();
        }
        input += el.target.value;
        lastInput = el.target.value;
        displayData = formatInput(input);
        screenTop.textContent = displayData;
        break;
      case 'operator':
        if (input.length < 1 && el.target.value !== '-') {
          console.log('cannot put this operator at the start of the equation');
        } else if (input === '-' && el.target.value !== '-') {
          console.log('Don\'t do this pls');
        } else {
          if (isDotted) {
            isDotted = false;
          }
          if (lastInput === 'x' || lastInput === '÷' || lastInput === '+' || lastInput === '-') {
            input = input.slice(0, -1) + el.target.value;
            lastInput = el.target.value;
            displayData = formatInput(input);
            screenTop.textContent = displayData;
          } else {
            if (lastInput === '' && el.target.value !== '-') {
              input = 0;
            }
            input += el.target.value;
            lastInput = el.target.value;
            displayData = formatInput(input);
            screenTop.textContent = displayData;
          }
        }
        break;
      case 'function':
        if (el.target.id === 'backspace') {
          if (input.length >= 1) {
            input = input.slice(0, -1);
            lastInput = el.target.value;
            displayData = formatInput(input);
            screenTop.textContent = displayData;
          }
          if (input === '') {
            screenTop.textContent = 0;
          }
        }
        if (el.target.id === 'clear-entry') {
          input = '';
          screenTop.textContent = 0;
        }
        if (el.target.id === 'clear') {
          clearAll();
        }
        if (el.target.id === 'switch') {
          toggleMathJS();
        }
        if (el.target.id === 'comma') {
          if (lastInput === '=') {
            clearAll();
          }
          if (isDotted) {
            console.log('no more dots allowed');
          } else {
            if (lastInput === '' || lastInput === 'x' || lastInput === '÷' || lastInput === '+' || lastInput === '-') {
              input += 0;
            }
            input += el.target.value;
            lastInput = el.target.value;
            displayData = formatInput(input);
            screenTop.textContent = displayData;
            isDotted = true;
          }
        }
        if (el.target.id === 'equal') {
          screenTop.textContent = formatInput(displayData) + ' =';
          compute(input);
          input = ans;
          lastInput = el.target.value;
        }
        break;
      default:
        console.log('woops something went wrong');
        break;
    }
  });
  // hover effects
  btn.addEventListener('mousemove', (e) => {
    const x = e.pageX - e.target.offsetLeft;
    const y = e.pageY - e.target.offsetTop;

    e.target.style.setProperty('--x', x + 'px');
    e.target.style.setProperty('--y', y + 'px');
  });
});

function formatInput(str) {
  // add operator in last position
  return str = str.replace(/(?<=\d)([x÷+-])(?=\d)/g, ' $1 ');
}

function clearAll() {
  input = '';
  lastInput = '';
  isDotted = false;
  displayData = 0;
  ans = 0;
  screenTop.textContent = displayData;
  screenBottom.textContent = ans;
}

function toggleMathJS() {
  const switchText = document.querySelector('#switch > span');
  if (mathJS) {
    mathJS = false;
    switchText.textContent = 'Pure JS';
  } else {
    mathJS = true;
    switchText.textContent = 'Math.js';
  }
}

function compute(str) {
  // parse string into an array
  let current = '',
    array = [];

  for (let i = 0, ch; ch = str.charAt(i); i++) {
    if ('x÷+-'.indexOf(ch) > -1) {
      if (current === '' && ch === '-') {
        current = '-';
      } else {
        array.push(parseFloat(current), ch);
        current = '';
      }
    } else {
      current += str.charAt(i);
    }
  }
  if (current !== '') {
    array.push(parseFloat(current));
  }
  operate(array);
}

function operate(equation) {
  let op, result = [],
    operator = [{
      // Basics math operations
      // respecting Order of Operations and precedence
      'x': (a, b) => a * b,
      '÷': (a, b) => a / b,
    }, {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b
    }];

  for (let i = 0; i < operator.length; i++) {
    for (let j = 0; j < equation.length; j++) {
      if (operator[i][equation[j]]) {
        op = operator[i][equation[j]];
      } else if (op) {
        result[result.length - 1] = op(result[result.length - 1], equation[j]);
        op = null;
      } else {
        result.push(equation[j]);
      }
    }
    // mathJS switch
    mathJS ? ans = math.format(result[0], { precision: 14 }) : ans = result[0];
    equation = result;
    result = [];
  }
  // return result
  if (equation.length > 1) {
    console.log('Something went wrong');
    return equation;
  } else if (equation[0] === Infinity) { // catch divide by 0
    alert('I\'m afraid I can\'t let you do that.');
    clearAll();
  } else {
    screenBottom.textContent = ans;
    return ans;
  }
}
