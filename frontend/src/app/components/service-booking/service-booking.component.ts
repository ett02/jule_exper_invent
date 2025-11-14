import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { Availability } from '../../models/availability.model';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-booking.component.html',
  styleUrls: ['./service-booking.component.css']
})
export class ServiceBookingComponent implements OnInit {
  currentStep: number = 1;
  services: Service[] = [];
  barbers: any[] = [];
  availableSlots: any[] = [];
  
  selectedService: Service | null = null;
  selectedBarber: any = null;
  selectedDate: string = '';
  selectedTime: string = '';
  
  minDate: string = '';

  currentMonth: Date = new Date();
  currentMonthDisplay: string = '';
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  calendarDays: any[] = [];
  shopSettings: any[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Check if service was passed from customer dashboard
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['service']) {
      this.selectedService = navigation.extras.state['service'];
      this.currentStep = 2;
      this.loadBarbers();
    } else {
      this.loadServices();
    }

    this.loadShopSettings();
    this.generateCalendar();
  }

  loadServices(): void {
    this.apiService.getAllServices().subscribe(
      (data) => {
        this.services = data;
      },
      (error) => {
        console.error('Error loading services:', error);
      }
    );
  }

  loadBarbers(): void {
    if (this.selectedService) {
      // TODO: Call API GET /barbers/service/{serviceId}
      // Mock data for now
      this.barbers = [
        { id: 1, nome: 'Marco', cognome: 'Bianchi', esperienza: '8 anni', specialita: 'Tagli classici e moderni' },
        { id: 2, nome: 'Luca', cognome: 'Verdi', esperienza: '5 anni', specialita: 'Specialista barba' },
        { id: 3, nome: 'Giuseppe', cognome: 'Neri', esperienza: '10 anni', specialita: 'Tagli moderni e sfumature' }
      ];
    }
  }

  loadAvailableSlots(): void {
    if (this.selectedBarber && this.selectedService && this.selectedDate) {
      console.log('🔍 Caricamento slot per:', {
        barberId: this.selectedBarber.id,
        serviceId: this.selectedService.id,
        date: this.selectedDate
      });

      this.appointmentService.getAvailableSlots(
        this.selectedBarber.id,
        this.selectedService.id,
        this.selectedDate
      ).subscribe(
        (slots) => {
          console.log('✅ Slot ricevuti dal backend:', slots);
          this.availableSlots = slots.map((slot: any) => ({
            time: slot.orarioInizio,
            available: slot.disponibile !== false
          }));
          console.log('📋 Slot processati (ogni 30 min):', this.availableSlots);
        },
        (error) => {
          console.error('❌ Errore caricamento slot dal backend:', error);
          console.log('🔄 Uso slot mock di fallback (ogni 30 min)');
          this.availableSlots = this.generateMockSlots();
        }
      );
    }
  }

  // Genera slot mock per test - OGNI 30 MINUTI dalle 08:00 alle 20:00
  generateMockSlots(): any[] {
    const slots = [];
    const startHour = 8;   // 08:00
    const endHour = 20;    // 20:00
    const interval = 30;   // 30 minuti

    for (let hour = startHour; hour < endHour; hour++) {
      // Per ogni ora, genera 2 slot (00 e 30 minuti)
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = Math.random() > 0.3; // 70% disponibili
        slots.push({ time, available });
      }
    }

    console.log('🎲 Generati', slots.length, 'slot da 30 minuti (08:00-19:30)');
    console.log('📋 Slot generati:', slots.map(s => s.time).join(', '));
    return slots;
  }

  loadShopSettings(): void {
    // TODO: Call API GET /shop-settings
    // Mock data for now
    this.shopSettings = [
      { giorno: 1, orarioApertura: '09:00', orarioChiusura: '19:00', isAperto: true },  // Lunedì
      { giorno: 2, orarioApertura: '09:00', orarioChiusura: '19:00', isAperto: true },  // Martedì
      { giorno: 3, orarioApertura: '09:00', orarioChiusura: '19:00', isAperto: true },  // Mercoledì
      { giorno: 4, orarioApertura: '09:00', orarioChiusura: '19:00', isAperto: true },  // Giovedì
      { giorno: 5, orarioApertura: '09:00', orarioChiusura: '19:00', isAperto: true },  // Venerdì
      { giorno: 6, orarioApertura: '09:00', orarioChiusura: '17:00', isAperto: true },  // Sabato
      { giorno: 0, isAperto: false }  // Domenica chiuso
    ];
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Set current month display
    this.currentMonthDisplay = this.currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    this.calendarDays = [];
    
    // Add empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.push({ isEmpty: true });
    }
    
    // Add days of month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const shopSetting = this.shopSettings.find(s => s.giorno === dayOfWeek);
      
      const isPast = date < today;
      const isOpen = shopSetting?.isAperto || false;
      const isToday = date.getTime() === today.getTime();
      
      this.calendarDays.push({
        number: day,
        date: date,
        dayOfWeek: dayOfWeek,
        available: !isPast && isOpen,
        unavailable: isPast || !isOpen,
        isToday: isToday,
        selected: false,
        isEmpty: false
      });
    }
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.nextStep();
    this.loadBarbers();
  }

  selectBarber(barber: any): void {
    this.selectedBarber = barber;
    this.nextStep();
  }

  onDateChange(): void {
    console.log('📅 Data cambiata:', this.selectedDate);
    if (this.selectedDate) {
      this.loadAvailableSlots();
      // Non auto-avanzare, lascia vedere gli slot
    }
  }

  selectTimeSlot(slot: any): void {
    if (!slot.available) {
      console.log('❌ Slot non disponibile:', slot.time);
      return;
    }
    
    console.log('✅ Slot selezionato:', slot.time);
    this.selectedTime = slot.time;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedService;
      case 2: return !!this.selectedBarber;
      case 3: return !!this.selectedDate;
      case 4: return !!this.selectedTime;
      default: return false;
    }
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  confirmBooking(): void {
    const appointmentData = {
      customerId: this.authService.getDecodedToken().id,
      barberId: this.selectedBarber.id,
      serviceId: this.selectedService!.id,
      data: this.selectedDate,
      orarioInizio: this.selectedTime
    };

    console.log('Creazione appuntamento:', appointmentData);
    
    this.appointmentService.createAppointment(appointmentData).subscribe(
      (response) => {
        console.log('Prenotazione confermata:', response);
        alert('✅ Prenotazione confermata con successo!\n\n' +
              `Servizio: ${this.selectedService!.nome}\n` +
              `Barbiere: ${this.selectedBarber.nome} ${this.selectedBarber.cognome}\n` +
              `Data: ${new Date(this.selectedDate).toLocaleDateString('it-IT')}\n` +
              `Orario: ${this.selectedTime}\n` +
              `Durata: ${this.selectedService!.durata} minuti\n` +
              `Prezzo: €${this.selectedService!.prezzo}`);
        this.router.navigate(['/customer-dashboard']);
      },
      (error) => {
        console.error('Errore durante la prenotazione:', error);
        alert('❌ Errore durante la prenotazione: ' + (error.error?.message || 'Riprova più tardi'));
      }
    );
  }

  goBackToDashboard(): void {
    this.router.navigate(['/customer-dashboard']);
  }

  selectDate(day: any): void {
    if (day.isEmpty || day.unavailable) {
      return;
    }
    
    // Deselect all days
    this.calendarDays.forEach(d => d.selected = false);
    
    // Select this day
    day.selected = true;
    this.selectedDate = day.date.toISOString().split('T')[0];
    
    console.log('✅ Data selezionata dal calendario:', this.selectedDate);
    this.loadAvailableSlots();
    this.nextStep();
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }
}
