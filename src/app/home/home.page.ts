import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../components/popover-menu/popover-menu.component'; // Ajusta la ruta si está en otra carpeta

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  isAdmin: boolean = false; // Define isAdmin property con valor predeterminado
  estanques: number[] = [1, 2, 3, 4, 5]; // Lista de estanques disponibles
  estanqueSeleccionado: string | null = null; // Imagen seleccionada por el usuario
  selectedEstanque: number | null = null; // Número de estanque seleccionado

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const rol = params['rol'] || 'usuario';
      this.isAdmin = rol === 'admin'; // Actualizar isAdmin según el rol
      console.log(`Rol recibido: ${rol}, isAdmin: ${this.isAdmin}`);
    });
  }

  async onImageClick(nombre: string, event: Event) {
    if (!this.isAdmin) {
      console.log('Acceso denegado: Solo administradores pueden acceder a esta sección.');
      return;
    }

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

  onSelectEstanque(tipo: string) {
    this.estanqueSeleccionado = tipo;
    console.log(`Imagen seleccionada: ${tipo}`);
  }

  onEstanqueChange(event: any) {
    this.selectedEstanque = event.detail.value;
    console.log(`Estanque seleccionado: ${this.selectedEstanque}`);
  }

  navigateToReporte() {
    if (!this.isAdmin && this.selectedEstanque === null) {
      console.log('Por favor selecciona un estanque antes de generar el reporte.');
      return;
    }

    this.router.navigate(['/reporte'], {
      queryParams: { estanque: this.selectedEstanque }
    });
  }
}