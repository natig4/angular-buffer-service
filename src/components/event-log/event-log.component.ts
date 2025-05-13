import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.css'],
})
export class EventLogComponent {
  dataService = inject(DataService);
}
