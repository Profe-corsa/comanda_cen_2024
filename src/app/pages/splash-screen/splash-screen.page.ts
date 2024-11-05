import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioRegistroComponent } from 'src/app/componentes/usuario-registro/usuario-registro.component';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UsuarioRegistroComponent,
    IonContent,
    IonButton,
  ],
})
export class SplashScreenPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const splashShown = sessionStorage.getItem('splashShown');

    if (!splashShown) {
      setTimeout(() => {
        sessionStorage.setItem('splashShown', 'true');
        this.router.navigate(['/login']);
      }, 7200); // Ajustar el tiempo total según las animaciones
    } else {
      this.router.navigate(['/login']);
    }
  }
}
