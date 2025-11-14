# Barbershop Booking System - AI Agent Instructions

## Project Overview
Full-stack barbershop appointment booking system with **Angular 20.3** frontend, **Spring Boot 3.5.7** backend, and **MySQL 9.5** database. Features include JWT authentication, slot-based booking with 5-minute increments, and FIFO waiting list with automatic assignment.

## Architecture

### Backend: Spring Boot REST API (`backend/`)
- **Package Structure**: `com.example.demo` with standard layers:
  - `controller/` - REST endpoints (`@RestController`, `@RequestMapping`)
  - `service/` - Business logic (`@Service`)
  - `repository/` - JPA repositories (`@Repository`)
  - `model/` - Entities with **Lombok `@Data`** (no manual getters/setters)
  - `dto/` - Request/Response objects
  - `filter/` - JWT authentication filter
  - `config/` - Spring Security + CORS configuration
  - `util/` - JWT utilities

### Frontend: Angular Standalone Components (`frontend/src/app/`)
- **No NgModule** - Uses standalone components with `provideRouter`, `provideHttpClient`
- `components/` - Feature components (login, dashboards, booking)
- `services/` - HTTP services + AuthService with JWT handling
- `models/` - TypeScript interfaces
- `interceptors/` - Auth interceptor for Bearer tokens

### Database Schema
Day-of-week convention: **0=Sunday, 1=Monday, ..., 6=Saturday**
- `users` - Roles: `CLIENTE`, `ADMIN`
- `barbers` - Barber profiles with `is_active` flag
- `services` - Services with duration in minutes
- `appointments` - Status: `CONFIRMATO`, `PENDING`, `ANNULLATO`
- `shop_hours` - Shop hours per day with `is_chiuso` flag
- `availability` - Barber availability by day
- `barber_services` - Many-to-many barber-service mapping
- `waiting_list` - FIFO queue with states: `IN_ATTESA`, `NOTIFICATO`, `CONFERMATO`, `SCADUTO`, `ANNULLATO`

## Critical Patterns

### 1. Appointment Slot Algorithm
Slots are generated based on **service duration**, not fixed 5-minute intervals. The system allows bookings to start every 5 minutes, but each slot occupies the full service duration.

```java
// AppointmentsService.java - Slot generation
LocalTime slotTime = shopOpenTime;
while (slotTime.plusMinutes(serviceDuration).compareTo(shopCloseTime) <= 0) {
    boolean isAvailable = isBarberAvailable(barberId, date, slotTime, slotTime.plusMinutes(serviceDuration));
    availableSlots.add(new AvailableSlotResponse(slotTime, isAvailable));
    slotTime = slotTime.plusMinutes(serviceDuration); // Increment by service duration
}
```

### 2. FIFO Waiting List with Auto-Assignment
When appointments are cancelled, the system **automatically assigns** the slot to the first person in the waiting list:

```java
// WaitingListService.java - processWaitingList()
Optional<WaitingList> firstInQueue = waitingListRepository
    .findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
        barberId, serviceId, date, WaitingList.StatoListaAttesa.IN_ATTESA
    );
// Creates appointment automatically and updates waiting list status to CONFERMATO
```

### 3. Circular Dependency Resolution
`AppointmentsService` ↔ `WaitingListService` circular dependency resolved with `@Lazy`:

```java
@Service
public class AppointmentsService {
    @Autowired
    @Lazy  // Critical: breaks circular dependency
    private WaitingListService waitingListService;
}
```

### 4. JWT Authentication Flow
- **Backend**: JWT tokens include custom claims (`userId`, `role`, `nome`, `cognome`)
- **Frontend**: Tokens stored in `localStorage.token`, auto-attached via `AuthInterceptor`
- **Security**: Endpoints under `/auth/**`, `/services/**`, `/shop-hours/**`, `/barbers/**`, `/appointments/available-slots/**` are public; others require authentication

```typescript
// auth.interceptor.ts - Auto-attaches Bearer token
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next.handle(cloned);
  }
  return next.handle(req);
}
```

### 5. Day-of-Week Calculations
Java's `DayOfWeek.getValue()` returns 1-7 (Monday=1, Sunday=7), but database uses 0-6 (Sunday=0):

```java
int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Converts to 0-6
```

## Development Workflow

### Running the Application
**Backend** (from `backend/`):
```bash
./mvnw spring-boot:run
# Or on Windows: .\mvnw.cmd spring-boot:run
# Runs on http://localhost:8080
```

**Frontend** (from `frontend/`):
```bash
npm start
# Runs on http://localhost:4200
# Auto-reloads on file changes
```

**Database Setup**:
```sql
-- Execute scripts in order from database/:
1. create_shop_hours_table.sql
2. populate_shop_hours.sql
3. reset_admin_password.sql (creates admin user: admin@admin.com / admin)
```

### Key Configuration Files
- `backend/src/main/resources/application.properties` - Database connection, JWT secret, server port
- `frontend/src/app/app.config.ts` - HTTP client, interceptors, routing providers
- `backend/pom.xml` - Java 17, Spring Boot 3.5.7, Lombok, JWT (jjwt 0.12.7)
- `frontend/package.json` - Angular 20.3, jwt-decode 4.0.0

### Testing Endpoints
Use `PROGRESS_TRACKER.md` as API reference - contains exhaustive endpoint list with request/response examples.

## Code Conventions

### Backend
- **Always use Lombok `@Data`** on entities - never write manual getters/setters
- **Use `Optional` properly**: `.orElseThrow(() -> new RuntimeException("..."))`
- **Enums for states**: Defined inside entity classes (`Appointments.StatoAppuntamento`, `WaitingList.StatoListaAttesa`)
- **Console logging**: Extensive `System.out.println()` for debugging (especially in `AppointmentsService`)

### Frontend
- **Standalone components** - No `@NgModule`, use `standalone: true` and explicit `imports: [CommonModule, FormsModule]`
- **Services**: `providedIn: 'root'` for singleton services
- **Type safety**: Use interfaces from `models/` (e.g., `Appointment`, `Barber`, `Service`)
- **API calls**: Return `Observable<T>`, subscribe in components

### Naming Conventions
- **Backend**: CamelCase for Java, snake_case for database columns
- **Frontend**: camelCase for variables/methods, PascalCase for classes/interfaces
- **Italian field names**: Database uses Italian (`orario_inizio`, `data_creazione`, `nome`, `cognome`) - preserve this in entities

## Known Issues & Gotchas

1. **PROGRESS_TRACKER.md is the source of truth** - Always check this file for latest feature status and detailed API specs
2. **Slot algorithm changed**: Initially described as "5-minute slots" but implemented with service-duration-based slots
3. **CORS must be configured** - Frontend runs on :4200, backend on :8080
4. **MySQL time precision**: `TIME(6)` fields in database for microsecond precision
5. **JWT expiration**: Tokens expire after configured period in `application.properties`
6. **Role-based access**: Admin endpoints require `ADMIN` role - checked in JWT claims

## File References

**Key Backend Files**:
- `AppointmentsService.java` - Core booking logic with slot generation and availability checking
- `WaitingListService.java` - FIFO queue management with auto-assignment
- `SecurityConfig.java` - Public/protected endpoint configuration
- `JwtUtil.java` + `JwtRequestFilter.java` - JWT generation and validation

**Key Frontend Files**:
- `app.config.ts` - Application-wide providers (HTTP, interceptors, routing)
- `auth.service.ts` - JWT token management and user retrieval
- `appointment.service.ts` - Appointment CRUD and available slots API
- `customer-dashboard.component.ts` - Example of loading user data from JWT

**Documentation**:
- `PROGRESS_TRACKER.md` - Comprehensive feature tracker with API examples (Italian)
- `database/*.sql` - Database initialization scripts

## Adding New Features

1. **New Entity**: Create in `model/` with `@Data`, corresponding repository in `repository/`, service in `service/`, controller in `controller/`
2. **New API Endpoint**: Add to controller with proper `@GetMapping/@PostMapping`, update `SecurityConfig` if public access needed
3. **New Frontend Component**: Generate with `ng generate component components/feature-name`, add route in `app.routes.ts`
4. **Database Changes**: Update `application.properties` with `spring.jpa.hibernate.ddl-auto=update` for auto-schema updates (or create SQL migration)

## Project Status
Currently in **Phase 2 (UI/UX Styling)** - Phase 1 (Backend APIs + Frontend functionality) is complete. See `PROGRESS_TRACKER.md` for detailed progress and upcoming features.
