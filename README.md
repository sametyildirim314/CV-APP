# CVGenius AI

CVGenius AI is a full-stack CV and resume management application built with ASP.NET Core and React. The project combines a secure backend API with a modern frontend experience, enabling users to manage their professional profile, create CV content, and export polished PDF resumes.

## Overview

This repository contains:
- A .NET ASP.NET Core Web API for business logic, authentication, and document generation
- A React frontend for the user interface
- SQL Server integration through Entity Framework Core
- JWT-based authentication and authorization
- PDF export support using QuestPDF

## Features

- User authentication and authorization with JWT
- Secure API endpoints for CV-related operations
- SQL Server database access using Entity Framework Core
- PDF resume generation with QuestPDF
- React-based frontend for a responsive user experience
- OpenAPI/Scalar API documentation in development mode
- CORS support for frontend-to-backend communication

## Tech Stack

- Backend: ASP.NET Core
- Language: C#
- Frontend: React + Create React App
- Database: SQL Server
- ORM: Entity Framework Core
- PDF generation: QuestPDF
- Authentication: JWT Bearer tokens
- API docs: OpenAPI / Scalar

## Project Structure

- `Controllers/` - API endpoints and request handling
- `Data/` - database context and persistence logic
- `Models/` - application entities and data models
- `DTOs/` - request and response data transfer objects
- `Services/` - business logic and PDF generation services
- `Configuration/` - JWT configuration settings
- `Migrations/` - Entity Framework migrations
- `frontend/` - React client application
- `Program.cs` - application startup and dependency configuration

## Prerequisites

Before running the project, make sure you have:
- .NET SDK
- SQL Server running locally or accessible remotely
- Node.js and npm

## Configuration

1. Update the database connection string in `appsettings.json` or use user secrets for local development.
2. Configure the JWT secret key in `appsettings.json` or by using .NET user secrets.

Example:

```bash
dotnet user-secrets set "JwtSettings:SecretKey" "YourVeryStrongSecretKeyHere"
```

## Getting Started

### Backend

```bash
dotnet restore

dotnet run --project "CVGenius AI.csproj"
```

The API will be available on the configured ASP.NET Core port, and the Scalar/OpenAPI page is exposed in development mode.

### Frontend

```bash
cd frontend
npm install
npm start
```

This starts the React app in development mode.

## Notes

- The backend is configured with CORS to allow requests from the frontend application.
- Development mode enables API documentation endpoints for easier testing and integration.
- The app is structured for easy extension as additional CV features and modules are added.

## License

This project is currently provided without a separate license file in the repository.
