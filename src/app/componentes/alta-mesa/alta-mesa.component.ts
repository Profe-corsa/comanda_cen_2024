import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Mesa } from '../../clases/mesa'; // Ajusta la ruta a tu modelo Mesa
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
// import { QrScannerService } from '../../services/qrscanner.service'; // Servicio para generar el QR
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
  IonCol,
  IonGrid,
  IonRow,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { caretBackCircle } from 'ionicons/icons';
import { CamaraService } from 'src/app/services/camara.service';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.component.html',
  styleUrls: ['./alta-mesa.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonIcon,
    IonRow,
    IonCol,
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
    IonGrid,
    IonRow,
  ],
})
export class AltaMesaComponent {
  mesaForm: FormGroup;
  foto: SafeUrl | string = '';
  qrCode: SafeUrl | undefined;
  mesaFoto: string = '';
  imageName: string | null = null;

  constructor(
    private fb: FormBuilder,
    // private sanitizer: DomSanitizer,
    private camaraService: CamaraService,
    private dataSrv: DataService,
    private route: Router
  ) {
    addIcons({ caretBackCircle });

    this.mesaForm = this.fb.group({
      numero: [null, [Validators.required]],
      nroComensales: [null, [Validators.required]],
      tipo: ['', [Validators.required]],
    });
  }

  // async tomarFoto() {
  //   const photo = await Camera.getPhoto({
  //     resultType: CameraResultType.DataUrl,
  //     source: CameraSource.Camera,
  //     quality: 90,
  //   });
  //   this.foto = this.sanitizer.bypassSecurityTrustUrl(photo.dataUrl!);
  // }

  tomarFoto() {
    try {
      const imageName = 'mesa_' + Date.now().toString();
      this.camaraService.tomarFoto('mesas', imageName).then((urlFoto) => {
        //Guardar la url en el objeto usuario
        this.mesaFoto = urlFoto;
        this.imageName = imageName;
      });
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  async onSubmit() {
    if (this.mesaForm.valid) {
      const mesaData: Mesa = {
        ...this.mesaForm.value,
        foto: this.mesaFoto ?? '',
        estado: 'Disponible',
        reservas: [],
      };

      await this.dataSrv.saveObject(mesaData, 'mesas').then(() => {
        this.route.navigate(['listados/mesas']);
      });
    }
  }

  volver() {
    if (typeof this.imageName === 'string' && this.imageName !== '') {
      this.camaraService.deleteImage('mesas', this.imageName);
    }
    this.route.navigate(['/home']);
  }
}
