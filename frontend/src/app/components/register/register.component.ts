import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    nome: '',
    cognome: '',
    email: '',
    password: '',
    ruolo: 'CLIENTE' // Default role
  };

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    console.log('Registrazione utente:', this.user);
    
    this.authService.register(this.user).subscribe(
      (response) => {
        console.log('Registrazione completata:', response);
        alert('Registrazione avvenuta con successo! Ora puoi effettuare il login.');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Errore durante la registrazione:', error);
        alert('Errore durante la registrazione: ' + (error.error?.message || 'Riprova più tardi'));
      }
    );
  }
}
