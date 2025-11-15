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
    this.apiService.getAllServices().subscribe(
      (data) => {
        this.services = data;
      },
      (error) => {
        console.error('Error loading services:', error);
      },
    );
  }

  loadBarbers(): void {
    if (this.selectedService) {
      this.apiService.getBarbersForService(this.selectedService.id).subscribe(
        (data) => {
          this.barbers = data;
        },
        (error) => {
          console.error('Error loading barbers for service:', error);
        },
      );
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

  onDateChange(): void {
    this.loadAvailableSlots();
    this.nextStep();
  }

  selectTimeSlot(slot: AvailableSlot): void {
    if (slot.available) {
      this.selectedTime = slot.time;
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

      console.log('Creazione appuntamento:', appointmentData);
      // TODO: Call API POST /appointments
      alert('Prenotazione confermata! (TODO: Implementare chiamata API)');
      this.router.navigate(['/customer-dashboard']);
    }
  }
}
