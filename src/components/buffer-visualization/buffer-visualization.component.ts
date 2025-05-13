import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buffer-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buffer-visualization.component.html',
  styleUrls: ['./buffer-visualization.component.css'],
})
export class BufferVisualizationComponent {
  @Input() queuedEvents = 0;
  @Input() maxBufferSize = 100;
  @Input() timeUntilSend = 0;
  @Input() timeFrame = 5000;
  @Input() bufferFillPercentage = 0;
  @Input() timerPercentage = 0;
}
