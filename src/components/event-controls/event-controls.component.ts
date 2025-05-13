import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-event-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-controls.component.html',
  styleUrls: ['./event-controls.component.css'],
})
export class EventControlsComponent implements OnInit {
  private dataService = inject(DataService);

  configTimeFrame = 5000;
  configBufferSize = 100;

  ngOnInit() {
    this.configTimeFrame = this.dataService.timeFrame;
    this.configBufferSize = this.dataService.maxBufferSize;
  }

  onEventClick(eventType: string) {
    this.dataService.submitEvent(eventType);
  }

  onFlushClick() {
    this.dataService.flushBuffer();
  }

  onApplySettings() {
    this.dataService.updateConfig({
      timeFrame: this.configTimeFrame,
      bufferSize: this.configBufferSize,
    });
  }
}
