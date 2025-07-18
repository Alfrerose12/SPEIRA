import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../components/popover-menu/popover-menu.component';

declare var navigator: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {

  isAdmin = false;
  estanqueSeleccionado: string = "";

  constructor(
    private router: Router,
    private popover: PopoverController,
    private route: ActivatedRoute,
    private platform: Platform,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const rol = params['rol'] || 'usuario';
      this.isAdmin = rol === 'admin';
    });

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.exitApp();
    });

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
    const popover = await this.popover.create({
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

  goToEstanques() {
    console.log('Navegando a estanques');
    // this.router.navigate(['/estanques']);
  }

  goToPiscinas() {
    console.log('Navegando a piscinas');
    // this.router.navigate(['/piscinas']);
  }

  goToCajas() {
    console.log('Navegando a cajas');
    // this.router.navigate(['/cajas']);
  }

  goToUsuario() {
    this.router.navigate(['/ajustes']);
  }

  goToReporte() {
    this.router.navigate(['/reporte']);
  }

  goToMonitoreo() {
    this.router.navigate(['/sensor-monitoring']);
  }

  logout() {
    this.router.navigate(['/login']);
    this.location.replaceState('/login');
  }
}
