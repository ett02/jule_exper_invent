import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { Appointment } from '../../models/appointment.model';
import { BusinessHours } from '../../models/business-hours.model';

type AdminSection = 'services' | 'barbers' | 'agenda' | 'settings';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  services: Service[] = [];
  barbers: Barber[] = [];
  appointments: Appointment[] = [];
  businessHours: BusinessHours[] = [];

  selectedSection: AdminSection = 'agenda';
  selectedDate = '';

  newService: Partial<Service> = {
    nome: '',
    durata: 0,
    prezzo: 0,
    descrizione: '',
  };

  editingService: Service | null = null;

  newBarber: Partial<Barber> = {
    nome: '',
    cognome: '',
    esperienza: '',
    specialita: '',
  };

  editingBarber: Barber | null = null;

  isSavingBusinessHours = false;
  businessHoursMessage = '';

  readonly dayNames = [
    'Domenica',
    'Lunedì',
    'Martedì',
    'Mercoledì',
    'Giovedì',
    'Venerdì',
    'Sabato',
  ];

  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
    this.loadBusinessHours();
    this.initializeAgenda();
  }

  setSection(section: AdminSection): void {
    this.selectedSection = section;
  }

  private initializeAgenda(): void {
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    this.loadAppointmentsForDate();
  }

  loadServices(): void {
    this.apiService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (error) => console.error('Errore durante il caricamento dei servizi:', error),
    });
  }

  startEditService(service: Service): void {
    this.editingService = { ...service };
  }

  cancelEditService(): void {
    this.editingService = null;
  }

  saveService(): void {
    if (!this.editingService) {
      return;
    }

    this.apiService.updateService(this.editingService.id, this.editingService).subscribe({
      next: () => {
        this.loadServices();
        this.editingService = null;
      },
      error: (error) => console.error('Errore durante l\'aggiornamento del servizio:', error),
    });
  }

  createService(): void {
    if (!this.newService.nome || !this.newService.descrizione) {
      return;
    }

    const payload = {
      ...this.newService,
      durata: Number(this.newService.durata) || 0,
      prezzo: Number(this.newService.prezzo) || 0,
    };

    this.apiService.createService(payload).subscribe({
      next: () => {
        this.loadServices();
        this.newService = { nome: '', durata: 0, prezzo: 0, descrizione: '' };
      },
      error: (error) => console.error('Errore durante la creazione del servizio:', error),
    });
  }

  deleteService(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.apiService.deleteService(id).subscribe({
      next: () => this.loadServices(),
      error: (error) => console.error('Errore durante l\'eliminazione del servizio:', error),
    });
  }

  loadBarbers(): void {
    this.apiService.getAllBarbers().subscribe({
      next: (data) => {
        this.barbers = data;
      },
      error: (error) => console.error('Errore durante il caricamento dei barbieri:', error),
    });
  }

  startEditBarber(barber: Barber): void {
    this.editingBarber = { ...barber };
  }

  cancelEditBarber(): void {
    this.editingBarber = null;
  }

  saveBarber(): void {
    if (!this.editingBarber) {
      return;
    }

    this.apiService.updateBarber(this.editingBarber.id, this.editingBarber).subscribe({
      next: () => {
        this.loadBarbers();
        this.editingBarber = null;
      },
      error: (error) => console.error('Errore durante l\'aggiornamento del barbiere:', error),
    });
  }

  createBarber(): void {
    if (!this.newBarber.nome || !this.newBarber.cognome) {
      return;
    }

    this.apiService.createBarber(this.newBarber).subscribe({
      next: () => {
        this.loadBarbers();
        this.newBarber = { nome: '', cognome: '', esperienza: '', specialita: '' };
      },
      error: (error) => console.error('Errore durante la creazione del barbiere:', error),
    });
  }

  deleteBarber(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.apiService.deleteBarber(id).subscribe({
      next: () => this.loadBarbers(),
      error: (error) => console.error('Errore durante l\'eliminazione del barbiere:', error),
    });
  }

  loadAppointmentsForDate(): void {
    if (!this.selectedDate) {
      return;
    }

    this.apiService.getAppointmentsByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.appointments = [...data].sort((a, b) => {
          const timeA = this.formatTimeValue(a.orarioInizio);
          const timeB = this.formatTimeValue(b.orarioInizio);
          return timeA.localeCompare(timeB);
        });
      },
      error: (error) => console.error('Errore durante il caricamento degli appuntamenti:', error),
    });
  }

  onAgendaDateChange(): void {
    this.loadAppointmentsForDate();
  }

  private formatTimeValue(time: string): string {
    return time ? time.substring(0, 5) : '';
  }

  formatTime(time: string): string {
    return this.formatTimeValue(time);
  }

  loadBusinessHours(): void {
    this.apiService.getBusinessHours().subscribe({
      next: (data) => {
        this.businessHours = data
          .sort((a, b) => a.giorno - b.giorno)
          .map((hour) => ({
            ...hour,
            apertura: hour.apertura ? hour.apertura.substring(0, 5) : null,
            chiusura: hour.chiusura ? hour.chiusura.substring(0, 5) : null,
          }));
      },
      error: (error) => console.error('Errore durante il caricamento degli orari:', error),
    });
  }

  toggleDayOpen(hours: BusinessHours): void {
    hours.aperto = !hours.aperto;
    if (!hours.aperto) {
      hours.apertura = null;
      hours.chiusura = null;
    } else {
      hours.apertura = hours.apertura ?? '09:00';
      hours.chiusura = hours.chiusura ?? '19:00';
    }
  }

  saveBusinessHours(): void {
    this.isSavingBusinessHours = true;
    this.businessHoursMessage = '';

    const payload = this.businessHours.map((hour) => ({
      ...hour,
      apertura: hour.aperto ? hour.apertura : null,
      chiusura: hour.aperto ? hour.chiusura : null,
    }));

    this.apiService.updateBusinessHours(payload).subscribe({
      next: (data) => {
        this.businessHours = data
          .sort((a, b) => a.giorno - b.giorno)
          .map((hour) => ({
            ...hour,
            apertura: hour.apertura ? hour.apertura.substring(0, 5) : null,
            chiusura: hour.chiusura ? hour.chiusura.substring(0, 5) : null,
          }));
        this.businessHoursMessage = 'Orari di apertura aggiornati con successo.';
        this.isSavingBusinessHours = false;
      },
      error: (error) => {
        console.error('Errore durante il salvataggio degli orari:', error);
        this.businessHoursMessage = 'Impossibile aggiornare gli orari. Riprova più tardi.';
        this.isSavingBusinessHours = false;
      },
    });
  }

  getDayName(day: number): string {
    return this.dayNames[day] || '';
  }
}
