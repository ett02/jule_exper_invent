import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  appointmentDate: Date = new Date();

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.service = navigation?.extras.state?.['service'];
  }

  ngOnInit(): void {
    if (this.service) {
      this.apiService.getBarbersForService(this.service.id).subscribe(
        (data: any) => {
          this.barbers = data;
        },
        (error: any) => {
          console.error('Error fetching barbers', error);
        }
      );
    }
  }

  onBarberChange(): void {
    if (this.selectedBarber) {
      this.apiService.getBarberAvailability(this.selectedBarber.id).subscribe(
        (data: any) => {
          this.availability = data;
        },
        (error: any) => {
          console.error('Error fetching availability', error);
        }
      );
    }
  }

  bookAppointment(): void {
    const customerId = this.authService.getDecodedToken()?.id;
    const appointment = {
      customer: { id: customerId },
      barber: { id: this.selectedBarber.id },
      service: { id: this.service.id },
      data: this.appointmentDate,
      orario_inizio: this.selectedAvailability.orario_inizio,
      stato: 'PENDING'
    };

    this.apiService.createAppointment(appointment).subscribe(
      () => {
        this.router.navigate(['/appointments']);
      },
      (error: any) => {
        console.error('Error booking appointment', error);
      }
    );
  }
}
