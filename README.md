# Angular Buffer Service Demo

A demonstration application showcasing a reactive buffering pattern for handling high-frequency events in Angular applications using RxJS.

**[View Live Demo](https://natig4.github.io/angular-buffer-service/)**

## Overview

This project demonstrates a powerful pattern for efficiently handling high-frequency events in Angular applications. The buffer service aggregates events over time and processes them in batches, which is ideal for:

- Analytics tracking with reduced network overhead
- User interaction events (clicks, form changes, etc.)
- Telemetry data collection
- Any scenario where you want to batch events for performance

## Features

- **Time-based buffering**: Automatically sends events after a configurable period of inactivity
- **Count-based buffering**: Sends events when a specific number has accumulated
- **Manual flush control**: Force the buffer to process pending events immediately
- **Real-time visualizations**: See the buffer filling and timer countdown
- **Configurable settings**: Adjust buffer size and time parameters
- **Comprehensive metrics**: Track events processed, batch sizes, and processing status

## Core Technology

The heart of this project is the `EventsService` which leverages RxJS operators to efficiently manage event buffering:

- `bufferWhen`: Dynamically determines when to buffer events
- `race`: Allows multiple conditions to trigger a buffer flush
- `tap` and `switchMap`: Process events in a reactive pipeline
- Angular Signals: Provide reactive state management throughout the application

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/natig4/angular-buffer-service.git
   cd angular-buffer-service
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## How It Works

The demo allows you to generate three types of events (Primary, Secondary, and Tertiary) by clicking buttons. These events are sent to the `EventsService`, which buffers them based on:

1. **Time threshold**: Events are automatically sent after a configurable period (default: 5 seconds) of inactivity
2. **Count threshold**: Events are sent when a certain number accumulate (default: 100 events)
3. **Manual flush**: You can force the buffer to send events immediately with the "Flush Buffer Now" button

The UI visualizes:

- Current buffer fill level
- Time remaining until automatic send
- Event log showing individual events and batches
- Service metrics (events processed, batches sent, etc.)

## Using the Buffer Service in Your Own Projects

The `EventsService` is designed to be reusable in your own Angular applications. Here's how to implement it:

### 1. Copy the EventsService

Add the `events.service.ts` file to your project's services folder.

### 2. Inject and Configure the Service

```typescript
import { Component, inject } from "@angular/core";
import { EventsService } from "./services/events.service";

@Component({
  selector: "app-root",
  template: "...",
})
export class AppComponent {
  private eventsService = inject(EventsService);

  constructor() {
    // Configure the buffer service
    this.eventsService.configure({
      delay: 3000, // 3 seconds inactivity before sending
      batchSize: 50, // Send after 50 events
    });
  }

  trackUserEvent(action: string) {
    // Send event to buffer
    this.eventsService.send({
      name: action,
      data: Date.now(),
    });
  }

  forceSync() {
    // Manually flush the buffer
    this.eventsService.flushBuffer();
  }
}
```

### 3. Subscribe to Batched Events

```typescript
ngOnInit() {
  this.eventsService.bufferedEvents$.subscribe(events => {
    // Process the batch of events
    this.analyticsService.sendBatch(events);
  });
}
```

## Implementation Details

The buffer service uses a combination of RxJS operators to create an efficient event processing pipeline:

```typescript
this.eventsSubject
  .pipe(
    // Store events in our currentBuffer variable
    tap((event) => {
      this.currentBuffer.push(event);
      this.lastEventTimestamp = Date.now();
      this.bufferSizeSubject.next(this.currentBuffer.length);
    }),
    // Buffer events based on either time delay, count threshold, or explicit flush
    bufferWhen(() =>
      race([
        // Condition 1: Time-based buffer - triggers after DELAY ms of inactivity
        this.eventsSubject.pipe(delay(this.DELAY)),

        // Condition 2: Count-based buffer - triggers after collecting EVENTS_COUNT_BEFORE_SEND events
        this.eventsSubject.pipe(bufferCount(this.EVENTS_COUNT_BEFORE_SEND)),

        // Condition 3: Manual flush trigger
        this.flushSubject.asObservable(),
      ])
    ),
    // Process batched events
    switchMap((events) => {
      // In a real application, you would send these events to your backend
      // ...
    })
  )
  .subscribe({
    // Handle success/error cases
  });
```

## Customization

### Buffer Service Configuration

The service accepts the following configuration options:

```typescript
eventsService.configure({
  delay: 5000, // Time in ms to wait before sending a batch (default: 5000)
  batchSize: 100, // Number of events to collect before sending (default: 100)
});
```

### Event Structure

The demo uses a simple event structure, but you can customize this to fit your specific needs:

```typescript
// Example structure used in the demo
interface IEventDto {
  name: string; // Event name/type
  data: number; // Event data
}

// You can replace this with your own structure
interface YourCustomEventType {
  eventType: string;
  timestamp: Date;
  userId: string;
  properties: Record<string, any>;
  // Any other fields you need
}
```

The buffer service can work with any event structure - simply modify the generic type or interface to match your requirements.

## Architecture

The application is built with a modern Angular architecture:

- **Standalone Components**: Each UI element is an independent, reusable component
- **Signal-based State Management**: Reactive state using Angular's signals API
- **Service-Component Communication**: Clean separation of concerns between services and components
- **Computed Values**: Derived state calculated from base signals

## Performance Benefits

Using the buffer pattern can significantly reduce:

- Network requests: By grouping multiple events into a single request
- Server load: By reducing the number of connections and requests
- Client resource usage: By minimizing DOM updates and processing overhead
- Perceived latency: By handling events in the background without blocking the UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Angular team for creating an amazing framework
- The RxJS team for powerful reactive extensions
