import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../models/service.model';
import { Barber } from '../../models/barber.model';
import { AvailableSlot } from '../../models/available-slot.model';

@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-booking.component.html',
  styleUrls: ['./service-booking.component.css'],
})
export class ServiceBookingComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStep = 1;
  services: Service[] = [];
  barbers: Barber[] = [];
  availableSlots: AvailableSlot[] = [];

  selectedService: Service | null = null;
  selectedBarber: Barber | null = null;
  selectedDate = '';
  selectedTime = '';

  minDate = '';

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
  }

    this.apiService.getAllServices().subscribe(
      (data) => {
        this.services = data;
        this.route.queryParams.subscribe(params => {
          if (params['serviceId']) {
            const serviceId = +params['serviceId'];
            this.selectedService = this.services.find(s => s.id === serviceId) || null;
            if (this.selectedService) {
              this.currentStep = 2;
              this.loadBarbers();
            }
          }
        });
      },
      (error) => {
        console.error('Error loading services:', error);
      },
    );
  }

  loadBarbers(): void {
    if (this.selectedService) {
      // TODO: Call API GET /barbers/service/{serviceId}
      // Mock data for now
      this.barbers = [
        {
          id: 1,
          nome: 'Marco',
          cognome: 'Bianchi',
          esperienza: '8 anni',
          specialita: 'Tagli classici e moderni',
          is_active: true,
          user_id: 1,
        },
        {
          id: 2,
          nome: 'Luca',
          cognome: 'Verdi',
          esperienza: '5 anni',
          specialita: 'Specialista barba',
          is_active: true,
          user_id: 2,
        },
        {
          id: 3,
          nome: 'Giuseppe',
          cognome: 'Neri',
          esperienza: '10 anni',
          specialita: 'Tagli moderni e sfumature',
          is_active: true,
          user_id: 3,
        },
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
        { time: '15:00', available: true },
      ];
    }
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.nextStep();
    this.loadBarbers();
  }

  selectBarber(barber: Barber): void {
    this.selectedBarber = barber;
    this.nextStep();
  }

  buildCalendar(): void {
    const y = this.currentMonth.getFullYear();
    const m = this.currentMonth.getMonth();
    
    this.currentMonthDisplay = this.currentMonth.toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric'
    });

    this.calendarDays = [];
    const firstDayOfMonth = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDays.push({
        number: null,
        isEmpty: true,
        isToday: false,
        selected: false,
        available: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(y, m, i);
      const dateString = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;

      this.calendarDays.push({
        number: i,
        isEmpty: false,
        isToday: isToday,
        selected: dateString === this.selectedDate,
        available: !isPast
      });
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  selectTimeSlot(slot: AvailableSlot): void {
    if (slot.available) {
      this.selectedTime = slot.time;
    }

    const y = this.currentMonth.getFullYear();
    const m = this.currentMonth.getMonth() + 1;
    const dd = String(dayObj.number).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    this.selectedDate = `${y}-${mm}-${dd}`;
    
    this.calendarDays.forEach(day => {
      day.selected = (day.number === dayObj.number && !day.isEmpty);
    });

    this.loadAvailableSlots();
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.selectedService;
      case 2:
        return !!this.selectedBarber;
      case 3:
        return !!this.selectedDate;
      case 4:
        return !!this.selectedTime;
      default:
        return false;
    }
    const { id: barberId } = this.selectedBarber;
    const { id: serviceId } = this.selectedService;
    const date = this.selectedDate;

    this.appointmentService.getAvailableSlots(barberId, serviceId, date).subscribe(
      (slots: any[]) => {
        this.availableSlots = slots.map(slot => ({
          time: slot.orario,
          available: slot.disponibile
        }));
        
        this.nextStep(); 
      },
      (error: any) => {
        console.error('Errore caricamento slot:', error);
        this.availableSlots = [];
        alert('Errore nel caricamento degli orari disponibili');
      }
    );
  }

  selectTime(slot: TimeSlot): void {
    if (!slot.available) {
      alert('Questo orario è già occupato. Seleziona un altro slot.');
      return;
    }
    this.selectedTime = slot;
    this.nextStep();
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep(): void {
    this.currentStep++;
  }

  confirmBooking(): void {
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken && this.selectedBarber && this.selectedService) {
      const appointmentData = {
        customerId: decodedToken.id,
        barberId: this.selectedBarber.id,
        serviceId: this.selectedService.id,
        data: this.selectedDate,
        orarioInizio: this.selectedTime,
      };

      console.log('Creazione appuntamento:', appointmentData);
      // TODO: Call API POST /appointments
      alert('Prenotazione confermata! (TODO: Implementare chiamata API)');
      this.router.navigate(['/customer-dashboard']);
    }
  }

  private ensureHHmmss(time: string): string {
    if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
    const match = time.match(/^(\d{2}:\d{2})/);
    if (match) {
      return `${match[1]}:00`;
    }
    return '00:00:00';
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return this.selectedService !== null;
      case 2: return this.selectedBarber !== null;
      case 3: return this.selectedDate !== null;
      case 4: return this.selectedTime !== null;
      default: return false;
    }
  }

  formatTimeWithoutSeconds(time: string): string {
    if (!time) return '';
    // Rimuove i secondi dall'orario (es. 09:45:00 -> 09:45)
    return time.substring(0, 5);
  }
}