import { Component, Input } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-popover-menu',
  template: `
    <ion-list>
      <ion-list-header>Opciones para {{ tipo }}</ion-list-header>
      <ion-item button (click)="seleccionar('Ver Detalles')">Ver Detalles</ion-item>
      <ion-item button (click)="seleccionar('Editar')">Editar</ion-item>
      <ion-item button (click)="cerrar()">Cancelar</ion-item>
    </ion-list>
  `,
  standalone: true,
  imports: [IonicModule]
})
export class PopoverMenuComponent {
  @Input() tipo: string = '';

  constructor(private popoverCtrl: PopoverController) {}

  seleccionar(opcion: string) {
    console.log(`${opcion} para ${this.tipo}`);
    this.popoverCtrl.dismiss();
  }

  cerrar() {
    this.popoverCtrl.dismiss();
  }
}
