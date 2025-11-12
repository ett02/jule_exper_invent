import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.css']
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  userId!: number;

  constructor(private apiService: ApiService, private authService: AuthService) {
    this.userId = this.authService.getDecodedToken()?.id;
  }

  ngOnInit(): void {
    if (this.userId) {
      this.apiService.getAppointmentsByUserId(this.userId).subscribe(
        (data: Appointment[]) => {
          this.appointments = data;
        },
        (error) => {
          console.error('Error fetching appointments', error);
        }
      );
    }
  }
}
