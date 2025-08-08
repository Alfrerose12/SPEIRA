import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popover-menu',
  template: `
    <ion-list lines="none" [class]="mode + '-menu'">

      <!-- Menú Hamburguesa -->
      <ng-container *ngIf="mode === 'hamburger'">

        <!-- Admin: Reportes -->
        <ion-item 
          button detail="false"
          *ngIf="isAdmin"  
          (click)="close('reportes')"
          class="menu-item">
          <ion-icon name="document-text-outline" slot="start"></ion-icon>
          <ion-label>Reportes</ion-label>
        </ion-item>

        <!-- Admin: Estanques -->
        <ion-item 
          button detail="false" 
          *ngIf="isAdmin" 
          (click)="close('estanques')"
          class="menu-item">
          <ion-icon name="water-outline" slot="start"></ion-icon>
          <ion-label>Estanques</ion-label>
        </ion-item>

        <!-- Monitoreo -->
        <ion-item 
          button detail="false" 
          (click)="close('monitoreo')"
          class="menu-item">
          <ion-icon name="analytics-outline" slot="start"></ion-icon>
          <ion-label>Monitoreo</ion-label>
        </ion-item>

        <!-- Ajustes -->
        <ion-item 
          button detail="false" 
          (click)="close('usuario')"
          class="menu-item">
          <ion-icon name="settings-outline" slot="start"></ion-icon>
          <ion-label>Mis Datos</ion-label>
        </ion-item>

      </ng-container>

      <!-- Menú Contextual -->
      <ng-container *ngIf="mode === 'context'">
        <ion-list-header>Opciones para {{ tipo }}</ion-list-header>

        <ion-item button (click)="close('ver-detalles')" class="context-item">
          <ion-icon name="eye-outline" slot="start"></ion-icon>
          <ion-label>Ver Detalles</ion-label>
        </ion-item>

        <ion-item button (click)="close('editar')" class="context-item">
          <ion-icon name="create-outline" slot="start"></ion-icon>
          <ion-label>Editar</ion-label>
        </ion-item>

        <ion-item-divider></ion-item-divider>

        <ion-item button (click)="close('cancelar')" class="context-item cancel">
          <ion-icon name="close-circle-outline" slot="start"></ion-icon>
          <ion-label>Cancelar</ion-label>
        </ion-item>
      </ng-container>

      <!-- Filtro de Sensores -->
      <ng-container *ngIf="mode === 'filtro'">
        <ion-list-header>Filtrar por Sensor</ion-list-header>

        <ion-item button (click)="seleccionarFiltro('')">
          <ion-label>Todos</ion-label>
        </ion-item>

        <ion-item button *ngFor="let sensor of availableSensors" (click)="seleccionarFiltro(sensor.key)">
          <ion-label>{{ sensor.name }}</ion-label>
        </ion-item>
      </ng-container>

    </ion-list>
  `,
  styleUrls: ['./popover-menu.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PopoverMenuComponent {
  @Input() mode: 'hamburger' | 'context' | 'filtro' = 'hamburger';
  @Input() availableSensors: any[] = [];
  @Input() tipo: string = '';
  @Input() isAdmin: boolean = false;

  constructor(private popoverCtrl: PopoverController) { }

  close(action: string) {
    this.popoverCtrl.dismiss({
      action,
      mode: this.mode,
      ...(this.mode === 'context' && { tipo: this.tipo })
    });
  }

  seleccionarFiltro(key: string) {
    this.popoverCtrl.dismiss({
      action: 'filtro-seleccionado',
      filtro: key
    });
  }
}
