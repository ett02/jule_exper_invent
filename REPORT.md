# Refactoring and Testing Report

## 1. Introduction

This report outlines the work done to refactor and test the full-stack application. The goal was to improve the quality, maintainability, performance, and robustness of the codebase.

## 2. Backend Refactoring

### 2.1. Circular Dependency

A circular dependency between `AppointmentsService` and `WaitingListService` was identified and resolved. The `processWaitingListForCancelledAppointment` method was moved from `WaitingListService` to `AppointmentsService`, breaking the cycle.

### 2.2. N+1 Query

An N+1 query problem was identified in the `isSlotAvailable` method. The method was optimized to fetch all appointments for a given barber and date in a single query, reducing the number of database queries.

### 2.3. DRY Principle

The DRY principle was applied by extracting the logic for finding entities into a separate, reusable method. This reduced code duplication and improved maintainability.

### 2.4. `pom.xml`

The `pom.xml` file was cleaned up by removing duplicate dependencies and plugins.

## 3. Frontend Refactoring

### 3.1. API Calls

Missing API calls in `customer-dashboard.component.ts` were implemented, and mock data was removed. This connected the frontend to the backend and enabled the display of real data.

### 3.2. `ApiService`

The `ApiService` was updated to include methods for canceling appointments and removing users from the waiting list.

## 4. Testing

### 4.1. Backend

Unit tests were written for the `AppointmentsService` to verify the functionality of the `createAppointment` and `cancelAppointment` methods. An integration test was written for the `AppointmentsController` to verify the entire flow from the controller to the database.

### 4.2. Frontend

Unit tests were written for the `ApiService` to verify the functionality of the `getAppointmentsByUserId` method. Unit tests were written for the `customer-dashboard.component.ts` to verify that appointments are loaded on initialization.

## 5. Conclusion

The refactoring and testing work has improved the quality, maintainability, performance, and robustness of the codebase. The application is now more scalable and easier to maintain.
