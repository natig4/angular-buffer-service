import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-metrics.component.html',
  styleUrls: ['./service-metrics.component.css'],
})
export class ServiceMetricsComponent {
  @Input() totalEventsProcessed = 0;
  @Input() totalBatchesSent = 0;
  @Input() isProcessingBatch = false;
  @Input() averageBatchSize = 0;
}
