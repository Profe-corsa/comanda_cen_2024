import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { PushMailNotificationService } from './push-mail-notification.service';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../clases/usuario';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<Usuario | null>(null); // Estado reactivo del usuario
  public user$ = this.userSubject.asObservable(); // Observable para suscribirse

  constructor(
    private auth: Auth,
    private toastService: ToastService,
    private router: Router,
    private notificationService: PushMailNotificationService,
    private firestore: Firestore
  ) {
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await this.loadUserData(firebaseUser);
        this.userSubject.next(appUser);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const res = await signInWithEmailAndPassword(this.auth, email, password);
      const appUser = await this.loadUserData(res.user);
      this.userSubject.next(appUser);
      return res;
    } catch (error: any) {
      const errorMessage = this.toastService.translateFirebaseError(error.code);
      this.toastService.showError(errorMessage);
    }
  }

  async register(email: string, password: string): Promise<any> {
    try {
      const res = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return res;
    } catch (error: any) {
      const errorMessage = this.toastService.translateFirebaseError(error.code);
      this.toastService.showError(errorMessage);
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  //Obtiene al usuario completo de la base de datos y permite manejarlo en cualquier parte de la app
  getUserLogueado(): Usuario | null {
    return this.userSubject.value;
  }

  private async loadUserData(firebaseUser: FirebaseUser): Promise<Usuario> {
    const userDocRef = doc(this.firestore, `usuarios/${firebaseUser.uid}`);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as Usuario;
    }
    return {} as Usuario;
  }

  async logOut(): Promise<void> {
    try {
      await this.notificationService.deleteToken();
      await signOut(this.auth);
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      this.toastService.showError(
        'Error al cerrar sesión. Este fue el motivo: ' + error
      );
    }
  }
}
