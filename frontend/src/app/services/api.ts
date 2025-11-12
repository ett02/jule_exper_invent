import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getAllServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/services`);
  }

  getBarbersForService(serviceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/${serviceId}/barbers`);
  }

  getBarberAvailability(barberId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbers/${barberId}/availability`);
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, appointment);
  }
}
