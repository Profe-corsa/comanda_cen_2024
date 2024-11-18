import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from './environments/environment';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { LoadingComponent } from './app/componentes/loading/loading.component';
import { PushNotifications } from '@capacitor/push-notifications';
import { provideHttpClient } from '@angular/common/http';

// Call the element loader before the bootstrapModule/bootstrapApplication call
defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LoadingComponent, useClass: LoadingComponent },
    provideIonicAngular(),
    provideHttpClient(),
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() =>
      initializeApp({
        ...environment.firebaseConfig,
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
  ],
});

PushNotifications.requestPermissions().then((result) => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', (token) => {
  console.log('Push registration success, token:', token.value);
});

PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Push received:', notification);
});
