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
  service: any;
  barbers: any[] = [];
  selectedBarber: any;
  availability: any[] = [];
  selectedAvailability: any;

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.service = navigation?.extras.state?.['service'];
  }

  ngOnInit(): void {
    if (this.service) {
      this.apiService.getBarbersForService(this.service.id).subscribe(
        (data: Barber[]) => {
          this.barbers = data;
        },
        (error) => {
          console.error('Error fetching barbers', error);
        }
      );
    }
  }

  onBarberChange(): void {
    if (this.selectedBarber) {
      this.apiService.getBarberAvailability(this.selectedBarber.id).subscribe(
        (data: Availability[]) => {
          this.availability = data;
        },
        (error) => {
          console.error('Error fetching availability', error);
        }
      );
    }
  }

  bookAppointment(): void {
    const appointment = {
      customer: { id: 1 }, // TODO: Get the actual customer ID
      barber: { id: this.selectedBarber.id },
      service: { id: this.service.id },
      data: new Date(), // TODO: Get the actual date
      orario_inizio: this.selectedAvailability.orario_inizio,
      stato: 'PENDING'
    };

    this.apiService.createAppointment(appointment).subscribe(
      () => {
        this.router.navigate(['/appointments']);
      },
      (error) => {
        console.error('Error booking appointment', error);
      }
    );
  }
}
