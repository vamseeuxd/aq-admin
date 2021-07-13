import { BusyIndicatorService } from './shared/busy-indicator/busy-indicator.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public busyIndicator: BusyIndicatorService) {}
}
