const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const updateHallBtn = document.getElementById('updateHallBtn');
const addHallBtn = document.getElementById('addHallBtn');
const removeHallBtn = document.getElementById('removeHallBtn');
const hallSelector = document.getElementById('hallSelector');
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
const hallCount = document.getElementById('hallCount');
const studentCount = document.getElementById('studentCount');
const seatCount = document.getElementById('seatCount');
const constraintsCount = document.getElementById('constraintsCount');
const gridDimensions = document.getElementById('gridDimensions');
const currentHallTitle = document.getElementById('currentHallTitle');
const constraintModal = document.getElementById('constraintModal');
const closeConstraintModalBtn = document.getElementById('closeConstraintModalBtn');
const cancelConstraintBtn = document.getElementById('cancelConstraintBtn');
const saveConstraintBtn = document.getElementById('saveConstraintBtn');
const constraintRoll1 = document.getElementById('constraintRoll1');
const constraintRoll2 = document.getElementById('constraintRoll2');
const studentNameInput = document.getElementById('studentNameInput');
const studentRollInput = document.getElementById('studentRollInput');
const csvFileInput = document.getElementById('csvFileInput');
const uploadCsvBtn = document.getElementById('uploadCsvBtn');

const state = {
  currentHallId: 1,
  halls: [
    {
      id: 1,
      rows: 3,
      cols: 4,
      seating: Array(12).fill(null) // array of student indices or null
    }
  ],
  students: [
    { name: 'JASKARAN SINGH', rollNumber: '24BET10169', hallId: -1, seatNumber: -1 },
    { name: 'SAKSHI', rollNumber: '24BET10158', hallId: -1, seatNumber: -1 },
    { name: 'RAVNEET KAUR', rollNumber: '24BET10161', hallId: -1, seatNumber: -1 },
    { name: 'YUVRAJ SINGH', rollNumber: '24BET10177', hallId: -1, seatNumber: -1 },
    { name: 'MUSKAN', rollNumber: '24BET10166', hallId: -1, seatNumber: -1 },
    { name: 'DEEPAK', rollNumber: '24BET10164', hallId: -1, seatNumber: -1 },
    { name: 'ASHUTOSH SONI', rollNumber: '24BET10155', hallId: -1, seatNumber: -1 },
    { name: 'AKHIL SHARMA', rollNumber: '24BET10154', hallId: -1, seatNumber: -1 },
    { name: 'MANJEET KUMAR', rollNumber: '24BET10181', hallId: -1, seatNumber: -1 },
    { name: 'DHRUV SHARMA', rollNumber: '24BET10180', hallId: -1, seatNumber: -1 },
    { name: 'ARSHDEEP SINGH', rollNumber: '24BET10184', hallId: -1, seatNumber: -1 },
    { name: 'SALONI', rollNumber: '24BET10160', hallId: -1, seatNumber: -1 }
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
  hallCount.textContent = state.halls.length;
  studentCount.textContent = state.students.length;
  const totalSeats = state.halls.reduce((sum, hall) => sum + (hall.rows * hall.cols), 0);
  seatCount.textContent = totalSeats;
  const constraintPairs = Object.values(state.cheatingConstraints).reduce((total, set) => total + set.size, 0) / 2;
  constraintsCount.textContent = constraintPairs;
  
  const currentHall = state.halls.find(h => h.id === state.currentHallId);
  if (currentHall) {
    gridDimensions.textContent = `${currentHall.rows} × ${currentHall.cols}`;
    currentHallTitle.textContent = `Seating Grid - Hall ${currentHall.id}`;
  }
}

function normalizeRoll(value) {
  return value.trim().toUpperCase();
}

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const records = [];
  
  // Skip header if present
  let startIndex = 0;
  if (lines.length > 0 && (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('roll'))) {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < lines.length; i += 1) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      records.push({
        name: parts[0],
        rollNumber: parts[1].toUpperCase()
      });
    }
  }
  
  return records;
}

function importStudentsFromCSV(file) {
  if (!file) {
    showMessage('Please select a CSV file.', 'warning');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csv = e.target.result;
      const records = parseCSV(csv);
      
      if (records.length === 0) {
        showMessage('No valid student records found in CSV.', 'warning');
        return;
      }
      
      let added = 0;
      let skipped = 0;
      
      records.forEach(record => {
        if (studentExists(record.rollNumber)) {
          skipped += 1;
        } else {
          state.students.push({
            name: record.name,
            rollNumber: record.rollNumber,
            hallId: -1,
            seatNumber: -1
          });
          added += 1;
        }
      });
      
      renderStudentTable();
      updateSummary();
      csvFileInput.value = '';
      
      let message = `Imported ${added} student${added !== 1 ? 's' : ''}`;
      if (skipped > 0) {
        message += ` (${skipped} skipped - already exist)`;
      }
      showMessage(message, 'success');
    } catch (error) {
      showMessage(`Error parsing CSV: ${error.message}`, 'error');
    }
  };
  
  reader.onerror = function() {
    showMessage('Error reading file.', 'error');
  };
  
  reader.readAsText(file);
}

function renderStudentTable() {
  studentTableBody.innerHTML = '';

  state.students.forEach((student, index) => {
    const row = document.createElement('tr');
    const hallDisplay = student.hallId > 0 ? `Hall ${student.hallId}` : '—';
    const seatDisplay = student.seatNumber > 0 ? student.seatNumber : '—';
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.rollNumber}</td>
      <td>${hallDisplay}</td>
      <td>${seatDisplay}</td>
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

function renderHallSelector() {
  hallSelector.innerHTML = '';
  state.halls.forEach(hall => {
    const option = document.createElement('option');
    option.value = hall.id;
    option.textContent = `Hall ${hall.id} (${hall.rows}×${hall.cols})`;
    hallSelector.appendChild(option);
  });
  hallSelector.value = state.currentHallId;
}

function addHall() {
  const newId = Math.max(...state.halls.map(h => h.id)) + 1;
  const rows = Number(rowsInput.value) || 3;
  const cols = Number(colsInput.value) || 4;
  
  state.halls.push({
    id: newId,
    rows: rows,
    cols: cols,
    seating: Array(rows * cols).fill(null)
  });
  
  state.currentHallId = newId;
  renderHallSelector();
  renderSeatingGrid();
  updateSummary();
  showMessage(`Added Hall ${newId} with ${rows}×${cols} seats.`, 'success');
}

function removeHall() {
  if (state.halls.length <= 1) {
    showMessage('Cannot remove the last hall. At least one hall must remain.', 'warning');
    return;
  }
  
  const hallToRemove = state.halls.find(h => h.id === state.currentHallId);
  if (!hallToRemove) return;
  
  // Remove students from this hall
  hallToRemove.seating.forEach((studentIndex, seatIndex) => {
    if (studentIndex !== null) {
      state.students[studentIndex].hallId = -1;
      state.students[studentIndex].seatNumber = -1;
    }
  });
  
  // Remove the hall
  state.halls = state.halls.filter(h => h.id !== state.currentHallId);
  
  // Switch to the first remaining hall
  state.currentHallId = state.halls[0].id;
  
  renderHallSelector();
  renderStudentTable();
  renderSeatingGrid();
  updateSummary();
  showMessage(`Removed Hall ${hallToRemove.id}.`, 'success');
}

function updateHall() {
  const currentHall = state.halls.find(h => h.id === state.currentHallId);
  if (!currentHall) return;
  
  const rows = Number(rowsInput.value);
  const cols = Number(colsInput.value);
  
  if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(cols) || cols < 1) {
    showMessage('Please enter valid positive numbers for rows and columns.', 'warning');
    return;
  }
  
  // Clear seating if dimensions changed
  const newSize = rows * cols;
  const oldSize = currentHall.rows * currentHall.cols;
  
  currentHall.rows = rows;
  currentHall.cols = cols;
  currentHall.seating = currentHall.seating.slice(0, newSize);
  while (currentHall.seating.length < newSize) {
    currentHall.seating.push(null);
  }
  
  // If size changed, reset students in this hall
  if (newSize !== oldSize) {
    currentHall.seating.forEach((studentIndex, seatIndex) => {
      if (studentIndex !== null) {
        state.students[studentIndex].hallId = -1;
        state.students[studentIndex].seatNumber = -1;
      }
    });
    currentHall.seating = Array(newSize).fill(null);
    renderStudentTable();
  }
  
  renderHallSelector();
  renderSeatingGrid();
  updateSummary();
  showMessage(`Updated Hall ${currentHall.id} to ${rows}×${cols}.`, 'success');
}

function handleHallSelectorChange() {
  state.currentHallId = Number(hallSelector.value);
  const currentHall = state.halls.find(h => h.id === state.currentHallId);
  if (currentHall) {
    rowsInput.value = currentHall.rows;
    colsInput.value = currentHall.cols;
  }
  renderSeatingGrid();
  updateSummary();
}

function renderSeatingGrid() {
  seatingGrid.innerHTML = '';
  const currentHall = state.halls.find(h => h.id === state.currentHallId);
  if (!currentHall) return;

  seatingGrid.style.gridTemplateColumns = `repeat(${currentHall.cols}, minmax(140px, 1fr))`;

  const totalCells = currentHall.rows * currentHall.cols;

  for (let i = 0; i < totalCells; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    const studentIndex = currentHall.seating[i];
    if (studentIndex === null || studentIndex === undefined) {
      cell.classList.add('empty');
      cell.innerHTML = `<strong>Seat ${i + 1}</strong><small>Empty</small>`;
    } else {
      const student = state.students[studentIndex];
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

  state.students.push({ name, rollNumber, hallId: -1, seatNumber: -1 });
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

  // Clear seating in all halls and adjust indices
  state.halls.forEach(hall => {
    hall.seating = hall.seating.map(seat => seat === index ? null : seat);
    // Adjust indices for students after the removed one
    hall.seating = hall.seating.map(seat => seat !== null && seat > index ? seat - 1 : seat);
  });

  renderStudentTable();
  renderConstraintsList();
  renderSeatingGrid();
  updateSummary();
  showMessage(`Removed student ${removed.name} (${removed.rollNumber}).`, 'success');
}

function shuffleStudents() {
  for (let i = state.students.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.students[i], state.students[j]] = [state.students[j], state.students[i]];
  }

  state.students.forEach((student) => {
    student.hallId = -1;
    student.seatNumber = -1;
  });
  // Clear all hall seating
  state.halls.forEach(hall => {
    hall.seating = Array(hall.rows * hall.cols).fill(null);
  });
  renderStudentTable();
  renderSeatingGrid();
  showMessage('Student roster shuffled randomly.', 'success');
}

function sortStudentsBy(field) {
  state.students.sort((a, b) => {
    if (a[field] < b[field]) return -1;
    if (a[field] > b[field]) return 1;
    return 0;
  });

  state.students.forEach((student) => {
    student.hallId = -1;
    student.seatNumber = -1;
  });
  // Clear all hall seating
  state.halls.forEach(hall => {
    hall.seating = Array(hall.rows * hall.cols).fill(null);
  });
  renderStudentTable();
  renderSeatingGrid();
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

  // Reset all student assignments
  state.students.forEach((student) => {
    student.hallId = -1;
    student.seatNumber = -1;
  });

  // Clear all hall seating
  state.halls.forEach(hall => {
    hall.seating = Array(hall.rows * hall.cols).fill(null);
  });

  // Calculate total capacity
  const totalCapacity = state.halls.reduce((sum, hall) => sum + hall.rows * hall.cols, 0);
  
  if (state.students.length > totalCapacity) {
    showMessage(`Not enough seats! ${state.students.length} students but only ${totalCapacity} seats available.`, 'error');
    return;
  }

  // Sort halls by capacity for better distribution
  const sortedHalls = [...state.halls].sort((a, b) => (b.rows * b.cols) - (a.rows * a.cols));

  let studentIndex = 0;
  let hallIndex = 0;

  while (studentIndex < state.students.length) {
    const hall = sortedHalls[hallIndex % sortedHalls.length];
    const hallSeating = hall.seating;
    const rows = hall.rows;
    const cols = hall.cols;

    const canPlaceAt = (studentIdx, r, c) => {
      const currentRoll = state.students[studentIdx].rollNumber;

      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const neighborIndex = hallSeating[nr * cols + nc];
          if (neighborIndex === null) continue;
          const neighborRoll = state.students[neighborIndex].rollNumber;
          const blocked = state.cheatingConstraints[currentRoll] && state.cheatingConstraints[currentRoll].has(neighborRoll);
          if (blocked) {
            return false;
          }
        }
      }
      return true;
    };

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      for (let r = 0; r < rows && !placed; r += 1) {
        for (let c = 0; c < cols && !placed; c += 1) {
          const seatIndex = r * cols + c;
          if (hallSeating[seatIndex] !== null) continue;
          if (canPlaceAt(studentIndex, r, c)) {
            hallSeating[seatIndex] = studentIndex;
            state.students[studentIndex].hallId = hall.id;
            state.students[studentIndex].seatNumber = seatIndex + 1;
            placed = true;
          }
        }
      }
      attempts += 1;
    }

    if (!placed) {
      showMessage(`Unable to place student ${state.students[studentIndex].rollNumber} in any hall due to constraints.`, 'error');
      return;
    }

    studentIndex += 1;
    hallIndex += 1;
  }

  renderStudentTable();
  renderSeatingGrid();
  updateSummary();
  showMessage('Seating arrangement generated successfully across all halls.', 'success');
}

function resetLayout() {
  state.students.forEach((student) => {
    student.hallId = -1;
    student.seatNumber = -1;
  });
  // Clear all hall seating
  state.halls.forEach(hall => {
    hall.seating = Array(hall.rows * hall.cols).fill(null);
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
  renderHallSelector();
  renderStudentTable();
  renderConstraintsList();
  renderSeatingGrid();
  updateSummary();
  clearMessage();

  updateHallBtn.addEventListener('click', updateHall);
  addHallBtn.addEventListener('click', addHall);
  removeHallBtn.addEventListener('click', removeHall);
  hallSelector.addEventListener('change', handleHallSelectorChange);
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
  uploadCsvBtn.addEventListener('click', () => importStudentsFromCSV(csvFileInput.files[0]));
  csvFileInput.addEventListener('change', () => {
    if (csvFileInput.files.length > 0) {
      uploadCsvBtn.classList.add('primary');
    } else {
      uploadCsvBtn.classList.remove('primary');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !constraintModal.classList.contains('hidden')) {
      closeConstraintModal();
    }
  });
}

initialize();
