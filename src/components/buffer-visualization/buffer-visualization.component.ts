import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-buffer-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buffer-visualization.component.html',
  styleUrls: ['./buffer-visualization.component.css'],
})
export class BufferVisualizationComponent {
  dataService = inject(DataService);
}
