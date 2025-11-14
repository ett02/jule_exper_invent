import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    // TODO: Implement API call GET /appointments/user/{userId}
    // Mock data for now
    this.appointments = [
      // Example:
      // {
      //   id: 1,
      //   serviceName: 'Taglio Capelli Classico',
      //   barberName: 'Marco Bianchi',
      //   date: new Date('2025-11-20'),
      //   time: '10:00',
      //   duration: 30,
      //   status: 'CONFIRMATO'
      // }
    ];
  }

  loadWaitingList(): void {
    const userId = this.authService.getDecodedToken().id;
    // TODO: Implement API call GET /waiting-list/customer/{customerId}
    // Mock data for now
    this.waitingList = [
      // Example:
      // {
      //   id: 1,
      //   serviceName: 'Taglio + Barba',
      //   barberName: 'Luca Verdi',
      //   requestedDate: new Date('2025-11-22'),
      //   position: 2,
      //   statusMessage: 'Sei il 2° in coda per questo giorno'
      // }
    ];
  }

  navigateToBooking(): void {
    this.router.navigate(['/book']);
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
      // TODO: Implement API call DELETE /appointments/{id}
      console.log('Cancellazione appuntamento:', appointmentId);
      alert('Appuntamento cancellato (TODO: Implementare API)');
      this.loadAppointments();
    }
  }

  removeFromWaitingList(waitingId: number): void {
    if (confirm('Vuoi rimuoverti dalla lista d\'attesa?')) {
      // TODO: Implement API call DELETE /waiting-list/{id}
      console.log('Rimozione dalla lista d\'attesa:', waitingId);
      alert('Rimosso dalla coda (TODO: Implementare API)');
      this.loadWaitingList();
    }
  }
}
