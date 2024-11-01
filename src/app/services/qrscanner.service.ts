import { Injectable } from '@angular/core';
import { BarcodeScanner, Barcode } from '@capacitor-mlkit/barcode-scanning';

@Injectable({
  providedIn: 'root',
})
export class QrScannerService {
  isSupported = false;
  barcodes: Barcode[] = [];

  dispositivo = 'mobile'; //cambiar a mobile para las pruebas en el celu, cualq. otro nombre para el navegador
  constructor() {}

  async ngOnInit() {
    // Verificar si el escaneo de códigos de barras es compatible en el dispositivo
    const result = await BarcodeScanner.isSupported();
    this.isSupported = result.supported;

    if (this.isSupported) {
      // Escuchar el progreso de la instalación
      BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (progress) => {
          console.log('Progreso de instalación:', progress);
        }
      );

      // Instalar el módulo
      await this.installGoogleBarcodeScannerModule();
    }
  }

  async installGoogleBarcodeScannerModule() {
    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
      console.log(
        'Módulo de escaneo de códigos de barras instalado correctamente'
      );
    } catch (error) {
      console.error(
        'Error al instalar el módulo de escaneo de códigos de barras:',
        error
      );
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async scanCode(options: any) {
    const granted = await this.requestPermissions();
    if (!granted) {
      console.log('Permisos de cálculo denegados');
      return;
    }

    return BarcodeScanner.scan(options)
      .then((barcodeData: any) => {
        console.log(barcodeData);
        if (barcodeData.barcodes && barcodeData.barcodes.length > 0) {
          console.log(barcodeData.barcodes[0].rawValue);
          return barcodeData.barcodes[0].rawValue;
        } else {
          console.log('No se encontró ningún código escaneado');
          return null;
        }
      })
      .catch((err) => {});
  }

  scanDni() {
    let options = { prompt: 'Escaneá el DNI', formats: 'PDF_417' };

    return this.scanCode(options).then((response: string | null) => {
      if (response) {
        return response.split('@');
      } else {
        console.log('No se pudo obtener el valor del código');
        return null;
      }
    });
  }
}
