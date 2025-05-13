import { Injectable, signal } from '@angular/core';
import {
  bufferCount,
  bufferWhen,
  delay,
  EMPTY,
  Observable,
  race,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

export interface IEventDto {
  name: string;
  data: number;
}

/**
 * EventsService - A service for buffering events before sending them to a backend
 *
 * This service uses RxJS operators to efficiently batch events based on either:
 * 1. A time threshold (events are sent after a period of inactivity)
 * 2. A count threshold (events are sent when a certain number accumulate)
 *
 * This makes it ideal for:
 * - Analytics tracking with reduced network overhead
 * - High-frequency user interaction events
 * - Telemetry data in applications
 * - Any scenario where you want to batch events for performance
 */
@Injectable({
  providedIn: 'root',
})
export class EventsService {
  // Configuration options with defaults - DELAY is public so components can access the buffer timing
  public DELAY = 5000; // Time in ms to wait before sending a batch
  private EVENTS_COUNT_BEFORE_SEND = 100; // Number of events to collect before sending

  // Internal subjects for event handling
  private eventsSubject = new Subject<IEventDto>();
  private bufferedEventsSubject = new Subject<IEventDto[]>();

  // Public observables
  eventsObs$ = this.eventsSubject.asObservable();
  bufferedEvents$ = this.bufferedEventsSubject.asObservable();

  // Signals for status tracking
  totalEventsProcessed = signal(0);
  totalBatchesSent = signal(0);
  isProcessingBatch = signal(false);

  // Last event time tracking
  private lastEventTimestamp = Date.now();

  constructor() {
    // Set up the buffering pipeline
    this.eventsSubject
      .pipe(
        // Buffer events based on either time delay or count threshold
        bufferWhen(() =>
          race([
            // Condition 1: Time-based buffer - triggers after DELAY ms of inactivity
            this.eventsSubject.pipe(delay(this.DELAY)),

            // Condition 2: Count-based buffer - triggers after collecting EVENTS_COUNT_BEFORE_SEND events
            this.eventsSubject.pipe(bufferCount(this.EVENTS_COUNT_BEFORE_SEND)),
          ])
        ),
        // Skip empty batches
        tap((events) => {
          if (events.length > 0) {
            console.log(`Buffered batch of ${events.length} events`);
            this.isProcessingBatch.set(true);
            this.totalBatchesSent.update((count) => count + 1);
            this.totalEventsProcessed.update((count) => count + events.length);

            // Notify subscribers about the batch
            this.bufferedEventsSubject.next(events);
          }
        }),
        // Here we would typically send the events to a backend
        switchMap((events) => {
          if (events.length === 0) return EMPTY;

          // In a real application, this is where you would:
          // 1. Send the batch to your backend API
          // 2. Handle success/failure
          // 3. Implement retry logic if needed

          // Simulate a network request with a random delay between 200-500ms
          return new Observable((subscriber) => {
            setTimeout(() => {
              this.isProcessingBatch.set(false);
              subscriber.next(events);
              subscriber.complete();
            }, Math.random() * 300 + 200);
          });
        })
      )
      .subscribe({
        next: (events) => {
          console.log('Successfully processed batch:', events);
        },
        error: (err) => {
          console.error('Error processing event batch:', err);
          this.isProcessingBatch.set(false);
        },
      });
  }

  /**
   * Send an event to be buffered and eventually processed
   * @param event The event to send
   */
  send(event: IEventDto) {
    this.lastEventTimestamp = Date.now();
    this.eventsSubject.next(event);
  }

  /**
   * Configure the service with custom settings
   * @param config Configuration options
   */
  configure(config: { delay?: number; batchSize?: number }) {
    if (config.delay !== undefined) {
      this.DELAY = config.delay;
    }
    if (config.batchSize !== undefined) {
      this.EVENTS_COUNT_BEFORE_SEND = config.batchSize;
    }
    console.log(
      `Service configured: delay=${this.DELAY}ms, batchSize=${this.EVENTS_COUNT_BEFORE_SEND}`
    );
  }

  /**
   * Force the service to process any pending events immediately
   */
  flushBuffer() {
    // Create an empty event to trigger the bufferWhen logic
    this.send({ name: '_flush', data: -1 });
  }

  /**
   * Get the time remaining until the next batch send (based on inactivity)
   * This is useful for UI components that want to display a countdown
   * @returns Time in milliseconds until next batch send
   */
  getTimeUntilNextBatch(): number {
    const now = Date.now();
    const elapsed = now - this.lastEventTimestamp;
    return Math.max(0, this.DELAY - elapsed);
  }
}
