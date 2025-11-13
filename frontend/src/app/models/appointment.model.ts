import { User } from './user.model';
import { Barber } from './barber.model';
import { Service } from './service.model';

export interface Appointment {
    id: number;
    customer: any;
    barber: any;
    service: any;
    data: Date;
    orarioInizio: string;
    stato: 'CONFIRMATO' | 'PENDING' | 'ANNULLATO';
}
