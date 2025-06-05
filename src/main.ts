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
  }, 1000);

  timeTracker.save();
}

setupTime();
(window as any).time = timeTracker;