import {
  Component,
  signal,
  computed,
  effect,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService, IEventDto } from './events.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private eventsService = inject(EventsService);

  // Configuration values
  timeFrame = this.eventsService.DELAY;
  maxBufferSize = 100;

  // Signals for application state
  count = signal(0);
  queuedEvents = signal(0);
  clicksPerTimeFrame = signal(0);
  timeUntilSend = signal(this.timeFrame);
  isProcessingBatch = signal(false);
  totalEventsProcessed = signal(0);
  totalBatchesSent = signal(0);
  averageBatchSize = signal(0);

  eventLog = signal<
    Array<{
      timestamp: Date;
      eventType: string;
      count: number;
    }>
  >([]);

  // Timer subscriptions
  private clickTimes: number[] = [];
  private timerSubscription?: Subscription;
  private lastEventTime = Date.now();

  // Computed values
  bufferFillPercentage = computed(() => {
    return Math.min(100, (this.queuedEvents() / this.maxBufferSize) * 100);
  });

  timerPercentage = computed(() => {
    return Math.max(0, 100 - (this.timeUntilSend() / this.timeFrame) * 100);
  });

  ngOnInit(): void {
    // Subscribe to the events service to get buffered events
    this.eventsService.bufferedEvents$.subscribe((events) => {
      if (events.length) {
        // Add the batch event to the log
        this.addBatchEvent(events.length);

        // Reset queue count
        this.queuedEvents.set(0);

        // Update service metrics
        this.totalEventsProcessed.set(
          this.eventsService.totalEventsProcessed()
        );
        this.totalBatchesSent.set(this.eventsService.totalBatchesSent());
        this.updateAverageBatchSize(events.length);
      }
    });

    // Subscribe to individual events
    this.eventsService.eventsObs$.subscribe((event) => {
      if (event.name !== '_flush') {
        // Ignore flush events
        // Reset the timer when an event is received
        this.resetTimer();
      }
    });

    // Initialize the timer
    this.startTimer();

    // Update clicks per second every second
    setInterval(() => this.updateClicksPerSecond(), this.timeFrame);

    // Track processing state
    effect(() => {
      this.isProcessingBatch.set(this.eventsService.isProcessingBatch());
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
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

    // Reset the timer when an event is sent
    this.resetTimer();
  }

  flushBuffer() {
    this.eventsService.flushBuffer();

    // Add to log
    this.addEventToLog('flush', this.count());
  }

  updateBufferTime(value: number) {
    this.timeFrame = value;
  }

  updateBufferSize(value: number) {
    this.maxBufferSize = value;
  }

  applySettings() {
    this.eventsService.configure({
      delay: this.timeFrame,
      batchSize: this.maxBufferSize,
    });

    // Reset and restart the timer with new settings
    this.resetTimer();

    // Add to log
    this.addEventToLog('config', this.count());
  }

  private startTimer() {
    // Create an interval that fires every 100ms to update the countdown timer
    this.timerSubscription = interval(100).subscribe(() => {
      const now = Date.now();
      const elapsed = now - this.lastEventTime;
      const remaining = Math.max(0, this.timeFrame - elapsed);

      this.timeUntilSend.set(remaining);
    });
  }

  private resetTimer() {
    this.lastEventTime = Date.now();
    this.timeUntilSend.set(this.timeFrame);
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

  private addBatchEvent(count: number) {
    this.eventLog.update((log) => {
      const newLog = [...log];
      newLog.unshift({
        timestamp: new Date(),
        eventType: 'batch',
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

    // Calculate clicks in the last timeFrame
    const clicksLastTimeFrame = this.clickTimes.filter(
      (time) => now - time < this.timeFrame
    ).length;
    this.clicksPerTimeFrame.set(clicksLastTimeFrame);
  }

  private updateAverageBatchSize(latestBatchSize: number) {
    if (this.totalBatchesSent() === 0) return;

    // Simple running average calculation
    const currentAvg = this.averageBatchSize();
    const newAvg =
      currentAvg === 0
        ? latestBatchSize
        : (currentAvg * (this.totalBatchesSent() - 1) + latestBatchSize) /
          this.totalBatchesSent();

    this.averageBatchSize.set(Math.round(newAvg * 10) / 10); // Round to 1 decimal place
  }
}
