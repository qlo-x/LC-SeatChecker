// LC-SeatChecker の処理

const BAR_TOTAL_MINUTES = 360;

const seatSchedules = [
  { id: 1, intervals: [{ state: 'reserved', start: 9 * 60, end: 10 * 60 + 30 }] },
  { id: 2, intervals: [{ state: 'in-use', start: 9 * 60 + 15, end: 11 * 60 + 30 }] },
  { id: 3, intervals: [{ state: 'reserved', start: 12 * 60, end: 13 * 60 + 30 }] },
  { id: 4, intervals: [{ state: 'in-use', start: 14 * 60, end: 16 * 60 }] },
  { id: 5, intervals: [{ state: 'reserved', start: 15 * 60, end: 17 * 60 + 15 }] },
  { id: 6, intervals: [{ state: 'in-use', start: 10 * 60, end: 12 * 60 + 15 }] },
  { id: 7, intervals: [{ state: 'reserved', start: 16 * 60, end: 18 * 60 }] },
  { id: 8, intervals: [] },
  { id: 9, intervals: [{ state: 'reserved', start: 11 * 60, end: 13 * 60 }] },
  { id: 10, intervals: [{ state: 'in-use', start: 17 * 60 + 30, end: 19 * 60 }] },
  { id: 11, intervals: [] },
  { id: 12, intervals: [{ state: 'reserved', start: 9 * 60 + 30, end: 11 * 60 }] },
  { id: 13, intervals: [{ state: 'in-use', start: 12 * 60 + 30, end: 14 * 60 }] },
  { id: 14, intervals: [] },
  { id: 15, intervals: [{ state: 'reserved', start: 15 * 60 + 30, end: 17 * 60 + 45 }] },
  { id: 16, intervals: [{ state: 'in-use', start: 18 * 60, end: 20 * 60 + 30 }] },
  { id: 17, intervals: [{ state: 'reserved', start: 9 * 60, end: 10 * 60 + 45 }] },
];

function getNowInJapan() {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + 9 * 60 * 60 * 1000);
}

function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function setCurrentTime() {
  const timeEl = document.getElementById('time');
  if (!timeEl) return;
  timeEl.textContent = formatTime(getNowInJapan());
}

function getSeatStateByNow(seatId, nowMinutes) {
  const seat = seatSchedules.find((item) => item.id === seatId);
  if (!seat) return 'free';

  const activeInterval = seat.intervals.find(
    (interval) => nowMinutes >= interval.start && nowMinutes < interval.end
  );

  return activeInterval ? activeInterval.state : 'free';
}

function updateSeatStates() {
  const now = getNowInJapan();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let seatId = 1; seatId <= 17; seatId += 1) {
    const seatEl = document.getElementById(`seat${seatId}`);
    if (!seatEl) continue;

    ['free', 'reserved', 'in-use'].forEach((className) => {
      seatEl.classList.remove(className);
    });

    const state = getSeatStateByNow(seatId, nowMinutes);
    if (state) {
      seatEl.classList.add(state);
    } else {
      seatEl.classList.add('free');
    }
  }
}

function clearSegments(barTrack) {
  if (!barTrack) return;
  barTrack.querySelectorAll('.segment').forEach((segment) => segment.remove());
}

function addSegment(barTrack, leftPercent, widthPercent, className) {
  const segment = document.createElement('div');
  segment.className = `segment ${className}`;
  segment.style.left = `${leftPercent}%`;
  segment.style.width = `${widthPercent}%`;
  barTrack.appendChild(segment);
}

function getBoundaryInBar(intervalStart, intervalEnd, barStartMinutes, barEndMinutes) {
  return {
    start: Math.max(intervalStart, barStartMinutes),
    end: Math.min(intervalEnd, barEndMinutes),
  };
}

function updateTimelineBar(seatId, bar, nowMinutes) {
  const barTrack = bar.querySelector('.bar-track');
  if (!barTrack) return;

  clearSegments(barTrack);

  const barStartHour = Number(bar.dataset.startHour);
  const barStartMinutes = barStartHour * 60;
  const barEndMinutes = barStartMinutes + BAR_TOTAL_MINUTES;

  const seat = seatSchedules.find((item) => item.id === seatId);
  if (!seat) return;

  seat.intervals.forEach((interval) => {
    const overlap = getBoundaryInBar(interval.start, interval.end, barStartMinutes, barEndMinutes);
    if (overlap.start >= overlap.end) return;

    const pastStart = Math.max(overlap.start, barStartMinutes);
    const pastEnd = Math.min(nowMinutes, overlap.end);

    if (pastEnd > pastStart) {
      const leftPercent = ((pastStart - barStartMinutes) / BAR_TOTAL_MINUTES) * 100;
      const widthPercent = ((pastEnd - pastStart) / BAR_TOTAL_MINUTES) * 100;
      addSegment(barTrack, leftPercent, widthPercent, 'past');
    }

    const activeStart = Math.max(overlap.start, nowMinutes);
    const activeEnd = overlap.end;
    if (activeStart < activeEnd) {
      const leftPercent = ((activeStart - barStartMinutes) / BAR_TOTAL_MINUTES) * 100;
      const widthPercent = ((activeEnd - activeStart) / BAR_TOTAL_MINUTES) * 100;
      addSegment(barTrack, leftPercent, widthPercent, interval.state);
    }
  });
}

function updateTimelines() {
  const now = getNowInJapan();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let seatId = 1; seatId <= 17; seatId += 1) {
    const timeline = document.getElementById(`timeline${seatId}`);
    if (!timeline) continue;

    timeline.querySelectorAll('.bar').forEach((bar) => {
      updateTimelineBar(seatId, bar, nowMinutes);
    });
  }
}

function updateEverything() {
  setCurrentTime();
  updateSeatStates();
  updateTimelines();
}

updateEverything();
setInterval(updateEverything, 60 * 1000);
