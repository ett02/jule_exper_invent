import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/appointments';

  constructor(private http: HttpClient) {}

  // Crea nuova prenotazione
  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post(this.apiUrl, appointmentData);
  }

  // Ottieni appuntamenti del cliente
  getAppointmentsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Ottieni appuntamenti del barbiere
  getAppointmentsByBarber(barberId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/barber/${barberId}`);
  }

  // Ottieni tutti gli appuntamenti (ADMIN)
  getAllAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ottieni slot disponibili
  getAvailableSlots(barberId: number, serviceId: number, date: string): Observable<any[]> {
    let params = new HttpParams()
      .set('barberId', barberId.toString())
      .set('serviceId', serviceId.toString())
      .set('date', date);
    
    return this.http.get<any[]>(`${this.apiUrl}/available-slots`, { params });
  }

  // Cancella appuntamento
  cancelAppointment(appointmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${appointmentId}`);
  }

  // Ottieni dettagli appuntamento
  getAppointmentById(appointmentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${appointmentId}`);
  }
}
