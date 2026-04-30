# UniFolio – Campus Resource Management Platform

## Overview

UniFolio is a full-stack campus resource management platform developed as a final assignment. The system enables students, staff, administrators, and technicians to manage and discover campus resources, request and track facility bookings, report and resolve maintenance issues, receive real-time notifications, and authenticate securely using Google OAuth 2.0 integrated with JWT-based session management.

The platform follows a decoupled architecture where a React.js Single-Page Application (SPA) communicates with a Spring Boot REST API. All relational data is stored in a MySQL database and managed using Spring Data JPA with Hibernate ORM.

---

## Features

- Secure authentication using Google OAuth 2.0 and JWT
- Role-based access control (USER, ADMIN, TECHNICIAN)
- Resource management (create, update, delete)
- Facility booking system
- Maintenance ticket tracking and resolution
- Real-time notifications
- Separate dashboards for different user roles

---

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- Custom CSS

### Backend
- Spring Boot 3.5.12
- Java 17
- Spring Security
- Spring Data JPA (Hibernate)
- JWT Authentication
- OAuth2 (Google Login)

### Database
- MySQL (Railway)

---

## Project Structure
unifolio/
├── frontend/ React + Vite frontend
├── backend/  Spring Boot backend

## How to Run the Project

Follow the steps below to set up and run the application locally.

---

## Prerequisites

Ensure the following are installed:

- Node.js (v18 or higher recommended)
- Java 17
- Maven
- Git

---


### 1. Configure Backend
Navigate to:

backend/src/main/resources/application.properties

Update the following values according to your environment:

```properties
Example configuration:
```bash
spring.datasource.url=jdbc:mysql://localhost:3306/unifolio
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=your_jwt_secret
jwt.expiration=86400000

spring.security.oauth2.client.registration.google.client-id=your_client_id
spring.security.oauth2.client.registration.google.client-secret=your_client_secret
spring.security.oauth2.client.registration.google.scope=email,profile
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google


````
### 2. Start Backend Server
```bash
cd backend
mvn clean install
mvn spring-boot:run


cd frontend
npm install
npm run dev

````
### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev


````



## Authentication
- Google OAuth2 login supported
- JWT used for session management
- Role-based authorization enforced on backend and frontend
