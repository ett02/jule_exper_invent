import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfacce per chiarezza
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

// --- (Aggiunta 1) ---
// Interfaccia per i giorni del calendario
interface CalendarDay {
  day: number | null; // null per i giorni vuoti all'inizio/fine mese
  isToday: boolean;
}

// --- (Aggiunta 2) ---
// Interfaccia per gli slot come atteso dall'HTML
interface TimeSlot {
  time: string;       // Era 'orario'
  available: boolean; // Era 'disponibile'
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
  
  // --- (Correzione 1) ---
  // Rinominato da 'selectedTimeSlot' a 'selectedTime'
  // e tipo aggiornato a TimeSlot
  selectedTime: TimeSlot | null = null;

  services: Service[] = [];
  barbers: Barber[] = [];

  // --- (Correzione 2) ---
  // Tipo aggiornato per usare TimeSlot
  availableSlots: TimeSlot[] = [];

  currentMonth: Date = new Date();

  // --- (Correzione 3) ---
  // Proprietà aggiunte per il calendario HTML
  currentMonthDisplay: string = '';
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  calendarDays: CalendarDay[] = []; // Sostituisce 'monthDays'

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // --- (Correzione 4) ---
    // Chiamiamo la nuova funzione per costruire il calendario
    this.buildCalendar();

    // Logica di caricamento servizi (corretta nella versione precedente)
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

  loadBarbers(): void {
    if (!this.selectedService) return;
    // TODO: Sostituire con chiamata API
    this.barbers = [
      { id: 1, nome: 'Marco', cognome: 'Bianchi', esperienza: '10 anni', specialita: 'Taglio classico' },
      { id: 2, nome: 'Luca', cognome: 'Verdi', esperienza: '5 anni', specialita: 'Barba' }
    ];
  }

  selectBarber(barber: Barber): void {
    this.selectedBarber = barber;
    this.nextStep();
  }

  // --- (Correzione 5) ---
  // 'buildMonthDays' rinominato e completamente riscritto
  // per popolare 'calendarDays' e 'currentMonthDisplay'
  buildCalendar(): void {
    const y = this.currentMonth.getFullYear();
    const m = this.currentMonth.getMonth();
    
    // Per 'currentMonthDisplay' (es. "Novembre 2025")
    this.currentMonthDisplay = this.currentMonth.toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric'
    });

    this.calendarDays = [];
    const firstDayOfMonth = new Date(y, m, 1).getDay(); // 0=Dom, 1=Lun,...
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = new Date();

    // 1. Aggiungi celle vuote per i giorni prima dell'inizio del mese
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDays.push({ day: null, isToday: false });
    }

    // 2. Aggiungi i giorni del mese
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = y === today.getFullYear() && m === today.getMonth() && i === today.getDate();
      this.calendarDays.push({ day: i, isToday: isToday });
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar(); // Aggiorna il calendario
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar(); // Aggiorna il calendario
  }

  // --- (Correzione 6) ---
  // 'selectDate' ora accetta un oggetto 'CalendarDay'
  selectDate(dayObj: CalendarDay): void {
    // Non fare nulla se si clicca su una cella vuota
    if (dayObj.day === null) {
      return;
    }

    const y = this.currentMonth.getFullYear();
    const m = this.currentMonth.getMonth() + 1;
    const dd = String(dayObj.day).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    this.selectedDate = `${y}-${mm}-${dd}`;
    
    this.loadAvailableSlots();
    // nextStep() viene chiamato dentro loadAvailableSlots() in caso di successo
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
        console.log('Slot ricevuti dal backend:', slots);
        
        // --- (Correzione 7) ---
        // Mappiamo la risposta del backend ({orario, disponibile})
        // nel formato atteso dall'HTML ({time, available})
        this.availableSlots = slots.map(slot => {
          return {
            time: slot.orario,
            available: slot.disponibile
          };
        });
        
        const availableCount = this.availableSlots.filter(s => s.available).length;
        console.log(`Disponibili: ${availableCount}, Occupati: ${this.availableSlots.length - availableCount}`);

        this.nextStep(); // Vai allo step 4 (orari)
      },
      (error: any) => {
        console.error('Errore caricamento slot:', error);
        this.availableSlots = [];
        alert('Errore nel caricamento degli orari disponibili');
      }
    );
  }

  // --- (Correzione 8) ---
  // Rinominato da 'selectTimeSlot' a 'selectTime' e tipo aggiornato
  selectTime(slot: TimeSlot): void {
    if (!slot.available) {
      console.warn('Tentativo di selezionare slot occupato:', slot);
      alert('Questo orario è già occupato. Seleziona un altro slot.');
      return;
    }

    console.log('Slot selezionato:', slot);
    this.selectedTime = slot; // Era selectedTimeSlot
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
    // --- (Correzione 9) ---
    // Check aggiornato per usare 'selectedTime'
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
      // Usiamo la proprietà 'time' dal nostro oggetto 'selectedTime'
      orarioInizio: this.ensureHHmmss(this.selectedTime.time)
    };

    console.log('Creazione appuntamento:', appointmentData);

    this.appointmentService.createAppointment(appointmentData).subscribe(
      (response: any) => {
        console.log('Prenotazione confermata:', response);
        
        alert(
          `✅ Prenotazione confermata!\n\n` +
          `Servizio: ${this.selectedService!.nome}\n` +
          `Barbiere: ${this.selectedBarber!.nome} ${this.selectedBarber!.cognome}\n` +
          `Data: ${new Date(this.selectedDate!).toLocaleDateString('it-IT')}\n` +
          `Orario: ${this.selectedTime!.time}\n` + // Usiamo .time
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
      console.warn(`Formato ora non standard: ${time}. Convertito in ${match[1]}:00`);
      return `${match[1]}:00`;
    }
    
    console.error(`Formato ora non valido: ${time}. Uso 00:00:00`);
    return '00:00:00';
  }

  // --- (Correzione 10) ---
  // Aggiunta la funzione 'canProceed' mancante, usata nell'HTML
  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedService !== null;
      case 2:
        return this.selectedBarber !== null;
      case 3:
        return this.selectedDate !== null;
      case 4:
        return this.selectedTime !== null;
      default:
        return false;
    }
  }
}