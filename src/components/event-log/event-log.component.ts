import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.css'],
})
export class EventLogComponent {
  @Input() eventLog: Array<{
    timestamp: Date;
    eventType: string;
    count: number;
  }> = [];

  @Input() isProcessingBatch = false;
}
