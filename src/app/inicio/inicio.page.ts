import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../components/popover-menu/popover-menu.component';
import { ApiService } from '../services/api.service';
import { FcmService } from '../services/fcm.services';

declare var navigator: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {

  isAdmin: boolean = false;
  estanqueSeleccionado: string | null = null;
  userName: string = '';
  menuEvent: any;

  constructor(
    private router: Router,
    private popover: PopoverController,
    private platform: Platform,
    private location: Location,
    private apiService: ApiService,
    private fcmService: FcmService
  ) { }

  ngOnInit() {
    // const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    // this.isAdmin = localStorage.getItem('userRole') === 'admin';
    // this.userName = userData.nombre || userData.email || 'Usuario';

    this.isAdmin = true;

    this.configureBackButton();

    this.initFcm();
  
    }
    async initFcm() {
      const token: string | null = await this.fcmService.getDeviceToken();
      if (token) {
        console.log('✅ Token listo:', token);
    
        this.apiService.registrarToken(token).subscribe({
          next: () => console.log('📡 Token registrado en backend'),
          error: (err) => console.error('❌ Error al registrar token:', err)
        });
      }
    
      this.fcmService.listenToForegroundMessages();
    }
  

  configureBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.exitApp();
    });

    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
    history.pushState(null, '', location.href);
  }

  exitApp() {
    if (navigator?.app?.exitApp) {
      navigator.app.exitApp();
    } else {
      window.close();
    }
  }

  onSelectEstanque(opcion: string) {
    if (this.estanqueSeleccionado === opcion) {
      this.estanqueSeleccionado = null;
    } else {
      this.estanqueSeleccionado = opcion;
    }
  }

  async openHamburgerMenu(event: any) {
    const popover = await this.popover.create({
      component: PopoverMenuComponent,
      event: event,
      componentProps: {
        isAdmin: this.isAdmin
      },
      cssClass: 'custom-popover',
      side: 'bottom', 
      alignment: 'end', 
      size: 'auto', 
      arrow: false 
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.action) {
      this.handleMenuAction(data.action);
    }
  }

  private handleMenuAction(action: string) {
    switch (action) {
      case 'reportes':
        this.goToReportes();
        break;
      case 'estanques':
        this.goToEstanques();
        break;
      case 'monitoreo':
        this.goToMonitoreo();
        break;
      case 'usuario':
        this.goToUsuario();
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  goToOption(option: string) {
    switch (option) {
      case 'Estanque':
        this.goToEstanques();
        break;
      case 'Caja':
        this.goToCajas();
        break;
      case 'Piscina':
        this.goToPiscinas();
        break;
      default:
        console.warn('Opción no reconocida');
    }
  }

  goToEstanques() {
    this.router.navigate(['/estanques']);
  }

  goToCajas() {
    this.router.navigate(['/cajas']);
  }

  goToPiscinas() {
    this.router.navigate(['/piscinas']);
  }

  async onImageClick(nombre: string, event: Event) {
    const popover = await this.popover.create({
      component: PopoverMenuComponent,
      componentProps: { tipo: nombre, isAdmin: this.isAdmin },
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

  goToUsuario() {
    this.router.navigate(['/ajustes']);
  }

  goToReportes() {
    if (this.isAdmin) {
      this.router.navigate(['/reporte']);
    } else {
      this.navigateToReporte();
    }
  }

  goToMonitoreo() {
    this.router.navigate(['/sensor-monitoring']);
  }

   logout() {
    this.apiService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        
        this.router.navigate(['/login']);
        this.location.replaceState('/login');
      },
      error: (err) => {
        console.error('Error en logout:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        this.router.navigate(['/login']);
      }
    });
  }

}
