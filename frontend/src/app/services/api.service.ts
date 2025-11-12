import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';
import { Barber } from '../models/barber.model';
import { Appointment } from '../models/appointment.model';
import { Availability } from '../models/availability.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Service management
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/services/${id}`);
  }

  // Barber management
  getAllBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.apiUrl}/barbers`);
  }

  createBarber(barber: Partial<Barber>): Observable<Barber> {
    return this.http.post<Barber>(`${this.apiUrl}/barbers`, barber);
  }

  deleteBarber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/barbers/${id}`);
  }

  // Customer facing methods
  getBarbersForService(serviceId: number): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.apiUrl}/services/${serviceId}/barbers`);
  }

  getBarberAvailability(barberId: number): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/barbers/${barberId}/availability`);
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointment);
  }

  getAppointmentsByUserId(userId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/user/${userId}`);
  }
}
