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
  //styleUrls: ['./service-booking.component.css']
})
export class ServiceBookingComponent implements OnInit {
  service: any;
  barbers: any[] = [];
  selectedBarber: any;
  availability: any[] = [];
  selectedAvailability: any;

  appointmentDate: any; 
  appointmentTime: any;

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
    // 1. Ottieni l'ID utente dal token, non da getUser()
    const decodedToken = this.authService.getDecodedToken();
    if (!decodedToken?.id) {
      console.error('Customer not found in token');
      return;
    }
    const customerId = decodedToken.id;

    // 2. Costruisci l'oggetto appuntamento
    const appointment: Partial<Appointment> = {
      // Il backend si aspetta solo gli ID per creare le relazioni
      customer: { id: customerId } as any, 
      barber: { id: this.selectedBarber.id } as any,
      service: { id: this.service.id } as any,
      
      data: this.appointmentDate,
      
      // 3. Usa il nome corretto della proprietà (camelCase)
      orarioInizio: this.appointmentTime, 
      
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
