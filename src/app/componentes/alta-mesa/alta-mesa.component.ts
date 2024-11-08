import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonHeader, IonToolbar, IonTitle, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.component.html',
  standalone: true,
  imports: [IonLabel, IonTitle, IonToolbar, IonHeader, 
    CommonModule,
    IonItem,
    IonContent,
    IonButton,
    IonInput,
    ReactiveFormsModule,
    IonSelect,
    IonSelectOption
  ],
})
export class AltaMesaComponent {
  mesaForm: FormGroup;
  foto: SafeUrl | undefined;
  qrCode: SafeUrl | undefined;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private qrCodeGenerator: QrScannerService 
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

  onSubmit() {
    if (this.mesaForm.valid) {
      const mesaData: Mesa = {
        ...this.mesaForm.value,
        foto: this.foto as string,
        estado: 'Disponible',
        reservas: [],
      };

      this.qrCode = this.qrCodeGenerator.scanCode(mesaData.numero.toString());
    }
  }
}
