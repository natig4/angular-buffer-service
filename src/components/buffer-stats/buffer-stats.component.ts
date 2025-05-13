import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-buffer-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buffer-stats.component.html',
  styleUrls: ['./buffer-stats.component.css'],
})
export class BufferStatsComponent {
  dataService = inject(DataService);
}
