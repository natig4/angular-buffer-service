import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BufferStatsComponent } from '../components/buffer-stats/buffer-stats.component';
import { BufferVisualizationComponent } from '../components/buffer-visualization/buffer-visualization.component';
import { EventControlsComponent } from '../components/event-controls/event-controls.component';
import { EventLogComponent } from '../components/event-log/event-log.component';
import { ServiceMetricsComponent } from '../components/service-metrics/service-metrics.component';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    BufferStatsComponent,
    BufferVisualizationComponent,
    EventControlsComponent,
    EventLogComponent,
    ServiceMetricsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  dataService = inject(DataService);

  ngOnDestroy(): void {
    this.dataService.cleanup();
  }
}
