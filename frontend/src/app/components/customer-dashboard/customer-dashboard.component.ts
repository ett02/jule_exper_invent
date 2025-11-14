import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  services: Service[] = [];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    console.log('CustomerDashboard: ngOnInit chiamato');
    this.apiService.getAllServices().subscribe(
      (data: Service[]) => {
        console.log('Servizi ricevuti dal backend:', data);
        this.services = data;
        console.log('Servizi assegnati al componente:', this.services);
      },
      (error) => {
        console.error('Errore nel caricamento servizi:', error);
      }
    );
  }

  bookService(service: Service) {
    console.log('Prenotazione servizio:', service);
    this.router.navigate(['/book'], { state: { service } });
  }
}
