// LC-SeatChecker の処理

const BAR_TOTAL_MINUTES = 360;

const seatSchedules = [
  { id: 1, intervals: [{ state: 'reserved', start: 9 * 60, end: 11 * 60 }] },
  { id: 2, intervals: [{ state: 'in-use', start: 9 * 60, end: 11 * 60 }] },
  { id: 3, intervals: [{ state: 'reserved', start: 11 * 60, end: 13 * 60 }] },
  { id: 4, intervals: [{ state: 'in-use', start: 13 * 60, end: 15 * 60 }] },
  { id: 5, intervals: [{ state: 'reserved', start: 15 * 60, end: 17 * 60 }] },
  { id: 6, intervals: [{ state: 'in-use', start: 11 * 60, end: 13 * 60 }] },
  { id: 7, intervals: [{ state: 'reserved', start: 15 * 60, end: 17 * 60 }] },
  { id: 8, intervals: [] },
  { id: 9, intervals: [{ state: 'reserved', start: 9 * 60, end: 11 * 60 }] },
  { id: 10, intervals: [{ state: 'in-use', start: 17 * 60, end: 19 * 60 }] },
  { id: 11, intervals: [] },
  { id: 12, intervals: [{ state: 'reserved', start: 9 * 60, end: 11 * 60 }] },
  { id: 13, intervals: [{ state: 'in-use', start: 13 * 60, end: 15 * 60 }] },
  { id: 14, intervals: [] },
  { id: 15, intervals: [{ state: 'reserved', start: 15 * 60, end: 17 * 60 }] },
  { id: 16, intervals: [{ state: 'in-use', start: 17 * 60, end: 19 * 60 }] },
  { id: 17, intervals: [{ state: 'reserved', start: 9 * 60, end: 11 * 60 }] },
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
    seatEl.classList.add(state || 'free');
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

function updateTimelineBar(seatId, bar, nowMinutes) {
  const barTrack = bar.querySelector('.bar-track');
  if (!barTrack) return;

  clearSegments(barTrack);

  const barStartHour = Number(bar.dataset.startHour);
  const barStartMinutes = barStartHour * 60;
  const barEndMinutes = barStartMinutes + BAR_TOTAL_MINUTES;

  const pastWidth = Math.max(0, Math.min(nowMinutes, barEndMinutes) - barStartMinutes);
  if (pastWidth > 0) {
    addSegment(barTrack, 0, (pastWidth / BAR_TOTAL_MINUTES) * 100, 'past');
  }

  const seat = seatSchedules.find((item) => item.id === seatId);
  if (!seat) return;

  seat.intervals.forEach((interval) => {
    const overlapStart = Math.max(interval.start, barStartMinutes);
    const overlapEnd = Math.min(interval.end, barEndMinutes);
    if (overlapStart >= overlapEnd) return;
    if (interval.end <= nowMinutes) return;

    let drawStart = overlapStart;
    let drawEnd = overlapEnd;

    if (interval.start < nowMinutes && interval.end > nowMinutes) {
      drawStart = nowMinutes;
    }

    if (drawStart >= drawEnd) return;

    const leftPercent = ((drawStart - barStartMinutes) / BAR_TOTAL_MINUTES) * 100;
    const widthPercent = ((drawEnd - drawStart) / BAR_TOTAL_MINUTES) * 100;
    addSegment(barTrack, leftPercent, widthPercent, interval.state);
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
