import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PopoverMenuComponent } from '../components/popover-menu/popover-menu.component';

declare var navigator: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  isAdmin = false;
  estanqueSeleccionado: string | null = null;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private platform: Platform,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const rol = params['rol'] || 'usuario';
      this.isAdmin = rol === 'admin';
    });

    // Bloqueo botón atrás físico
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.exitApp();
    });

    // Bloqueo botón atrás navegador
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
    history.pushState(null, '', location.href);
  }

  exitApp() {
    if (navigator && navigator.app && navigator.app.exitApp) {
      navigator.app.exitApp();
    } else {
      window.close();
    }
  }

  onSelectEstanque(tipo: string) {
    this.estanqueSeleccionado = tipo;
  }

  async onImageClick(nombre: string, event: Event) {
    if (!this.isAdmin) return;
    const popover = await this.popoverCtrl.create({
      component: PopoverMenuComponent,
      componentProps: { tipo: nombre },
      event,
      translucent: true,
      showBackdrop: false,
      side: 'top'
    });
    await popover.present();
  }

  navigateToReporte() {
    if (!this.isAdmin && !this.estanqueSeleccionado) {
      alert('Selecciona un estanque primero');
      return;
    }
    this.router.navigate(['/reporte'], {
      queryParams: { estanque: this.estanqueSeleccionado }
    });
  }

  // MÉTODOS QUE ELIMINAN EL ERROR TS2339
  goToEstanques() {
    console.log('Navegar a Estanques');
    // Aquí la navegación real
    // this.router.navigate(['/estanques']);
  }

  goToPiscinas() {
    console.log('Navegar a Piscinas');
    // this.router.navigate(['/piscinas']);
  }

  goToCajas() {
    console.log('Navegar a Cajas');
    // this.router.navigate(['/cajas']);
  }
}
