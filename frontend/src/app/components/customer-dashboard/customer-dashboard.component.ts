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
    
    this.appointmentService.getAppointmentsByUser(userId).subscribe(
      (data) => {
        console.log('Appuntamenti ricevuti:', data);
        // Transform data per visualizzazione
        this.appointments = data.map((app: any) => ({
          id: app.id,
          serviceName: app.service?.nome || 'Servizio',
          barberName: `${app.barber?.nome || ''} ${app.barber?.cognome || ''}`,
          date: app.data,
          time: app.orarioInizio,
          duration: app.service?.durata || 0,
          status: app.stato
        }));
      },
      (error) => {
        console.error('Errore caricamento appuntamenti:', error);
        this.appointments = [];
      }
    );
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
      this.appointmentService.cancelAppointment(appointmentId).subscribe(
        () => {
          console.log('Appuntamento cancellato:', appointmentId);
          alert('✅ Appuntamento cancellato con successo!');
          this.loadAppointments(); // Ricarica la lista
        },
        (error) => {
          console.error('Errore cancellazione:', error);
          alert('❌ Errore durante la cancellazione: ' + (error.error?.message || 'Riprova più tardi'));
        }
      );
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
