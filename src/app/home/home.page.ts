import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../components/popover-menu/popover-menu.component'; // Ajusta la ruta si está en otra carpeta

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {
  constructor(
    private router: Router,
    private popoverCtrl: PopoverController
  ) {}

  async onImageClick(nombre: string, event: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverMenuComponent,
      componentProps: { tipo: nombre },
      event: event,
      translucent: true,
      showBackdrop: false,
      side: 'top'
    });

    await popover.present();
  }

  navigateToReporte() {
    this.router.navigate(['/reporte']);
  }
}
