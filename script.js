// Simple calculator logic
const screen = document.getElementById('screen');
const buttons = document.querySelectorAll('.btn');

let expression = ''; // current expression string

function updateScreen(value){
  screen.textContent = value;
}

function safeEval(expr){
  // allow only digits, operators, parentheses, decimal point and spaces
  if(!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Invalid characters');
  // replace ×/÷ with */ for evaluation safety (we store standard operators anyway)
  // Evaluate using Function constructor; caught by try/catch
  // Note: this is sufficient for a simple calculator UI; do not evaluate untrusted server input.
  // Prevent sequences like "++" or "--" becoming a problem: let JS handle exceptions
  // We also check for division by zero after evaluation
  // Evaluate:
  return Function(`"use strict"; return (${expr})`)();
}

function appendValue(val){
  // Prevent multiple leading zeros like "00"
  if(expression === '0' && val === '0') return;
  // Prevent multiple dots in the same number: basic check
  if(val === '.'){
    // find last operator position
    const lastOp = Math.max(...['+','-','*','/'].map(o => expression.lastIndexOf(o)));
    const lastNumber = expression.slice(lastOp + 1);
    if(lastNumber.includes('.')) return;
    if(lastNumber === '') expression += '0'; // leading dot -> 0.
  }
  expression += val;
  updateScreen(expression);
}

function clearAll(){
  expression = '';
  updateScreen('0');
}

function backspace(){
  expression = expression.slice(0, -1);
  updateScreen(expression || '0');
}

function calculate(){
  if(expression.trim() === '') return;
  try{
    const result = safeEval(expression);
    if(!isFinite(result) || Number.isNaN(result)) {
      updateScreen('Error');
      expression = '';
    } else {
      // Trim long floats
      const display = (Math.round((result + Number.EPSILON) * 1e12) / 1e12).toString();
      updateScreen(display);
      expression = display;
    }
  } catch (e){
    updateScreen('Error');
    expression = '';
  }
}

// Button clicks
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');

    if(action === 'clear'){ clearAll(); return; }
    if(action === 'back'){ backspace(); return; }
    if(action === 'equals'){ calculate(); return; }

    if(val){
      // convert visible operators to JS-friendly where needed
      const map = { '×':'*', '÷':'/' };
      const toAppend = map[val] || val;
      appendValue(toAppend);
    }
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if(/^[0-9]$/.test(key)) { appendValue(key); e.preventDefault(); return; }
  if(key === '.') { appendValue('.'); e.preventDefault(); return; }
  if(key === 'Enter' || key === '=') { calculate(); e.preventDefault(); return; }
  if(key === 'Backspace') { backspace(); e.preventDefault(); return; }
  if(key === 'Escape') { clearAll(); e.preventDefault(); return; }
  if(['+','-','*','/','(',')'].includes(key)) { appendValue(key); e.preventDefault(); return; }
});

// initialize
clearAll();