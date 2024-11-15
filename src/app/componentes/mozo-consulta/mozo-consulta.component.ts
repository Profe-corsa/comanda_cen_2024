import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mozo-consulta',
  templateUrl: './mozo-consulta.component.html',
  styleUrls: ['./mozo-consulta.component.scss'],
})
export class MozoConsultaComponent {
  @Input() usuario: any;

  responderConsulta() {
    console.log(`Respuesta del mozo ${this.usuario.nombre}`);
    // Aquí puedes manejar la respuesta del mozo
  }
}
