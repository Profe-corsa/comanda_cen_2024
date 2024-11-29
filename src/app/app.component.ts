import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

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
    // this.initializeApp();
    this.platform.ready().then(() => {
      this.playStartSound();
    });
    document.addEventListener('pause', () => this.playCloseSound());
  }

  // initializeApp() {
  //   this.platform.ready().then(() => {
  //     if (this.platform.is('capacitor')) {
  //       // GoogleAuth.initialize();
  //       this.playStartSound();
  //     }
  //   });
  // }

  private playStartSound() {
    this.startSound.play();
  }

  public playCloseSound() {
    this.closeSound.play();
  }
}
