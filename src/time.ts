export type EventName =
    | "WorkStart"
    | "WorkEnd"
    | "BreakStart"
    | "BreakEnd"
    | "SchoolStart"
    | "SchoolEnd";

export interface TimeEvent {
    event: EventName;
    time: Date;
}

export class TimeTracker {
    private events: TimeEvent[] = [];
    private weeklyTargetSeconds: number = 25 * 3600;

    setWeeklyTarget(hours: number) {
        this.weeklyTargetSeconds = hours * 3600;
    }

    getWeeklyTarget(): number {
        return this.weeklyTargetSeconds;
    }

    // Get Monday 00:00 of the current week
    private getStartOfWeek(): Date {
        const now = new Date();
        const day = now.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // Sunday=0, so shift to Monday
        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    // Only events from current week
    private getEventsThisWeek(): TimeEvent[] {
        const startOfWeek = this.getStartOfWeek();
        return this.events.filter(e => e.time >= startOfWeek);
    }

    calcWorkTimeThisWeek(): number {
        let workTime = 0;
        const events = this.getEventsThisWeek();
        events.forEach((event, index) => {
            if (event.event === "WorkStart") {
                const nextEvent = events[index + 1];
                if (nextEvent && nextEvent.event === "WorkEnd") {
                    workTime += (nextEvent.time.getTime() - event.time.getTime()) / 1000;
                } else {
                    workTime += (new Date().getTime() - event.time.getTime()) / 1000;
                }
            }
        });
        return workTime;
    }

    getWeeklyProgress(): { worked: number, target: number, percent: number } {
        const worked = this.calcWorkTimeThisWeek();
        const target = this.weeklyTargetSeconds;
        return {
            worked,
            target,
            percent: Math.min(100, (worked / target) * 100)
        };
    }

    addEvent(event: EventName, time: Date = new Date()): void {
        this.events.push({ event, time });
    }

    getEvents(): TimeEvent[] {
        return this.events;
    }

    clearEvents(): void {
        this.events = [];
    }

    save(): void {
        const data = JSON.stringify(this.events);
        localStorage.setItem('timeEvents', data);
    }
    
    get lastEvent(){
        if (this.events.length == 0)
            return undefined
        return this.events[this.events.length-1]
    }

    load(): void {
        const data = localStorage.getItem('timeEvents');
        if (data) {
            const raw = JSON.parse(data);
            this.events = (raw as {event:EventName, time:string}[]).map((e) => {
                return {
                    event: e.event,
                    time:new Date(e.time)
                }
            });
        }
    }

    calcWorkTime(): number {
        let workTime = 0;
        if (this.events.length == 0)
            return workTime;
        this.events.forEach((event, index) => {
            if (event.event === "WorkStart") {
                const nextEvent = this.events[index + 1];
                if (nextEvent && nextEvent.event === "WorkEnd") {
                    workTime += (nextEvent.time.getTime() - event.time.getTime()) / 1000; // in seconds
                }
                else{
                    workTime += (new Date().getTime() - event.time.getTime()) / 1000; // in seconds
                }
            }
        });
        return workTime;
    }

    createEventButton(evStart:EventName, evStop:EventName, text:string, enabled:boolean = false): HTMLDivElement {
        const element = document.createElement('div');
        element.className = 'event-button';
        const buttonStart = document.createElement('button');
        const buttonStop = document.createElement('button');
        buttonStart.textContent = "Start " + text;
        buttonStart.addEventListener('click', () => {
            this.addEvent(evStart);
            buttonStart.style.display = 'none';
            buttonStop.style.display = 'block';
            this.save();
        });
        buttonStart.style.display = enabled?'none':'block';
        element.appendChild(buttonStart);
        buttonStop.textContent = "Stop " + text;
        buttonStop.addEventListener('click', () => {
            this.addEvent(evStop);
            buttonStart.style.display = 'block';
            buttonStop.style.display = 'none';
            this.save();
        });
        buttonStop.style.display = enabled?'block':'none';
        element.appendChild(buttonStop);
        return element;
    }

    reset(){
        this.events = [];
        localStorage.removeItem("timeEvents");
        this.save()
    }
}