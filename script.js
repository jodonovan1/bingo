const DIVISORS = [2, 3, 4, 5, 6, 9, 10];

const setupPanel = document.getElementById('setupPanel');
const gamePanel = document.getElementById('gamePanel');
const projectedGrid = document.getElementById('projectedGrid');
const questionText = document.getElementById('questionText');
const answerChoices = document.getElementById('answerChoices');
const feedback = document.getElementById('feedback');
const roundLabel = document.getElementById('roundLabel');

const newGridBtn = document.getElementById('newGridBtn');
const startBtn = document.getElementById('startBtn');
const revealBtn = document.getElementById('revealBtn');
const nextBtn = document.getElementById('nextBtn');
const checkSoFarBtn = document.getElementById('checkSoFarBtn');
const backToGridBtn = document.getElementById('backToGridBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const answersModal = document.getElementById('answersModal');
const answersSoFarList = document.getElementById('answersSoFarList');
const closeModalBtn = document.getElementById('closeModalBtn');

let currentQuestion = null;
let questionNumber = 0;
let recentNumbers = [];
let answersSoFar = [];

const explanations = {
  2: number => `${number} can be divided by 2 because it ends in an even digit.`,
  3: number => `${number} can be divided by 3 because the sum of its digits is ${digitSum(number)}, which is divisible by 3.`,
  4: number => `${number} can be divided by 4 because the last two digits, ${lastTwoDigits(number)}, are divisible by 4.`,
  5: number => `${number} can be divided by 5 because it ends in 0 or 5.`,
  6: number => `${number} can be divided by 6 because it is divisible by both 2 and 3.`,
  9: number => `${number} can be divided by 9 because the sum of its digits is ${digitSum(number)}, which is divisible by 9.`,
  10: number => `${number} can be divided by 10 because it ends in 0.`
};

function generateGrid() {
  projectedGrid.innerHTML = '';

  // Ensure every divisor appears at least once, then fill remaining spaces randomly.
  const gridValues = [...DIVISORS];
  while (gridValues.length < 16) {
    gridValues.push(randomItem(DIVISORS));
  }

  shuffle(gridValues);

  gridValues.forEach(value => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.textContent = value;
    projectedGrid.appendChild(cell);
  });
}

function startGame() {
  setupPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  questionNumber = 0;
  recentNumbers = [];
  answersSoFar = [];
  nextQuestion();
}

function backToGrid() {
  gamePanel.classList.add('hidden');
  setupPanel.classList.remove('hidden');
}

function nextQuestion() {
  currentQuestion = generateQuestion();
  questionNumber += 1;

  answersSoFar.push({
    questionNumber,
    number: currentQuestion.number,
    answer: currentQuestion.correctDivisor
  });

  roundLabel.textContent = `Question ${questionNumber}`;
  questionText.textContent = `Which ONE number can ${currentQuestion.number} be divided by?`;

  answerChoices.innerHTML = '';
  currentQuestion.answers.forEach(answer => {
    const button = document.createElement('button');
    button.className = 'choice-card';
    button.type = 'button';
    button.textContent = answer;
    answerChoices.appendChild(button);
  });

  feedback.classList.add('hidden');
  feedback.textContent = '';
  revealBtn.disabled = false;
}

function revealAnswer() {
  if (!currentQuestion) return;

  const choiceButtons = document.querySelectorAll('.choice-card');
  choiceButtons.forEach(button => {
    if (Number(button.textContent) === currentQuestion.correctDivisor) {
      button.classList.add('correct');
    }
  });

  feedback.innerHTML = `<strong>Answer: ${currentQuestion.correctDivisor}</strong><br>${explanations[currentQuestion.correctDivisor](currentQuestion.number)}`;
  feedback.classList.remove('hidden');
  revealBtn.disabled = true;
}

function showAnswersSoFar() {
  answersSoFarList.innerHTML = '';

  if (answersSoFar.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No questions have been asked yet.';
    answersSoFarList.appendChild(emptyMessage);
  } else {
    answersSoFar.forEach(item => {
      const row = document.createElement('div');
      row.className = 'answer-history-row';

      const question = document.createElement('span');
      question.textContent = `Question ${item.questionNumber}`;

      const answer = document.createElement('span');
      answer.className = 'answer-history-answer';
      answer.textContent = item.answer;

      row.appendChild(question);
      row.appendChild(answer);
      answersSoFarList.appendChild(row);
    });
  }

  answersModal.classList.remove('hidden');
}

function closeAnswersSoFar() {
  answersModal.classList.add('hidden');
}

function generateQuestion() {
  for (let attempt = 0; attempt < 10000; attempt++) {
    const correctDivisor = randomItem(DIVISORS);
    const number = randomThreeDigitNumber();

    if (recentNumbers.includes(number)) continue;
    if (!isDivisible(number, correctDivisor)) continue;

    const validDistractors = DIVISORS.filter(divisor => {
      return divisor !== correctDivisor && !isDivisible(number, divisor);
    });

    if (validDistractors.length >= 2) {
      shuffle(validDistractors);
      const answers = [correctDivisor, validDistractors[0], validDistractors[1]];
      shuffle(answers);

      rememberNumber(number);

      return {
        number,
        correctDivisor,
        answers
      };
    }
  }

  // Fallback should be extremely rare. It protects the app from freezing.
  return {
    number: 326,
    correctDivisor: 2,
    answers: [2, 5, 9]
  };
}

function isDivisible(number, divisor) {
  return number % divisor === 0;
}

function randomThreeDigitNumber() {
  return Math.floor(Math.random() * 900) + 100;
}

function digitSum(number) {
  return String(number)
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

function lastTwoDigits(number) {
  return String(number).slice(-2).padStart(2, '0');
}

function rememberNumber(number) {
  recentNumbers.push(number);
  if (recentNumbers.length > 20) {
    recentNumbers.shift();
  }
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

newGridBtn.addEventListener('click', generateGrid);
startBtn.addEventListener('click', startGame);
revealBtn.addEventListener('click', revealAnswer);
nextBtn.addEventListener('click', nextQuestion);
checkSoFarBtn.addEventListener('click', showAnswersSoFar);
closeModalBtn.addEventListener('click', closeAnswersSoFar);
answersModal.addEventListener('click', event => {
  if (event.target === answersModal) {
    closeAnswersSoFar();
  }
});
backToGridBtn.addEventListener('click', backToGrid);
fullscreenBtn.addEventListener('click', toggleFullscreen);

generateGrid();
