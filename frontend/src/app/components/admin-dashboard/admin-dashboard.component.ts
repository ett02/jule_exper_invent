import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  services: Service[] = [];
  barbers: Barber[] = [];

  newService: Partial<Service> = {
    nome: '',
    durata: 0,
    prezzo: 0,
    descrizione: ''
  };

  newBarber: Partial<Barber> = {
    nome: '',
    cognome: '',
    esperienza: '',
    specialita: ''
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
  }

  loadServices(): void {
    this.apiService.getAllServices().subscribe((data: Service[]) => this.services = data);
  }

  loadBarbers(): void {
    this.apiService.getAllBarbers().subscribe((data: Barber[]) => this.barbers = data);
  }

  createService(): void {
    this.apiService.createService(this.newService).subscribe(() => {
      this.loadServices();
      this.newService = { nome: '', durata: 0, prezzo: 0, descrizione: '' };
    });
  }

  deleteService(id: number | undefined): void {
    if (id) {
      this.apiService.deleteService(id).subscribe(() => this.loadServices());
    }
  }

  createBarber(): void {
    this.apiService.createBarber(this.newBarber).subscribe(() => {
      this.loadBarbers();
      this.newBarber = { nome: '', cognome: '', esperienza: '', specialita: '' };
    });
  }

  deleteBarber(id: number | undefined): void {
    if (id) {
      this.apiService.deleteBarber(id).subscribe(() => this.loadBarbers());
    }
  }
}
