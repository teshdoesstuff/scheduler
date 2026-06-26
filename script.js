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
  const schedule = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    note: scheduleNote.value.trim(),
    dates: Array.from(selectedDates).sort(),
  };

  savedSchedules.unshift(schedule);
  localStorage.setItem('scheduler-history', JSON.stringify(savedSchedules));

  selectedDates.clear();
  scheduleNote.value = '';
  buildCalendar();
  alert('Itinerary saved successfully.');
  showHistory();
}

function clearSelection() {
  selectedDates.clear();
  buildCalendar();
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
    meta.textContent = `Saved on ${new Date(schedule.createdAt).toLocaleString()} · ${schedule.dates.length} day(s)`;

    const dateList = document.createElement('ul');
    schedule.dates.slice(0, 10).forEach((date) => {
      const entry = document.createElement('li');
      entry.textContent = date;
      dateList.appendChild(entry);
    });

    const actions = document.createElement('div');
    actions.style.marginTop = '14px';
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => deleteSchedule(schedule.id));
    actions.appendChild(deleteButton);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(dateList);
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
  document.getElementById('view-history').addEventListener('click', showHistory);
}

attachEvents();
buildCalendar();
