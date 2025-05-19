import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      document.body.classList.remove('dark'); // Elimina modo oscuro
      document.body.classList.add('light');   // (opcional, si defines estilos para light)
    });
  }
}