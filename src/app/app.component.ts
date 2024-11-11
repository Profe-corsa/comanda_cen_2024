import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private startSound = new Audio('assets/sounds/start.mp3');
  private closeSound = new Audio('assets/sounds/close.mp3');

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.playStartSound();
    });
    document.addEventListener('pause', () => this.playCloseSound());
  }

  private playStartSound() {
    this.startSound.play();
  }

  public playCloseSound() {
    this.closeSound.play();
  }
}
