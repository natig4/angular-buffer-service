import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-controls.component.html',
  styleUrls: ['./event-controls.component.css'],
})
export class EventControlsComponent {
  @Input() timeFrame = 5000;
  @Input() maxBufferSize = 100;

  @Output() eventSubmit = new EventEmitter<string>();
  @Output() flushBuffer = new EventEmitter<void>();
  @Output() configUpdate = new EventEmitter<{
    timeFrame: number;
    bufferSize: number;
  }>();

  // Internal state for inputs
  configTimeFrame = 5000;
  configBufferSize = 100;

  ngOnInit() {
    this.configTimeFrame = this.timeFrame;
    this.configBufferSize = this.maxBufferSize;
  }

  // When inputs change from parent
  ngOnChanges() {
    this.configTimeFrame = this.timeFrame;
    this.configBufferSize = this.maxBufferSize;
  }

  onEventClick(eventType: string) {
    this.eventSubmit.emit(eventType);
  }

  onFlushClick() {
    this.flushBuffer.emit();
  }

  onApplySettings() {
    this.configUpdate.emit({
      timeFrame: this.configTimeFrame,
      bufferSize: this.configBufferSize,
    });
  }
}
