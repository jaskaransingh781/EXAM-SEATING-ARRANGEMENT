const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const updateHallBtn = document.getElementById('updateHallBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const sortNameBtn = document.getElementById('sortNameBtn');
const sortRollBtn = document.getElementById('sortRollBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const openConstraintModalBtn = document.getElementById('openConstraintModalBtn');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const seatingGrid = document.getElementById('seatingGrid');
const studentTableBody = document.querySelector('#studentTable tbody');
const constraintsList = document.getElementById('constraintsList');
const messagePanel = document.getElementById('messagePanel');
const studentCount = document.getElementById('studentCount');
const seatCount = document.getElementById('seatCount');
const constraintsCount = document.getElementById('constraintsCount');
const gridDimensions = document.getElementById('gridDimensions');
const constraintModal = document.getElementById('constraintModal');
const closeConstraintModalBtn = document.getElementById('closeConstraintModalBtn');
const cancelConstraintBtn = document.getElementById('cancelConstraintBtn');
const saveConstraintBtn = document.getElementById('saveConstraintBtn');
const constraintRoll1 = document.getElementById('constraintRoll1');
const constraintRoll2 = document.getElementById('constraintRoll2');
const studentNameInput = document.getElementById('studentNameInput');
const studentRollInput = document.getElementById('studentRollInput');

const state = {
  rows: Number(rowsInput.value) || 3,
  cols: Number(colsInput.value) || 4,
  students: [
    { name: 'JASKARAN SINGH', rollNumber: '24BET10169', seatNumber: -1 },
    { name: 'SAKSHI', rollNumber: '24BET10158', seatNumber: -1 },
    { name: 'RAVNEET KAUR', rollNumber: '24BET10161', seatNumber: -1 },
    { name: 'YUVRAJ SINGH', rollNumber: '24BET10177', seatNumber: -1 },
    { name: 'MUSKAN', rollNumber: '24BET10166', seatNumber: -1 },
    { name: 'DEEPAK', rollNumber: '24BET10164', seatNumber: -1 },
    { name: 'ASHUTOSH SONI', rollNumber: '24BET10155', seatNumber: -1 },
    { name: 'AKHIL SHARMA', rollNumber: '24BET10154', seatNumber: -1 },
    { name: 'MANJEET KUMAR', rollNumber: '24BET10181', seatNumber: -1 },
    { name: 'DHRUV SHARMA', rollNumber: '24BET10180', seatNumber: -1 },
    { name: 'ARSHDEEP SINGH', rollNumber: '24BET10184', seatNumber: -1 },
    { name: 'SALONI', rollNumber: '24BET10160', seatNumber: -1 }
  ],
  cheatingConstraints: {
    '24BET10169': new Set(['24BET10158']),
    '24BET10158': new Set(['24BET10169'])
  }
};

function showMessage(text, type = 'success') {
  messagePanel.className = 'message-panel ' + type;
  messagePanel.textContent = text;
}

function clearMessage() {
  messagePanel.className = 'message-panel';
  messagePanel.textContent = '';
}

function updateSummary() {
  studentCount.textContent = state.students.length;
  seatCount.textContent = state.rows * state.cols;
  const constraintPairs = Object.values(state.cheatingConstraints).reduce((total, set) => total + set.size, 0) / 2;
  constraintsCount.textContent = constraintPairs;
  gridDimensions.textContent = `${state.rows} × ${state.cols}`;
}

function normalizeRoll(value) {
  return value.trim().toUpperCase();
}

function renderStudentTable() {
  studentTableBody.innerHTML = '';

  state.students.forEach((student, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.rollNumber}</td>
      <td>${student.seatNumber > 0 ? student.seatNumber : '—'}</td>
      <td><button class="button muted" data-index="${index}">Remove</button></td>
    `;
    studentTableBody.appendChild(row);
  });
}

function renderConstraintsList() {
  constraintsList.innerHTML = '';
  const pairs = [];

  Object.keys(state.cheatingConstraints).forEach((roll) => {
    state.cheatingConstraints[roll].forEach((target) => {
      if (roll < target) {
        pairs.push({ roll, target });
      }
    });
  });

  if (pairs.length === 0) {
    constraintsList.innerHTML = '<p class="hint">No constraints defined yet.</p>';
    return;
  }

  pairs.forEach((pair) => {
    const card = document.createElement('div');
    card.className = 'constraint-item';
    card.innerHTML = `
      <div><strong>${pair.roll}</strong> cannot sit near <strong>${pair.target}</strong></div>
      <button class="button muted" data-roll="${pair.roll}" data-target="${pair.target}">Remove</button>
    `;
    constraintsList.appendChild(card);
  });
}

function removeConstraint(roll, target) {
  if (state.cheatingConstraints[roll]) {
    state.cheatingConstraints[roll].delete(target);
    if (state.cheatingConstraints[roll].size === 0) {
      delete state.cheatingConstraints[roll];
    }
  }

  if (state.cheatingConstraints[target]) {
    state.cheatingConstraints[target].delete(roll);
    if (state.cheatingConstraints[target].size === 0) {
      delete state.cheatingConstraints[target];
    }
  }

  renderConstraintsList();
  updateSummary();
  showMessage(`Removed constraint between ${roll} and ${target}.`, 'success');
}

function handleConstraintListClick(event) {
  const button = event.target.closest('button[data-roll][data-target]');
  if (!button) return;

  const roll = button.dataset.roll;
  const target = button.dataset.target;
  removeConstraint(roll, target);
}

function renderSeatingGrid() {
  seatingGrid.innerHTML = '';
  seatingGrid.style.gridTemplateColumns = `repeat(${state.cols}, minmax(140px, 1fr))`;

  const totalCells = state.rows * state.cols;
  const studentBySeat = Array(totalCells).fill(null);
  state.students.forEach((student) => {
    if (student.seatNumber > 0) {
      const index = student.seatNumber - 1;
      if (index < totalCells) {
        studentBySeat[index] = student;
      }
    }
  });

  for (let i = 0; i < totalCells; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    if (!studentBySeat[i]) {
      cell.classList.add('empty');
      cell.innerHTML = `<strong>Seat ${i + 1}</strong><small>Empty</small>`;
    } else {
      const student = studentBySeat[i];
      cell.innerHTML = `
        <strong>${student.name}</strong>
        <small>${student.rollNumber}</small>
      `;
    }

    seatingGrid.appendChild(cell);
  }
}

function studentExists(rollNumber) {
  return state.students.some((student) => student.rollNumber === rollNumber);
}

function addStudent() {
  const name = studentNameInput.value.trim();
  const rollNumber = normalizeRoll(studentRollInput.value);

  if (!name || !rollNumber) {
    showMessage('Please provide both name and roll number.', 'warning');
    return;
  }

  if (studentExists(rollNumber)) {
    showMessage(`Student with roll number ${rollNumber} already exists.`, 'error');
    return;
  }

  state.students.push({ name, rollNumber, seatNumber: -1 });
  studentNameInput.value = '';
  studentRollInput.value = '';
  renderStudentTable();
  updateSummary();
  clearMessage();
}

function removeStudent(index) {
  const removed = state.students.splice(index, 1)[0];
  if (state.cheatingConstraints[removed.rollNumber]) {
    delete state.cheatingConstraints[removed.rollNumber];
  }

  Object.keys(state.cheatingConstraints).forEach((roll) => {
    if (state.cheatingConstraints[roll].has(removed.rollNumber)) {
      state.cheatingConstraints[roll].delete(removed.rollNumber);
    }
  });

  renderStudentTable();
  renderConstraintsList();
  updateSummary();
  showMessage(`Removed student ${removed.name} (${removed.rollNumber}).`, 'success');
}

function shuffleStudents() {
  for (let i = state.students.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.students[i], state.students[j]] = [state.students[j], state.students[i]];
  }

  state.students.forEach((student) => {
    student.seatNumber = -1;
  });
  renderStudentTable();
  showMessage('Student roster shuffled randomly.', 'success');
}

function sortStudentsBy(field) {
  state.students.sort((a, b) => {
    if (a[field] < b[field]) return -1;
    if (a[field] > b[field]) return 1;
    return 0;
  });

  state.students.forEach((student) => {
    student.seatNumber = -1;
  });
  renderStudentTable();
  clearMessage();
}

function openConstraintModal() {
  constraintRoll1.value = '';
  constraintRoll2.value = '';
  constraintModal.classList.remove('hidden');
}

function closeConstraintModal() {
  constraintModal.classList.add('hidden');
}

function addConstraint() {
  const roll1 = normalizeRoll(constraintRoll1.value);
  const roll2 = normalizeRoll(constraintRoll2.value);

  if (!roll1 || !roll2) {
    showMessage('Both roll numbers are required for a constraint.', 'warning');
    return;
  }

  if (roll1 === roll2) {
    showMessage('A student cannot be constrained with themselves.', 'error');
    return;
  }

  if (!studentExists(roll1) || !studentExists(roll2)) {
    showMessage('Both roll numbers must exist in the student roster.', 'error');
    return;
  }

  state.cheatingConstraints[roll1] = state.cheatingConstraints[roll1] || new Set();
  state.cheatingConstraints[roll2] = state.cheatingConstraints[roll2] || new Set();
  state.cheatingConstraints[roll1].add(roll2);
  state.cheatingConstraints[roll2].add(roll1);

  renderConstraintsList();
  updateSummary();
  showMessage(`Constraint added: ${roll1} vs ${roll2}`, 'success');
  closeConstraintModal();
}

function updateHall() {
  const rows = Number(rowsInput.value);
  const cols = Number(colsInput.value);

  if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(cols) || cols < 1) {
    showMessage('Please enter valid positive numbers for rows and columns.', 'warning');
    return;
  }

  state.rows = rows;
  state.cols = cols;
  gridDimensions.textContent = `${rows} × ${cols}`;
  seatCount.textContent = rows * cols;
  state.students.forEach((student) => {
    student.seatNumber = -1;
  });
  renderSeatingGrid();
  showMessage('Hall dimensions updated.', 'success');
}

function assignSeatNumbersAndExpand() {
  if (state.students.length === 0) {
    showMessage('Student roster is empty. Add students before generating seating.', 'warning');
    return;
  }

  state.students.forEach((student) => {
    student.seatNumber = -1;
  });

  let rows = state.rows;
  let cols = state.cols;
  let grid = Array.from({ length: rows }, () => Array(cols).fill(-1));

  const canPlaceAt = (studentIndex, r, c) => {
    const currentRoll = state.students[studentIndex].rollNumber;

    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const neighborIndex = grid[nr][nc];
        if (neighborIndex === -1) continue;
        const neighborRoll = state.students[neighborIndex].rollNumber;
        const blocked = state.cheatingConstraints[currentRoll] && state.cheatingConstraints[currentRoll].has(neighborRoll);
        if (blocked) {
          return false;
        }
      }
    }
    return true;
  };

  for (let i = 0; i < state.students.length; i += 1) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 1000) {
      for (let r = 0; r < rows && !placed; r += 1) {
        for (let c = 0; c < cols && !placed; c += 1) {
          if (grid[r][c] !== -1) continue;
          if (canPlaceAt(i, r, c)) {
            grid[r][c] = i;
            state.students[i].seatNumber = r * cols + c + 1;
            placed = true;
          }
        }
      }

      if (!placed) {
        rows += 1;
        grid.push(Array(cols).fill(-1));
      }
      attempts += 1;
    }

    if (!placed) {
      showMessage(`Unable to place student ${state.students[i].rollNumber} due to conflicting constraints.`, 'error');
      return;
    }
  }

  state.rows = rows;
  state.cols = cols;
  updateSummary();
  renderStudentTable();
  renderSeatingGrid();
  showMessage('Seating arrangement generated successfully.', 'success');
}

function resetLayout() {
  state.rows = Number(rowsInput.value) || state.rows;
  state.cols = Number(colsInput.value) || state.cols;
  state.students.forEach((student) => {
    student.seatNumber = -1;
  });
  renderSeatingGrid();
  renderStudentTable();
  showMessage('Layout reset. You can generate seating again.', 'success');
}

function handleTableActions(event) {
  if (!event.target.matches('button[data-index]')) return;
  const index = Number(event.target.dataset.index);
  removeStudent(index);
}

function initialize() {
  renderStudentTable();
  renderConstraintsList();
  renderSeatingGrid();
  updateSummary();
  clearMessage();

  updateHallBtn.addEventListener('click', updateHall);
  addStudentBtn.addEventListener('click', addStudent);
  sortNameBtn.addEventListener('click', () => sortStudentsBy('name'));
  sortRollBtn.addEventListener('click', () => sortStudentsBy('rollNumber'));
  shuffleBtn.addEventListener('click', shuffleStudents);
  openConstraintModalBtn.addEventListener('click', openConstraintModal);
  closeConstraintModalBtn.addEventListener('click', closeConstraintModal);
  cancelConstraintBtn.addEventListener('click', closeConstraintModal);
  generateBtn.addEventListener('click', assignSeatNumbersAndExpand);
  resetBtn.addEventListener('click', resetLayout);
  saveConstraintBtn.addEventListener('click', addConstraint);
  studentTableBody.addEventListener('click', handleTableActions);
  constraintsList.addEventListener('click', handleConstraintListClick);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !constraintModal.classList.contains('hidden')) {
      closeConstraintModal();
    }
  });
}

initialize();
