# Boat Manager App

## Overview

Boat Manager App is a web application for managing boats, built with Java 21 and Spring Boot for the backend and Angular 19 for the frontend. The backend uses Gradle as the build tool and includes a Docker setup for running the database locally.

## Prerequisites

Ensure you have the following installed:

Java 21

Node.js (latest LTS recommended)

Angular CLI (npm install -g @angular/cli)

Gradle

Docker & Docker Compose (for database setup)

## Backend Setup

### 1. Clone the repository

``git clone https://github.com/Lmsantos89/boat-manager-app.git``<br>
``cd boat-manager-app/backend``

### 2. Start the database

Run the following command inside the backend directory:

``docker-compose up -d``

This will start the required database services.

### 3. Build and run the backend

``gradle bootRun``

The backend will start on http://localhost:8080.

### 4. Run backend tests

To run the tests, execute:

``gradle test``

To generate a test coverage report with JaCoCo:

``./gradlew test jacocoTestReport``<br>

The test report can be found in  ``.\backend/build/reports/jacoco/html/index.html``

## Frontend Setup

### 1. Navigate to the frontend directory

cd ../frontend

### 2. Install dependencies

``npm install``

### 3. Run the frontend

``ng serve``

The frontend will be available at http://localhost:4200.

### 4. Run frontend tests

``ng test``

## Stopping the Application

To stop the database:

``docker-compose down``

To stop the frontend, press Ctrl + C in the terminal where it's running.
To stop the backend, press Ctrl + C in its terminal as well.

# License

This project is licensed under the MIT License.
