import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { Appointment } from '../../models/appointment.model';

// Interfacce (invariate)
interface ShopHours {
  id?: number;
  giorno: number;
  orarioApertura: string;
  orarioChiusura: string;
  isChiuso: boolean;
}
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
  
  // --- NUOVA LOGICA PER LE VISTE ---
  currentView: 'dashboard' | 'servizi' | 'barbieri' | 'orari' = 'dashboard';

  // --- Proprietà per Appuntamenti ---
  todaysAppointments: Appointment[] = [];
  selectedDate: string;

  // --- Proprietà per i Servizi ---
  services: Service[] = [];
  serviceForm: Partial<Service> = {};
  isEditingService = false;

  // --- Proprietà per i Barbieri ---
  barbers: Barber[] = [];
  barberForm: Partial<Barber> = {};
  isEditingBarber = false;

  // --- Proprietà per gli Orari Salone ---
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
  ) {
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Carichiamo tutto all'avvio, così le sezioni sono pronte
    this.loadServices();
    this.loadBarbers();
    this.loadShopHours();
    this.loadAppointmentsByDate(this.selectedDate); 
  }

  // --- NUOVO METODO PER CAMBIARE VISTA ---
  changeView(view: 'dashboard' | 'servizi' | 'barbieri' | 'orari'): void {
    this.currentView = view;
  }

  // ===================================================
  // --- GESTIONE APPUNTAMENTI ---
  // ===================================================

  loadAppointmentsByDate(date: string): void {
    this.apiService.getAppointmentsByDate(date).subscribe(
      (data) => {
        this.todaysAppointments = data;
      },
      (error) => {
        console.error('Errore caricamento appuntamenti:', error);
      }
    );
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.loadAppointmentsByDate(this.selectedDate);
  }

  setAppointmentStatus(app: Appointment, status: 'IN_CORSO' | 'COMPLETATO'): void {
    this.apiService.updateAppointmentStatus(app.id, status).subscribe(
      (updatedAppointment) => {
        app.stato = updatedAppointment.stato;
        alert(`Appuntamento ${app.id} aggiornato a ${status}`);
      },
      (error) => {
        console.error('Errore aggiornamento stato:', error);
        alert('Impossibile aggiornare lo stato.');
      }
    );
  }

  // ===========================================
  // --- GESTIONE SERVIZI (Logica invariata) ---
  // ===========================================
  loadServices(): void { /* ...logica invariata... */ 
    this.apiService.getAllServices().subscribe(
      (data) => { this.services = data; },
      (error) => { console.error('Errore caricamento servizi:', error); }
    );
  }
  saveService(): void { /* ...logica invariata... */ 
    if (this.isEditingService && this.serviceForm.id) {
      this.apiService.updateService(this.serviceForm.id, this.serviceForm).subscribe(
        () => {
          alert('✅ Servizio aggiornato!');
          this.resetServiceForm();
          this.loadServices();
        },
        (error) => console.error('Errore aggiornamento servizio:', error)
      );
    } else {
      this.apiService.createService(this.serviceForm).subscribe(
        () => {
          alert('✅ Servizio creato!');
          this.resetServiceForm();
          this.loadServices();
        },
        (error) => console.error('Errore creazione servizio:', error)
      );
    }
  }
  editService(service: Service): void { this.isEditingService = true; this.serviceForm = { ...service }; }
  deleteService(serviceId: number): void { /* ...logica invariata... */ 
    if (confirm('Sei sicuro?')) {
      this.apiService.deleteService(serviceId).subscribe(
        () => {
          alert('Servizio eliminato.');
          this.loadServices();
        },
        (error) => console.error('Errore cancellazione servizio:', error)
      );
    }
  }
  resetServiceForm(): void { this.isEditingService = false; this.serviceForm = {}; }

  // ===========================================
  // --- GESTIONE BARBIERI (Logica invariata) ---
  // ===========================================
  loadBarbers(): void { /* ...logica invariata... */ 
    this.apiService.getAllBarbers().subscribe(
      (data) => { this.barbers = data; },
      (error) => { console.error('Errore caricamento barbieri:', error); }
    );
  }
  saveBarber(): void { /* ...logica invariata... */ 
    if (this.isEditingBarber && this.barberForm.id) {
      this.apiService.updateBarber(this.barberForm.id, this.barberForm).subscribe(
        () => {
          alert('✅ Barbiere aggiornato!');
          this.resetBarberForm();
          this.loadBarbers();
        },
        (error) => console.error('Errore aggiornamento barbiere:', error)
      );
    } else {
      this.apiService.createBarber(this.barberForm).subscribe(
        () => {
          alert('✅ Barbiere creato!');
          this.resetBarberForm();
          this.loadBarbers();
        },
        (error) => console.error('Errore creazione barbiere:', error)
      );
    }
  }
  editBarber(barber: Barber): void { this.isEditingBarber = true; this.barberForm = { ...barber }; }
  deleteBarber(barberId: number): void { /* ...logica invariata... */ 
    if (confirm('Sei sicuro?')) {
      this.apiService.deleteBarber(barberId).subscribe(
        () => {
          alert('Barbiere eliminato.');
          this.loadBarbers();
        },
        (error) => console.error('Errore cancellazione barbiere:', error)
      );
    }
  }
  resetBarberForm(): void { this.isEditingBarber = false; this.barberForm = { nome: '', cognome: '', esperienza: '', specialita: '' }; }

  // ===========================================
  // --- GESTIONE ORARI SALONE (Logica invariata) ---
  // ===========================================
  loadShopHours(): void { /* ...logica invariata... */ 
    this.http.get<ShopHours[]>('http://localhost:8080/shop-hours').subscribe(
      (data) => {
        this.weekDays.forEach(day => {
          const hours = data.find(h => h.giorno === day.value);
          day.hours = hours || null;
        });
      },
      (error) => { console.error('❌ Errore caricamento orari:', error); }
    );
  }
  editShopHours(dayValue: number): void { /* ...logica invariata... */ 
    this.selectedDay = dayValue;
    const dayHours = this.weekDays.find(d => d.value === dayValue)?.hours;
    if (dayHours) {
      this.shopHoursForm = { ...dayHours };
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
  saveShopHours(): void { /* ...logica invariata... */ 
    this.http.post('http://localhost:8080/shop-hours', this.shopHoursForm).subscribe(
      () => {
        alert('✅ Orari salvati!');
        this.closeShopHoursModal();
        this.loadShopHours();
      },
      (error) => { console.error('Errore salvataggio orari:', error); }
    );
  }
  closeShopHoursModal(): void { this.showShopHoursModal = false; this.selectedDay = null; }
  getSelectedDayName(): string { /* ...logica invariata... */ 
    if (this.selectedDay === null) return '';
    return this.weekDays.find(d => d.value === this.selectedDay)?.name || '';
  }
}