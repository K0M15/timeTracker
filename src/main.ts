import './style.css'
import { TimeTracker } from './time'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Refresh?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  }
})
const timeTracker = new TimeTracker();

function setupTime() {
  timeTracker.load();
  let enabled = false;
  if (timeTracker.lastEvent?.event == "WorkStart")
    enabled = true;
  const workButton = timeTracker.createEventButton("WorkStart", "WorkEnd", "Work", enabled);
  document.getElementById("app")?.append(workButton);

  // Element for total work time (all time)
  const workTimeElement = document.createElement('div');
  document.getElementById("app")?.append(workTimeElement);

  // Element for weekly work time
  const weekTimeElement = document.createElement('div');
  document.getElementById("app")?.append(weekTimeElement);

  // Element for daily work time
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayTimeElements: HTMLDivElement[] = [];
  days.forEach(() => {
    const el = document.createElement('div');
    document.getElementById("app")?.append(el);
    dayTimeElements.push(el);
  });

  setInterval(() => {
    // Total work time (all time)
    const workTime = timeTracker.calcWorkTime();
    let displayTime = "";
    if (workTime > 3600) {
      displayTime = Math.floor(workTime / 3600) + " hours and " + Math.floor((workTime % 3600) / 60) + " minutes";
    } else if (workTime > 60) {
      displayTime = Math.floor(workTime / 60) + " minutes and " + Math.floor(workTime % 60) + " seconds";
    } else {
      displayTime = Math.floor(workTime) + " seconds";
    }
    workTimeElement.textContent = `Total Work Time: ${displayTime}`;

    // Weekly work time
    const weekly = timeTracker.getWeeklyProgress();
    let weekDisplay = "";
    if (weekly.worked > 3600) {
      weekDisplay = Math.floor(weekly.worked / 3600) + " hours and " + Math.floor((weekly.worked % 3600) / 60) + " minutes";
    } else if (weekly.worked > 60) {
      weekDisplay = Math.floor(weekly.worked / 60) + " minutes and " + Math.floor(weekly.worked % 60) + " seconds";
    } else {
      weekDisplay = Math.floor(weekly.worked) + " seconds";
    }
    weekTimeElement.textContent = `This Week: ${weekDisplay} (${weekly.percent.toFixed(1)}% of target)`;

    // Daily work time (Monday to Friday)
    const startOfWeek = (timeTracker as any).getStartOfWeek();
    const dailyTarget = timeTracker.getWeeklyTarget() / 5; // seconds per day
    for (let i = 0; i < 5; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(dayStart.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Filter events for this day
      const events = timeTracker.getEvents().filter(e => e.time >= dayStart && e.time <= dayEnd);

      // Calculate work time for the day
      let workTimeDay = 0;
      events.forEach((event, idx) => {
        if (event.event === "WorkStart") {
          const nextEvent = events[idx + 1];
          if (nextEvent && nextEvent.event === "WorkEnd") {
            workTimeDay += (nextEvent.time.getTime() - event.time.getTime()) / 1000;
          } else {
            workTimeDay += (new Date().getTime() - event.time.getTime()) / 1000;
          }
        }
      });

      // Format display
      let dayDisplay = "";
      if (workTimeDay > 3600) {
        dayDisplay = Math.floor(workTimeDay / 3600) + "h " + Math.floor((workTimeDay % 3600) / 60) + "m";
      } else if (workTimeDay > 60) {
        dayDisplay = Math.floor(workTimeDay / 60) + "m " + Math.floor(workTimeDay % 60) + "s";
      } else {
        dayDisplay = Math.floor(workTimeDay) + "s";
      }
      const percent = Math.min(100, (workTimeDay / dailyTarget) * 100);
      dayTimeElements[i].textContent = `${days[i]}: ${dayDisplay} (${percent.toFixed(1)}% of daily target)`;
    }
  }, 1000);

  timeTracker.save();
}

setupTime();
(window as any).time = timeTracker;