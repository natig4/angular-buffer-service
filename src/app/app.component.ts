import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService, IEventDto } from './events.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private eventsService = inject(EventsService);

  timeFrame = this.eventsService.DELAY;
  count = signal(0);
  queuedEvents = signal(0);
  clicksPerTimeFrame = signal(0);
  eventLog = signal<
    Array<{
      timestamp: Date;
      eventType: string;
      count: number;
    }>
  >([]);

  private clickTimes: number[] = [];

  ngOnInit(): void {
    // Subscribe to the events service to get buffered events
    this.eventsService.bufferedEvents$.subscribe((events) => {
      if (events.length) {
        this.updateEventLog(`Batch of ${events.length} events processed`);
        this.queuedEvents.set(0);
      }
    });

    // Update clicks per second every second
    setInterval(() => this.updateClicksPerSecond(), this.timeFrame);
  }

  sendClickEvent(eventType: string) {
    // Increment count
    const newCount = this.count() + 1;
    this.count.set(newCount);

    // Track time for CPS calculation
    this.clickTimes.push(Date.now());

    // Create event
    const event: IEventDto = {
      name: eventType,
      data: newCount,
    };

    // Send event to service
    this.eventsService.send(event);

    // Update queue count
    this.queuedEvents.update((val) => val + 1);

    // Add to log
    this.addEventToLog(eventType, newCount);
  }

  private addEventToLog(eventType: string, count: number) {
    this.eventLog.update((log) => {
      const newLog = [...log];
      newLog.unshift({
        timestamp: new Date(),
        eventType,
        count,
      });

      // Limit log size to 100 entries
      if (newLog.length > 100) {
        newLog.pop();
      }

      return newLog;
    });
  }

  private updateClicksPerSecond() {
    const now = Date.now();
    // Keep only clicks from last minute
    this.clickTimes = this.clickTimes.filter((time) => now - time < 60000);

    // Calculate clicks in the last second
    const clicksLastSecond = this.clickTimes.filter(
      (time) => now - time < this.timeFrame
    ).length;
    this.clicksPerTimeFrame.set(clicksLastSecond);
  }

  private updateEventLog(message: string) {
    console.log(message);
  }
}
