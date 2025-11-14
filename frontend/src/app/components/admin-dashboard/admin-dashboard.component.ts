import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Interfaccia per ShopHours
interface ShopHours {
  id?: number;
  giorno: number;
  orarioApertura: string;
  orarioChiusura: string;
  isChiuso: boolean;
}

// Interfaccia per WeekDay
interface WeekDay {
  value: number;
  name: string;
  hours: ShopHours | null;
}

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

  weekDays: WeekDay[] = [
    { value: 1, name: 'Lunedì', hours: null },
    { value: 2, name: 'Martedì', hours: null },
    { value: 3, name: 'Mercoledì', hours: null },
    { value: 4, name: 'Giovedì', hours: null },
    { value: 5, name: 'Venerdì', hours: null },
    { value: 6, name: 'Sabato', hours: null },
    { value: 0, name: 'Domenica', hours: null }
  ];

  showShopHoursModal = false;
  selectedDay: number | null = null;
  shopHoursForm = {
    giorno: 0,
    orarioApertura: '09:00',
    orarioChiusura: '19:00',
    isChiuso: false
  };

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
    this.loadShopHours();
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

  loadShopHours(): void {
    // TODO: Implementare API GET /shop-hours
    this.http.get<ShopHours[]>('http://localhost:8080/shop-hours').subscribe(
      (data) => {
        console.log('Orari salone ricevuti:', data);
        // Associa orari ai giorni
        this.weekDays.forEach(day => {
          const hours = data.find(h => h.giorno === day.value);
          day.hours = hours || null;
        });
      },
      (error) => {
        console.error('Errore caricamento orari:', error);
      }
    );
  }

  editShopHours(dayValue: number): void {
    this.selectedDay = dayValue;
    const dayHours = this.weekDays.find(d => d.value === dayValue)?.hours;

    if (dayHours) {
      this.shopHoursForm = {
        giorno: dayValue,
        orarioApertura: dayHours.orarioApertura,
        orarioChiusura: dayHours.orarioChiusura,
        isChiuso: dayHours.isChiuso
      };
    } else {
      this.shopHoursForm = {
        giorno: dayValue,
        orarioApertura: '09:00',
        orarioChiusura: '19:00',
        isChiuso: false
      };
    }

    this.showShopHoursModal = true;
  }

  saveShopHours(): void {
    this.http.post('http://localhost:8080/shop-hours', this.shopHoursForm).subscribe(
      () => {
        alert('✅ Orari salvati con successo!');
        this.closeShopHoursModal();
        this.loadShopHours(); // Ricarica orari
      },
      (error) => {
        console.error('Errore salvataggio orari:', error);
        alert('❌ Errore durante il salvataggio');
      }
    );
  }

  closeShopHoursModal(): void {
    this.showShopHoursModal = false;
    this.selectedDay = null;
  }

  getSelectedDayName(): string {
    if (this.selectedDay === null) return '';
    return this.weekDays.find(d => d.value === this.selectedDay)?.name || '';
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
