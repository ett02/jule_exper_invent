import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfacce (Barber e Service sono invariate)
interface Barber {
  id: number;
  nome: string;
  cognome: string;
  esperienza: string;
  specialita: string;
}

interface Service {
  id: number;
  nome: string;
  durata: number;
  prezzo: number;
  descrizione: string;
}

interface CalendarDay {
  number: number | null;
  isEmpty: boolean;
  isToday: boolean;
  selected: boolean;
  available: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-service-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-booking.component.html',
  styleUrls: ['./service-booking.component.css']
})
export class ServiceBookingComponent implements OnInit {
  currentStep: number = 1;
  selectedService: Service | null = null;
  selectedBarber: Barber | null = null;
  selectedDate: string | null = null;
  selectedTime: TimeSlot | null = null;

  services: Service[] = [];
  barbers: Barber[] = [];
  availableSlots: TimeSlot[] = [];

  currentMonth: Date = new Date();
  
  currentMonthDisplay: string = '';
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  calendarDays: CalendarDay[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildCalendar(); 

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
        console.error('Errore caricamento servizi:', error);
      }
    );
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.nextStep();
    this.loadBarbers();
  }

  // --- (Correzione 1: Numero Barbieri) ---
  // Aggiunto il terzo barbiere per coerenza
  loadBarbers(): void {
    if (!this.selectedService) return;
    this.barbers = [
      { id: 1, nome: 'Marco', cognome: 'Bianchi', esperienza: '10 anni', specialita: 'Taglio classico' },
      { id: 2, nome: 'Luca', cognome: 'Verdi', esperienza: '5 anni', specialita: 'Barba' },
      { id: 3, nome: 'Giuseppe', cognome: 'Neri', esperienza: '8 anni', specialita: 'Sfumature' }
    ];
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

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  selectDate(dayObj: CalendarDay): void {
    if (dayObj.isEmpty || !dayObj.available) {
      console.warn('Giorno non disponibile:', dayObj);
      return;
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

  loadAvailableSlots(): void {
    if (!this.selectedBarber || !this.selectedService || !this.selectedDate) {
      console.error('Dati mancanti per caricare gli slot');
      return;
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
    if (!this.selectedBarber || !this.selectedService || !this.selectedDate || !this.selectedTime) {
      alert('Completa tutti i campi prima di confermare');
      return;
    }

    const token = this.authService.getDecodedToken();
    if (!token || !token.id) {
      alert('Errore autenticazione. Effettua nuovamente il login.');
      this.router.navigate(['/login']);
      return;
    }

    const appointmentData = {
      customerId: token.id,
      barberId: this.selectedBarber.id,
      serviceId: this.selectedService.id,
      data: this.selectedDate,
      orarioInizio: this.ensureHHmmss(this.selectedTime.time)
    };

    this.appointmentService.createAppointment(appointmentData).subscribe(
      (response: any) => {
        alert(
          `✅ Prenotazione confermata!\n\n` +
          `Servizio: ${this.selectedService!.nome}\n` +
          `Barbiere: ${this.selectedBarber!.nome} ${this.selectedBarber!.cognome}\n` +
          `Data: ${new Date(this.selectedDate!).toLocaleDateString('it-IT')}\n` +
          `Orario: ${this.selectedTime!.time}\n` +
          `Durata: ${this.selectedService!.durata} minuti\n` +
          `Prezzo: €${this.selectedService!.prezzo}`
        );
        this.router.navigate(['/customer-dashboard']);
      },
      (error: any) => {
        console.error('Errore prenotazione:', error);
        alert('Errore durante la prenotazione: ' + (error.error?.message || 'Riprova più tardi'));
      }
    );
  }

  goBackToDashboard(): void {
    this.router.navigate(['/customer-dashboard']);
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
}