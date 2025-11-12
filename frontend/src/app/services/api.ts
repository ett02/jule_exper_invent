import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Service management
  getAllServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services`);
  }

  createService(service: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/services`, service);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${id}`);
  }

  // Barber management
  getAllBarbers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbers`);
  }

  createBarber(barber: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/barbers`, barber);
  }

  deleteBarber(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/barbers/${id}`);
  }

  // Customer facing methods
  getBarbersForService(serviceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/${serviceId}/barbers`);
  }

  getBarberAvailability(barberId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbers/${barberId}/availability`);
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, appointment);
  }

  getAppointmentsByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/user/${userId}`);
  }
}
