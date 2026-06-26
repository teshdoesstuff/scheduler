const homeScreen = document.getElementById('home-screen');
const scheduleScreen = document.getElementById('schedule-screen');
const historyScreen = document.getElementById('history-screen');
const calendarElement = document.getElementById('calendar');
const monthLabel = document.getElementById('month-label');
const selectedCount = document.getElementById('selected-count');
const scheduleNote = document.getElementById('schedule-note');
const historyList = document.getElementById('history-list');

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let selectedDates = new Set();
let editingScheduleId = null;

function switchScreen(screenId) {
  [homeScreen, scheduleScreen, historyScreen].forEach((section) => {
    section.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

function buildCalendar() {
  calendarElement.innerHTML = '';
  monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  weekdayLabels.forEach((weekday) => {
    const label = document.createElement('div');
    label.className = 'weekday';
    label.textContent = weekday;
    calendarElement.appendChild(label);
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < startDay; i += 1) {
    const filler = document.createElement('div');
    filler.className = 'day disabled';
    calendarElement.appendChild(filler);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentYear, currentMonth, day);
    const value = formatDateKey(date);
    const dayCell = document.createElement('button');
    dayCell.type = 'button';
    dayCell.className = 'day';
    dayCell.textContent = day;
    dayCell.dataset.date = value;

    if (selectedDates.has(value)) {
      dayCell.classList.add('selected');
    }

    const todayKey = formatDateKey(currentDate);
    if (value === todayKey) {
      dayCell.classList.add('today');
    }

    dayCell.addEventListener('click', () => {
      toggleDay(value, dayCell);
    });

    calendarElement.appendChild(dayCell);
  }

  updateSelectedInfo();
}

function toggleDay(dateKey, element) {
  if (selectedDates.has(dateKey)) {
    selectedDates.delete(dateKey);
    element.classList.remove('selected');
  } else {
    selectedDates.add(dateKey);
    element.classList.add('selected');
  }
  updateSelectedInfo();
}

function updateSelectedInfo() {
  selectedCount.textContent = selectedDates.size;
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  buildCalendar();
}

function saveSchedule() {
  if (selectedDates.size === 0) {
    alert('Select at least one day before saving your itinerary.');
    return;
  }

  const savedSchedules = JSON.parse(localStorage.getItem('scheduler-history') || '[]');
  
  if (editingScheduleId !== null) {
    // Update existing schedule
    const scheduleIndex = savedSchedules.findIndex((s) => s.id === editingScheduleId);
    if (scheduleIndex !== -1) {
      savedSchedules[scheduleIndex].note = scheduleNote.value.trim();
      savedSchedules[scheduleIndex].dates = Array.from(selectedDates).sort();
      alert('Itinerary updated successfully.');
    }
    editingScheduleId = null;
  } else {
    // Create new schedule
    const schedule = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      note: scheduleNote.value.trim(),
      dates: Array.from(selectedDates).sort(),
    };
    savedSchedules.unshift(schedule);
    alert('Itinerary saved successfully.');
  }

  localStorage.setItem('scheduler-history', JSON.stringify(savedSchedules));

  selectedDates.clear();
  scheduleNote.value = '';
  buildCalendar();
  updateSaveButtonText();
  showHistory();
}

function clearSelection() {
  selectedDates.clear();
  buildCalendar();
}

function updateSaveButtonText() {
  const saveButton = document.getElementById('save-schedule');
  const cancelButton = document.getElementById('cancel-edit');
  if (editingScheduleId !== null) {
    saveButton.textContent = 'Update itinerary';
    cancelButton.style.display = 'block';
  } else {
    saveButton.textContent = 'Save itinerary';
    cancelButton.style.display = 'none';
  }
}

function editSchedule(scheduleId) {
  const schedules = getSavedSchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);
  
  if (schedule) {
    editingScheduleId = scheduleId;
    selectedDates.clear();
    schedule.dates.forEach((dateStr) => {
      selectedDates.add(dateStr);
    });
    scheduleNote.value = schedule.note;
    
    // Reset calendar to current view
    currentDate = new Date();
    currentYear = currentDate.getFullYear();
    currentMonth = currentDate.getMonth();
    buildCalendar();
    updateSaveButtonText();
    switchScreen('schedule-screen');
  }
}

function getSavedSchedules() {
  return JSON.parse(localStorage.getItem('scheduler-history') || '[]');
}

function renderHistory() {
  const schedules = getSavedSchedules();
  historyList.innerHTML = '';

  if (schedules.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No schedules saved yet. Create one from the Schedule screen.</p>';
    return;
  }

  schedules.forEach((schedule) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    const title = document.createElement('h3');
    title.textContent = schedule.note || 'Scheduled itinerary';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Saved on ${new Date(schedule.createdAt).toLocaleString()} • ${schedule.dates.length} day(s)`;

    // Show date range summary
    const summary = document.createElement('div');
    summary.className = 'date-summary';
    const firstDate = schedule.dates[0];
    const lastDate = schedule.dates[schedule.dates.length - 1];
    summary.textContent = `${firstDate} to ${lastDate}`;
    
    // Full date list (initially hidden)
    const dateListContainer = document.createElement('div');
    dateListContainer.className = 'date-list-container';
    dateListContainer.style.display = 'none';
    
    const dateList = document.createElement('ul');
    schedule.dates.forEach((date) => {
      const entry = document.createElement('li');
      entry.textContent = date;
      dateList.appendChild(entry);
    });
    dateListContainer.appendChild(dateList);
    
    // Expand button
    const expandButton = document.createElement('button');
    expandButton.type = 'button';
    expandButton.textContent = 'Show all dates';
    expandButton.className = 'secondary expand-button';
    expandButton.style.marginTop = '10px';
    expandButton.addEventListener('click', () => {
      const isHidden = dateListContainer.style.display === 'none';
      dateListContainer.style.display = isHidden ? 'block' : 'none';
      expandButton.textContent = isHidden ? 'Hide dates' : 'Show all dates';
    });

    const actions = document.createElement('div');
    actions.style.marginTop = '14px';
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.className = 'primary-button';
    editButton.addEventListener('click', () => editSchedule(schedule.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => deleteSchedule(schedule.id));
    
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(summary);
    item.appendChild(expandButton);
    item.appendChild(dateListContainer);
    item.appendChild(actions);
    historyList.appendChild(item);
  });
}

function deleteSchedule(scheduleId) {
  const schedules = getSavedSchedules().filter((entry) => entry.id !== scheduleId);
  localStorage.setItem('scheduler-history', JSON.stringify(schedules));
  renderHistory();
}

function showHistory() {
  renderHistory();
  switchScreen('history-screen');
}

function attachEvents() {
  document.getElementById('go-schedule').addEventListener('click', () => {
    switchScreen('schedule-screen');
  });

  document.getElementById('go-history').addEventListener('click', () => {
    showHistory();
  });

  document.getElementById('back-home-1').addEventListener('click', () => {
    editingScheduleId = null;
    updateSaveButtonText();
    switchScreen('home-screen');
  });

  document.getElementById('back-home-2').addEventListener('click', () => {
    switchScreen('home-screen');
  });

  document.getElementById('back-home-3').addEventListener('click', () => {
    switchScreen('home-screen');
  });

  document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
  document.getElementById('clear-selection').addEventListener('click', clearSelection);
  document.getElementById('save-schedule').addEventListener('click', saveSchedule);
  document.getElementById('cancel-edit').addEventListener('click', () => {
    editingScheduleId = null;
    selectedDates.clear();
    scheduleNote.value = '';
    updateSaveButtonText();
    buildCalendar();
    showHistory();
  });
  document.getElementById('view-history').addEventListener('click', showHistory);
}

attachEvents();
buildCalendar();
