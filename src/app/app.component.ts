import { Component } from '@angular/core';
import { Platform, IonicModule } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {
  authState$!: Observable<any>;

  constructor(private platform: Platform, private auth: Auth) {
    this.platform.ready().then(() => {
      document.body.classList.remove('dark');
      document.body.classList.add('light');

      // Observa el estado de autenticación
      this.authState$ = new Observable((observer) => {
        this.auth.onAuthStateChanged((user) => {
          observer.next(user);
        });
      });

      this.authState$.subscribe((user) => {
        if (user) {
          console.log('Usuario autenticado:', user);
        } else {
          console.log('No hay usuario autenticado');
        }
      });
    });
  }
}