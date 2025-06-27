import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
  standalone: true,
  imports: [IonicModule]
})

export class CustomAlertComponent implements OnInit {

  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';

  iconSvg!: SafeHtml;

  constructor(private modalController: ModalController, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.iconSvg = this.sanitizer.bypassSecurityTrustHtml(
      this.type === 'success'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#28a745" viewBox="0 0 16 16">
             <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM7 11.414l4.707-4.707-1.414-1.414L7 8.586 5.707 7.293 4.293 8.707 7 11.414z"/>
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#dc3545" viewBox="0 0 16 16">
             <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.646 4.646l2.828 2.828-2.828 2.828 1.414 1.414L8 8.828l2.828 2.828 1.414-1.414-2.828-2.828 2.828-2.828-1.414-1.414L8 6.586 5.172 3.758 4.646 4.646z"/>
           </svg>`
    );
  }

  close() {
    this.modalController.dismiss();
  }
}
