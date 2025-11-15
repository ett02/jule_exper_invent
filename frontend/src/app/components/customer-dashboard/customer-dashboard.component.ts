import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';
import { WaitingList } from '../../models/waiting-list.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
})
export class CustomerDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  customerName = 'Cliente';
  appointments: Appointment[] = [];
  waitingList: WaitingList[] = [];

  ngOnInit(): void {
    // Get customer name from JWT token
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken && decodedToken.sub) {
      // Extract name from email (before @)
      this.customerName = decodedToken.sub.split('@')[0];
    }

    // Load customer appointments
    this.loadAppointments();

    // Load waiting list
    this.loadWaitingList();
  }

  loadAppointments(): void {
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken) {
      const userId = decodedToken.id;
      this.apiService.getAppointmentsByUserId(userId).subscribe(
        (data) => {
          this.appointments = data;
        },
        (error) => {
          console.error('Error fetching appointments:', error);
        },
      );
    }
  }

  loadWaitingList(): void {
    const decodedToken = this.authService.getDecodedToken();
    if (decodedToken) {
      const userId = decodedToken.id;
      this.apiService.getWaitingListByCustomerId(userId).subscribe(
        (data) => {
          this.waitingList = data;
        },
        (error) => {
          console.error('Error fetching waiting list:', error);
        },
      );
    }
  }

  navigateToBooking(): void {
    this.router.navigate(['/book']);
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
      this.apiService.cancelAppointment(appointmentId).subscribe(
        () => {
          this.loadAppointments();
        },
        (error) => {
          console.error('Error canceling appointment:', error);
        },
      );
    }
  }

  removeFromWaitingList(waitingId: number): void {
    if (confirm("Vuoi rimuoverti dalla lista d'attesa?")) {
      this.apiService.removeFromWaitingList(waitingId).subscribe(
        () => {
          this.loadWaitingList();
        },
        (error) => {
          console.error('Error removing from waiting list:', error);
        },
      );
    }
  }
}
