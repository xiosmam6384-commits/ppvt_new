const questions = [
  { category: '음식', answer: '사과', options: ['사과', '바나나', '빵', '수박'], file: 'Apple_6683.svg' },
  { category: '음식', answer: '바나나', options: ['수박', '쿠키', '바나나', '사과'], file: 'Banana_6684.svg' },
  { category: '음식', answer: '빵', options: ['빵', '사과', '쿠키', '수박'], file: 'Bread_6521.svg' },
  { category: '음식', answer: '수박', options: ['바나나', '수박', '사과', '빵'], file: 'Watermelon_6692.svg' },
  { category: '음식', answer: '쿠키', options: ['쿠키', '수박', '빵', '바나나'], file: 'cookie_6637.svg' },
  { category: '동물', answer: '개', options: ['고양이', '개', '새', '물고기'], file: 'Dog_6861.svg' },
  { category: '동물', answer: '고양이', options: ['코끼리', '고양이', '개', '새'], file: 'Cat_6862.svg' },
  { category: '동물', answer: '새', options: ['물고기', '새', '개', '코끼리'], file: 'Birds_7180.svg' },
  { category: '동물', answer: '물고기', options: ['고양이', '코끼리', '물고기', '개'], file: 'Fish_6894.svg' },
  { category: '동물', answer: '코끼리', options: ['새', '개', '고양이', '코끼리'], file: 'Elephant_6863.svg' },
  { category: '생활용품', answer: '의자', options: ['가방', '의자', '창문', '시계'], file: 'Chair_7030.svg' },
  { category: '생활용품', answer: '책상', options: ['의자', '창문', '책상', '가방'], file: 'Table_7029.svg' },
  { category: '생활용품', answer: '가방', options: ['시계', '가방', '의자', '책상'], file: 'Bag_7007.svg' },
  { category: '생활용품', answer: '창문', options: ['창문', '책상', '시계', '가방'], file: 'Window_6471.svg' },
  { category: '생활용품', answer: '시계', options: ['의자', '시계', '가방', '창문'], file: 'Clock_7047.svg' },
  { category: '동작', answer: '달리기', options: ['걷기', '달리기', '춤추기', '수영하기'], file: 'Run_6808.svg' },
  { category: '동작', answer: '걷기', options: ['춤추기', '수영하기', '걷기', '양치하기'], file: 'Walk_6806.svg' },
  { category: '동작', answer: '춤추기', options: ['양치하기', '춤추기', '걷기', '달리기'], file: 'Dance_6859.svg' },
  { category: '동작', answer: '수영하기', options: ['수영하기', '달리기', '양치하기', '춤추기'], file: 'Swim_6809.svg' },
  { category: '동작', answer: '양치하기', options: ['걷기', '양치하기', '수영하기', '춤추기'], file: 'brush teeth_6246.svg' }
];

const categories = ['음식', '동물', '생활용품', '동작'];
let currentIndex = 0;
let responses = [];
let questionStartedAt = 0;
let assessmentStartedAt = 0;
let childId = '';
let examiner = '';

const el = (id) => document.getElementById(id);
const setupScreen = el('setupScreen');
const testScreen = el('testScreen');
const resultScreen = el('resultScreen');

function categorySummary() {
  return categories.map(category => {
    const categoryResponses = responses.filter(item => item.category === category);
    return { category, correct: categoryResponses.filter(item => item.correct).length, attempted: categoryResponses.length };
  });
}

function formatSeconds(milliseconds) {
  return `${(milliseconds / 1000).toFixed(1)}초`;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function updateLiveDashboard() {
  const score = responses.filter(item => item.correct).length;
  const average = responses.length ? responses.reduce((sum, item) => sum + item.responseMs, 0) / responses.length : 0;
  el('liveScore').textContent = `${score} / 20`;
  el('liveTime').textContent = responses.length ? formatSeconds(average) : '-';
  el('categoryScores').innerHTML = categorySummary().map(item => `<div class="category-row"><span>${item.category}</span><strong>${item.correct} / 5</strong></div>`).join('');
}

function handleImageError() {
  el('pictureImage').hidden = true;
  el('pictureFallback').hidden = false;
}

function presentQuestion() {
  const question = questions[currentIndex];
  el('categoryPill').textContent = question.category;
  el('progressText').textContent = `${currentIndex + 1} / ${questions.length}`;
  el('progressBar').style.width = `${(currentIndex / questions.length) * 100}%`;
  el('pictureImage').hidden = false;
  el('pictureFallback').hidden = true;
  el('pictureImage').src = `pic/${question.file}`;
  el('pictureImage').alt = `${question.category} 그림`;
  el('pictureImage').onerror = handleImageError;
  el('fileName').textContent = `그림 파일: pic/${question.file}`;
  el('feedback').textContent = '';
  el('feedback').className = 'feedback';
  el('nextButton').hidden = true;

  const letters = ['가', '나', '다', '라'];
  const shuffledOptions = shuffle(question.options);
  el('options').innerHTML = '';
  shuffledOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-button';
    button.textContent = option;
    button.dataset.letter = letters[index];
    button.addEventListener('click', () => selectAnswer(option));
    el('options').appendChild(button);
  });
  questionStartedAt = performance.now();
  updateLiveDashboard();
}

function selectAnswer(selected) {
  const question = questions[currentIndex];
  const responseMs = Math.round(performance.now() - questionStartedAt);
  const correct = selected === question.answer;
  responses.push({
    number: currentIndex + 1,
    category: question.category,
    answer: question.answer,
    selected,
    correct,
    responseMs,
    file: question.file
  });

  document.querySelectorAll('.option-button').forEach(button => {
    button.disabled = true;
    if (button.textContent === question.answer) button.classList.add('correct');
    if (button.textContent === selected && !correct) button.classList.add('wrong');
  });
  el('feedback').textContent = correct ? '정답이에요!' : `정답은 “${question.answer}”이에요.`;
  el('feedback').classList.add(correct ? 'correct' : 'wrong');
  el('nextButton').textContent = currentIndex === questions.length - 1 ? '결과 보기' : '다음 문항';
  el('nextButton').hidden = false;
  updateLiveDashboard();
}

function renderResults() {
  const totalCorrect = responses.filter(item => item.correct).length;
  const totalResponseMs = responses.reduce((sum, item) => sum + item.responseMs, 0);
  const totalElapsed = Date.now() - assessmentStartedAt;
  el('finalScore').textContent = `${totalCorrect} / 20`;
  el('finalAverageTime').textContent = formatSeconds(totalResponseMs / responses.length);
  el('totalTime').textContent = formatSeconds(totalElapsed);
  el('resultMeta').textContent = `아동 ID: ${childId}${examiner ? ` · 검사자: ${examiner}` : ''}`;
  el('finalCategoryScores').innerHTML = categorySummary().map(item => `<div class="final-category"><span>${item.category}</span><strong>${item.correct} / 5</strong><small>${item.attempted}문항 응답</small></div>`).join('');
  el('recordBody').innerHTML = responses.map(item => `<tr><td>${item.number}</td><td>${item.category}</td><td>${item.answer}</td><td>${item.selected}</td><td class="${item.correct ? 'good' : 'bad'}">${item.correct ? '정답' : '오답'}</td><td>${formatSeconds(item.responseMs)}</td><td>pic/${item.file}</td></tr>`).join('');
  el('progressBar').style.width = '100%';
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportCsv() {
  const reportRows = [
    ['그림어휘력 검사 결과'],
    ['아동 ID', childId],
    ['검사자', examiner],
    ['검사 일시', new Date().toLocaleString('ko-KR')],
    [],
    ['문항', '범주', '정답', '선택', '결과', '반응 시간(초)', '그림 파일'],
    ...responses.map(item => [item.number, item.category, item.answer, item.selected, item.correct ? '정답' : '오답', (item.responseMs / 1000).toFixed(2), `pic/${item.file}`]),
    [],
    ['총점', `${responses.filter(item => item.correct).length}/20`],
    ...categorySummary().map(item => [`${item.category} 점수`, `${item.correct}/5`])
  ];
  const csv = '\uFEFF' + reportRows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `그림어휘력검사_${childId || '결과'}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

el('setupForm').addEventListener('submit', event => {
  event.preventDefault();
  childId = el('childId').value.trim();
  examiner = el('examiner').value.trim();
  currentIndex = 0;
  responses = [];
  assessmentStartedAt = Date.now();
  setupScreen.hidden = true;
  testScreen.hidden = false;
  presentQuestion();
});

el('nextButton').addEventListener('click', () => {
  currentIndex += 1;
  if (currentIndex < questions.length) {
    presentQuestion();
  } else {
    testScreen.hidden = true;
    resultScreen.hidden = false;
    renderResults();
  }
});

el('csvButton').addEventListener('click', exportCsv);
el('restartButton').addEventListener('click', () => {
  resultScreen.hidden = true;
  setupScreen.hidden = false;
  el('setupForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

updateLiveDashboard();
