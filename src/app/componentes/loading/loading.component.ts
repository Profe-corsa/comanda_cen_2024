import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-loading',
  template: `
    <div class="contenedor" *ngIf="loadingService.loadingStatus">
      <div class="corazon">
        <img
          src="../../../assets/icon/logo_Uno.png"
          height="100"
          alt="loading"
        />
      </div>
    </div>
  `,
  styleUrls: ['./loading.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
