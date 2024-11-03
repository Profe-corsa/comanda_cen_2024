import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  Storage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class CamaraService {
  constructor(private storage: Storage, private toastService: ToastService) {}

  // Obtener la URL de descarga de una imagen almacenada en Firebase Storage
  async getImageByName(collection: string, imageName: string): Promise<string> {
    const filePath = `${collection}/${imageName}`;
    const storageRef = ref(this.storage, filePath);
    return await getDownloadURL(storageRef);
  }

  // Eliminar una imagen de Firebase Storage
  async deleteImage(collection: string, imageName: string): Promise<void> {
    const filePath = `${collection}/${imageName}`;
    const storageRef = ref(this.storage, filePath);
    await deleteObject(storageRef);
  }

  // Tomar una foto con la cámara y guardarla en Firebase Storage
  async tomarFoto(collection: string, imageName: any): Promise<string> {
    try {
      // Configuración para la captura de la imagen
      const image = await Camera.getPhoto({
        quality: 80,
        width: 600,
        height: 600,
        resultType: CameraResultType.DataUrl, // Obtiene la imagen como un URL base64
        source: CameraSource.Camera,
        correctOrientation: true,
      });

      if (image && image.dataUrl) {
        // Referencia en Firebase Storage donde se almacenará la imagen
        const filePath = `${collection}/${imageName}`;
        const storageRef = ref(this.storage, filePath);

        // Subir la imagen en formato base64
        await uploadString(storageRef, image.dataUrl, 'data_url');

        // Obtener la URL de descarga de la imagen
        const url = await getDownloadURL(storageRef);
        this.toastService.showExito('Imagen capturada con éxito');
        return url;
      } else {
        this.toastService.showError('No se pudo capturar la imagen');
        throw new Error('No se pudo capturar la imagen');
      }
    } catch (error) {
      this.toastService.showError('No se pudo capturar la imagen: ' + error);
      throw error;
    }
  }
}
