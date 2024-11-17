import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Mesa } from '../../clases/mesa'; // Ajusta la ruta a tu modelo Mesa
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { QrScannerService } from '../../services/qrscanner.service'; // Servicio para generar el QR
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLabel,
  IonCard,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.component.html',
  styleUrls: ['./alta-mesa.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonLabel,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    IonItem,
    IonContent,
    IonButton,
    IonInput,
    ReactiveFormsModule,
    IonSelect,
    IonSelectOption,
    RouterLink,
  ],
})
export class AltaMesaComponent {
  mesaForm: FormGroup;
  foto: SafeUrl | undefined;
  qrCode: SafeUrl | undefined;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private dataSrv: DataService,
    private route: Router
  ) {
    this.mesaForm = this.fb.group({
      numero: [null, [Validators.required]],
      nroComensales: [null, [Validators.required]],
      tipo: ['', [Validators.required]],
    });
  }

  async tomarFoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90,
    });
    this.foto = this.sanitizer.bypassSecurityTrustUrl(photo.dataUrl!);
  }

  async onSubmit() {
    if (this.mesaForm.valid) {
      const mesaData: Mesa = {
        ...this.mesaForm.value,
        foto: (this.foto as string) ?? '',
        estado: 'Disponible',
        reservas: [],
      };

      await this.dataSrv.saveObject(mesaData, 'mesas').then(() => {
        this.route.navigate(['home']);
      });
      // this.qrCode = this.qrCodeGenerator.scanCode(mesaData.numero.toString());
    }
  }
}
