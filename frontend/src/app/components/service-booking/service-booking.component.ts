import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
      // TODO: Call API GET /appointments/available-slots
      // Mock data for now
      this.availableSlots = [
        { time: '09:00', available: true },
        { time: '09:30', available: true },
        { time: '10:00', available: false },
        { time: '10:30', available: true },
        { time: '11:00', available: true },
        { time: '11:30', available: false },
        { time: '14:00', available: true },
        { time: '14:30', available: true },
        { time: '15:00', available: true }
      ];
    }
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
    this.loadAvailableSlots();
    this.nextStep();
  }

  selectTimeSlot(slot: any): void {
    if (slot.available) {
      this.selectedTime = slot.time;
    }
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
    // TODO: Call API POST /appointments
    alert('Prenotazione confermata! (TODO: Implementare chiamata API)');
    this.router.navigate(['/customer-dashboard']);
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
    
    console.log('Data selezionata:', this.selectedDate);
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
