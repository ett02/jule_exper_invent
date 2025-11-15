import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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
  isLoadingSlots = false;
  bookingError = '';

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

  loadServices(): void {
    this.apiService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      },
    });
  }

  loadBarbers(): void {
    if (this.selectedService) {
      this.apiService.getBarbersForService(this.selectedService.id!).subscribe({
        next: (data) => {
          this.barbers = data;
        },
        error: (error) => {
          console.error('Errore durante il caricamento dei barbieri:', error);
        },
      });
    }
  }

  loadAvailableSlots(): void {
    if (this.selectedBarber && this.selectedService && this.selectedDate) {
      this.isLoadingSlots = true;
      this.availableSlots = [];
      this.apiService
        .getAvailableSlots(this.selectedBarber.id!, this.selectedService.id!, this.selectedDate)
        .subscribe({
          next: (data) => {
            this.availableSlots = data;
            this.isLoadingSlots = false;
          },
          error: (error) => {
            console.error('Errore durante il caricamento delle disponibilità:', error);
            this.isLoadingSlots = false;
          },
        });
    }
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.selectedBarber = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [];
    this.bookingError = '';
    this.currentStep = 2;
    this.loadBarbers();
  }

  selectBarber(barber: Barber): void {
    this.selectedBarber = barber;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [];
    this.bookingError = '';
    this.currentStep = 3;
  }

  onDateChange(): void {
    this.loadAvailableSlots();
    this.selectedTime = '';
    this.bookingError = '';
    this.currentStep = 4;
  }

  selectTimeSlot(slot: AvailableSlot): void {
    if (slot.available) {
      this.selectedTime = this.formatTime(slot.orarioInizio);
      this.bookingError = '';
    }
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
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken && this.selectedBarber && this.selectedService) {
      const appointmentData = {
        customerId: decodedToken.id,
        barberId: this.selectedBarber.id,
        serviceId: this.selectedService.id,
        data: this.selectedDate,
        orarioInizio: this.selectedTime,
      };

      this.bookingError = '';

      this.apiService.createAppointment(appointmentData).subscribe({
        next: () => {
          alert('Prenotazione confermata!');
          this.router.navigate(['/customer-dashboard']);
        },
        error: (error) => {
          console.error('Errore durante la creazione della prenotazione:', error);
          this.bookingError =
            error?.error?.message || 'Si è verificato un errore durante la conferma della prenotazione.';
        },
      });
    }
  }

  formatTime(time: string): string {
    return time ? time.substring(0, 5) : '';
  }
}
