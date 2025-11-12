import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  newService = {
    nome: '',
    durata: 0,
    prezzo: 0,
    descrizione: ''
  };

  newBarber = {
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
    this.apiService.getAllServices().subscribe((data: any) => this.services = data);
  }

  loadBarbers(): void {
    this.apiService.getAllBarbers().subscribe((data: any) => this.barbers = data);
  }

  createService(): void {
    this.apiService.createService(this.newService).subscribe(() => {
      this.loadServices();
      this.newService = { nome: '', durata: 0, prezzo: 0, descrizione: '' };
    });
  }

  deleteService(id: number): void {
    this.apiService.deleteService(id).subscribe(() => this.loadServices());
  }

  createBarber(): void {
    this.apiService.createBarber(this.newBarber).subscribe(() => {
      this.loadBarbers();
      this.newBarber = { nome: '', cognome: '', esperienza: '', specialita: '' };
    });
  }

  deleteBarber(id: number): void {
    this.apiService.deleteBarber(id).subscribe(() => this.loadBarbers());
  }
}
