import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-service-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-metrics.component.html',
  styleUrls: ['./service-metrics.component.css'],
})
export class ServiceMetricsComponent {
  dataService = inject(DataService);
}
