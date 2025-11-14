import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  customerName: string = 'Cliente';
  appointments: any[] = [];
  waitingList: any[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

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
    const userId = this.authService.getDecodedToken().id;
    this.apiService.getAppointmentsByUserId(userId).subscribe(
      (data) => {
        this.appointments = data;
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  loadWaitingList(): void {
    const userId = this.authService.getDecodedToken().id;
    this.apiService.getWaitingListByCustomerId(userId).subscribe(
      (data) => {
        this.waitingList = data;
      },
      (error) => {
        console.error('Error fetching waiting list:', error);
      }
    );
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
        }
      );
    }
  }

  removeFromWaitingList(waitingId: number): void {
    if (confirm('Vuoi rimuoverti dalla lista d\'attesa?')) {
      this.apiService.removeFromWaitingList(waitingId).subscribe(
        () => {
          this.loadWaitingList();
        },
        (error) => {
          console.error('Error removing from waiting list:', error);
        }
      );
    }
  }

  logout(): void {
    if (confirm('Sei sicuro di voler uscire?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
