import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CustomAlertComponent } from '../components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false,
})
export class ReportesPage implements OnInit {

  reportForm: FormGroup;

  ngOnInit() {
  }

  constructor(private router: Router, private modal: ModalController, private fb: FormBuilder) {
    this.reportForm = this.fb.group({
      reportType: ['', Validators.required],
      date: ['', Validators.required]
    });
   }

  async onSubmit() {
    if (this.reportForm.valid) {
      await this.showCustomAlert('Reporte enviado exitosamente', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.showCustomAlert('Por favor completa todos los campos correctamente', 'error');
    }
  }

  async showCustomAlert(message: string, type: 'success' | 'error' = 'success') {
    const modal = await this.modal.create({
      component: CustomAlertComponent,
      componentProps: { message, type },
      cssClass: 'custom-alert-modal', 
      backdropDismiss: false
    });
    await modal.present();
  }
}
