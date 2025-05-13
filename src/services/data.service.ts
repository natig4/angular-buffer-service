import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { EventsService } from './events.service';
import { interval, Subscription } from 'rxjs';

export interface EventLogEntry {
  timestamp: Date;
  eventType: string;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private eventsService = inject(EventsService);

  // Configuration values
  timeFrame = this.eventsService.DELAY;
  maxBufferSize = this.eventsService.EVENTS_COUNT_BEFORE_SEND;

  // Signals for application state
  count = signal(0);
  queuedEvents = signal(0);
  clicksPerTimeFrame = signal(0);
  timeUntilSend = signal(this.timeFrame);
  isProcessingBatch = signal(false);
  totalEventsProcessed = signal(0);
  totalBatchesSent = signal(0);
  averageBatchSize = signal(0);
  eventLog = signal<EventLogEntry[]>([]);

  // Timer management
  private clickTimes: number[] = [];
  private timerSubscription?: Subscription;
  private lastEventTime = Date.now();
  private hasFirstEvent = false;
  private timerActive = false;

  // Computed values
  bufferFillPercentage = computed(() => {
    return Math.min(100, (this.queuedEvents() / this.maxBufferSize) * 100);
  });

  timerPercentage = computed(() => {
    return Math.max(0, 100 - (this.timeUntilSend() / this.timeFrame) * 100);
  });

  constructor() {
    // Setup effect for processing batch state
    effect(() => {
      this.isProcessingBatch.set(this.eventsService.isProcessingBatch());
      this.totalEventsProcessed.set(this.eventsService.totalEventsProcessed());
      this.totalBatchesSent.set(this.eventsService.totalBatchesSent());
    });

    // Subscribe to the events service to get buffered events
    this.eventsService.bufferedEvents$.subscribe((events) => {
      if (events.length) {
        // Add the batch event to the log
        this.addBatchEvent(events.length);

        // Reset queue count
        this.queuedEvents.set(0);

        // Update metrics
        this.updateAverageBatchSize(events.length);

        // Reset the timer state after a batch is processed
        this.resetTimerState();
      }
    });

    // Initialize the timer
    this.startTimer();

    // Update clicks per second every timeFrame
    setInterval(() => this.updateClicksPerSecond(), this.timeFrame);
  }

  submitEvent(eventType: string): void {
    // Increment count
    const newCount = this.count() + 1;
    this.count.set(newCount);

    // Track time for CPS calculation
    this.clickTimes.push(Date.now());

    // Create event
    const event = {
      name: eventType,
      data: newCount,
    };

    // Send event to service
    this.eventsService.send(event);

    // Update queue count
    this.queuedEvents.update((val) => val + 1);

    // Add to log
    this.addEventToLog(eventType, newCount);

    // Start the timer if this is the first event or timer is inactive
    if (!this.timerActive) {
      this.startTimerCycle();
    }
  }

  flushBuffer(): void {
    // Add flush event to log
    this.addEventToLog('flush', this.count());

    // Force service to process events immediately
    this.eventsService.flushBuffer();
  }

  updateConfig(config: { timeFrame: number; bufferSize: number }): void {
    this.timeFrame = config.timeFrame;
    this.maxBufferSize = config.bufferSize;

    this.eventsService.configure({
      delay: this.timeFrame,
      batchSize: this.maxBufferSize,
    });

    // Reset the timer state with new settings
    this.resetTimerState();

    // Add to log
    this.addEventToLog('config', this.count());
  }

  private startTimer(): void {
    // Create an interval that fires every 100ms to update the countdown timer
    this.timerSubscription = interval(100).subscribe(() => {
      if (this.timerActive) {
        const now = Date.now();
        const elapsed = now - this.lastEventTime;
        const remaining = Math.max(0, this.timeFrame - elapsed);

        this.timeUntilSend.set(remaining);

        // If the timer has reached zero, we should stop it until new events come in
        if (remaining === 0) {
          this.timerActive = false;
        }
      } else {
        // When timer is not active, always show full time remaining
        this.timeUntilSend.set(this.timeFrame);
      }
    });
  }

  private startTimerCycle(): void {
    this.lastEventTime = Date.now();
    this.timerActive = true;
    this.hasFirstEvent = true;
  }

  private resetTimerState(): void {
    this.timerActive = false;
  }

  private addEventToLog(eventType: string, count: number): void {
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

  private addBatchEvent(count: number): void {
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

  private updateClicksPerSecond(): void {
    const now = Date.now();
    // Keep only clicks from last minute
    this.clickTimes = this.clickTimes.filter((time) => now - time < 60000);

    // Calculate clicks in the last timeFrame
    const clicksLastTimeFrame = this.clickTimes.filter(
      (time) => now - time < this.timeFrame
    ).length;
    this.clicksPerTimeFrame.set(clicksLastTimeFrame);
  }

  private updateAverageBatchSize(latestBatchSize: number): void {
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

  cleanup(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
