import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  services: any[] = [];
  barbers: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
  }

  loadServices(): void {
    this.apiService.getAllServices().subscribe(
      (data) => {
        this.services = data;
      },
      (error) => {
        console.error('Errore caricamento servizi:', error);
      }
    );
  }

  loadBarbers(): void {
    // TODO: Implementare API GET /barbers
    // Mock data per ora
    this.barbers = [
      { id: 1, nome: 'Marco', cognome: 'Bianchi', esperienza: '10 anni', specialita: 'Taglio classico' },
      { id: 2, nome: 'Luca', cognome: 'Verdi', esperienza: '5 anni', specialita: 'Barba' },
      { id: 3, nome: 'Giuseppe', cognome: 'Neri', esperienza: '8 anni', specialita: 'Sfumature' }
    ];
  }

  deleteService(serviceId: number): void {
    if (confirm('Sei sicuro di voler eliminare questo servizio?')) {
      // TODO: Implementare API DELETE /services/{id}
      console.log('Elimina servizio:', serviceId);
      alert('Servizio eliminato (TODO: Implementare API)');
      this.loadServices();
    }
  }

  deleteBarber(barberId: number): void {
    if (confirm('Sei sicuro di voler eliminare questo barbiere?')) {
      // TODO: Implementare API DELETE /barbers/{id}
      console.log('Elimina barbiere:', barberId);
      alert('Barbiere eliminato (TODO: Implementare API)');
      this.loadBarbers();
    }
  }
}
