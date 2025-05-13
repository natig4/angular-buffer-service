import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buffer-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buffer-stats.component.html',
  styleUrls: ['./buffer-stats.component.css'],
})
export class BufferStatsComponent {
  @Input() count = 0;
  @Input() timeFrame = 5000;
  @Input() clicksPerTimeFrame = 0;
  @Input() queuedEvents = 0;
  @Input() timeUntilSend = 0;
}
