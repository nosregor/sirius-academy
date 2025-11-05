# Sirius Academy

A fullstack monorepo application for managing teachers, students, and lessons in educational institutions. Built with **NestJS**, **Angular**, **PostgreSQL**, and **TypeScript** with a focus on clean architecture and scalable design patterns.

## 🚀 Features

- **Teacher Management**: Complete CRUD operations for teacher profiles with instrument specialization
- **Student Management**: Full student lifecycle management with teacher assignments
- **Lesson Scheduling**: Dual workflow system (teacher-initiated and student-requested lessons)
- **Many-to-Many Relationships**: Students can be assigned to multiple teachers
- **Real-time Validation**: Time slot validation, overlap detection, and business rule enforcement
- **Bulk Operations**: Efficient bulk creation of students and lessons
- **Data Export**: CSV export functionality for all entities
- **Modern UI**: Angular Material-based responsive interface
- **Type Safety**: Strict TypeScript configuration across the entire stack

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Design Decisions](#design-decisions)

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL 17+
- **ORM**: TypeORM 0.3.x
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt for password hashing
- **Language**: TypeScript with strict mode

### Frontend

- **Framework**: Angular 20.x (standalone components)
- **UI Library**: Angular Material
- **Styling**: SCSS
- **State Management**: Angular Signals
- **Language**: TypeScript with strict mode

### Development Tools

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Version Control**: Git with conventional commits
- **Monorepo**: npm workspaces

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 17.0 (or Docker for containerized setup)
- **Docker & Docker Compose**: Latest version (recommended for easy database setup)
- **Git**: Latest version

## 📁 Project Structure

```
sirius-academy/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── common/         # Shared utilities, filters, decorators
│   │   ├── config/         # Configuration files
│   │   ├── database/       # Migrations and seeds
│   │   ├── entities/       # TypeORM entities
│   │   ├── teachers/       # Teacher module
│   │   ├── students/       # Student module
│   │   ├── lessons/        # Lesson module
│   │   ├── bulk/          # Bulk operations module
│   │   ├── export/        # Data export module
│   │   ├── app.module.ts  # Root module
│   │   └── main.ts        # Application entry point
│   ├── test/              # E2E tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/              # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Core services and interceptors
│   │   │   ├── features/  # Feature modules (teachers, students, lessons)
│   │   │   ├── shared/    # Shared components and utilities
│   │   │   ├── app.ts     # Root component
│   │   │   └── app.routes.ts
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── package.json
│   └── angular.json
│
├── tasks/                 # Project task lists and PRDs
├── package.json          # Root workspace configuration
├── .prettierrc           # Prettier configuration
├── .eslintrc.js          # ESLint configuration
└── README.md             # This file
```

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sirius-academy
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
npm run install:all
```

Or install them separately:

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Set Up Environment Variables

#### Backend

Copy the example environment file and configure it:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=sirius_academy

TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=true
TYPEORM_MIGRATIONS_RUN=true

BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:4200
API_PREFIX=api/v1
```

#### Frontend

Copy the example environment file:

```bash
cd frontend
cp .env.example .env
```

The default configuration should work:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_ENVIRONMENT=development
```

## 🗄️ Database Setup

### Option 1: Using Docker (Recommended)

The easiest way to set up PostgreSQL is using Docker Compose:

```bash
# Start PostgreSQL container
npm run start:db

# Or manually
docker-compose up -d
```

This will:

- Start PostgreSQL 17 on port 5432
- Create database `sirius_academy`
- Set up with username `postgres` and password `postgres`
- Include health checks and auto-restart

To stop the database:

```bash
docker-compose down
```

To remove the database and all data:

```bash
docker-compose down -v
```

### Option 2: Local PostgreSQL Installation

If you prefer a local installation:

```bash
# Using psql
psql -U postgres
CREATE DATABASE sirius_academy;
\q
```

Or using a GUI tool like pgAdmin or DBeaver.

### 2. Run Migrations

```bash
cd backend
npm run typeorm migration:run
```

### 3. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

This will create:

- 10 sample teachers
- 30 sample students
- 50 sample lessons with varied statuses

## 🏃 Running the Application

### Development Mode

#### Option 1: Run both simultaneously (from root)

```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

#### Option 2: Run separately

**Backend:**

```bash
cd backend
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm start
```

### Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api/v1
- **API Documentation** (if Swagger configured): http://localhost:3000/api/docs

### Production Build

```bash
# Backend
npm run build:backend

# Frontend
npm run build:frontend
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Teachers API

- `POST /teachers` - Create a new teacher
- `GET /teachers` - List all teachers
- `GET /teachers/:id` - Get teacher details
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher (soft delete)
- `GET /teachers/:id/students` - List teacher's students

### Students API

- `POST /students` - Create a new student
- `GET /students` - List all students
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student (soft delete)
- `GET /students/:id/teachers` - List student's teachers
- `POST /students/:studentId/teachers/:teacherId` - Assign teacher to student
- `DELETE /students/:studentId/teachers/:teacherId` - Unassign teacher from student

### Lessons API

- `POST /lessons` - Create a lesson (status depends on creator role)
- `GET /lessons` - List all lessons
- `GET /lessons/:id` - Get lesson details
- `GET /lessons/teacher/:teacherId` - List teacher's lessons
- `GET /lessons/student/:studentId` - List student's lessons
- `PUT /lessons/:id/confirm` - Confirm pending lesson (teacher only)
- `PUT /lessons/:id/reject` - Reject lesson request
- `PUT /lessons/:id/complete` - Mark lesson as completed
- `PUT /lessons/:id/cancel` - Cancel lesson
- `DELETE /lessons/:id` - Delete lesson

### Bulk Operations API

- `POST /bulk/students` - Create multiple students
- `POST /bulk/lessons` - Create multiple lessons

### Export API

- `GET /export/teachers` - Export teachers as CSV
- `GET /export/students` - Export students as CSV
- `GET /export/lessons` - Export lessons as CSV (with filters)

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests (if configured)
npm run e2e
```

### Linting and Formatting

```bash
# From root directory
npm run lint
npm run format
```

## 🎨 Design Decisions

### 1. Dual Lesson Workflow

- **Teacher-created lessons**: Automatically set to `confirmed` status
- **Student-requested lessons**: Set to `pending` status, requiring teacher confirmation

### 2. Time Slot Standardization

- All lesson start times must be on 15-minute increments (:00, :15, :30, :45)
- Minimum lesson duration: 15 minutes
- Maximum lesson duration: 4 hours
- Prevents scheduling conflicts and simplifies overlap detection

### 3. Soft Deletes

- Teachers and Students use soft deletes (via `deleted_at` timestamp)
- Preserves historical data and relationships
- Lessons use hard delete (can be changed if needed)

### 4. Many-to-Many Relationships

- Students can have multiple teachers
- Teachers can have multiple students
- No limits enforced (business rule can be added later)

### 5. Validation Strategy

- Database-level constraints for critical validations
- Application-level validation using class-validator
- Real-time overlap detection for lesson scheduling

### 6. No Authentication (Current Version)

- All API endpoints are public
- Role information passed in request body for lesson creation
- Authentication can be added in future iterations

## 🔧 Common Issues and Solutions

### Database Connection Failed

**Issue**: Backend can't connect to PostgreSQL

**Solution**:

- If using Docker: Check if container is running: `docker ps`
- If using Docker and container is not running: `docker-compose up -d`
- If using local PostgreSQL: Verify it's running: `pg_isready`
- Check credentials in `.env` file match your setup
- Ensure database exists: `psql -U postgres -l` or check Docker logs: `docker logs sirius-academy-db`

### Port Already in Use

**Issue**: Port 3000 or 4200 already in use

**Solution**:

```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200 (frontend)
lsof -ti:4200 | xargs kill -9
```

### Migration Errors

**Issue**: TypeORM migration fails

**Solution**:

```bash
# Drop all tables and re-run migrations (⚠️ Development only!)
npm run typeorm schema:drop
npm run typeorm migration:run
```

### Docker Database Issues

**Issue**: Database container won't start or has connection issues

**Solution**:

```bash
# Check container status
docker ps -a

# View container logs
docker logs sirius-academy-db

# Restart the container
docker-compose restart postgres

# Complete reset (removes all data!)
docker-compose down -v
docker-compose up -d
```

## 📝 Scripts Reference

### Root Level

- `npm run install:all` - Install all dependencies
- `npm run start:backend` - Start backend in dev mode
- `npm run start:frontend` - Start frontend in dev mode
- `npm run build:backend` - Build backend for production
- `npm run build:frontend` - Build frontend for production
- `npm run lint` - Lint all code
- `npm run format` - Format all code with Prettier

### Backend

- `npm run start:dev` - Start with hot reload
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Lint backend code
- `npm run seed` - Run database seeds

### Frontend

- `npm start` - Start dev server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Lint frontend code

## 🤝 Contributing

1. Use conventional commits for git messages
2. Ensure all tests pass before submitting PR
3. Run linting and formatting before committing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

Built as a coding challenge for Sirius Video (https://www.sirius.video/)

## 🔗 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [Angular Material](https://material.angular.io/)

---

**Version**: 1.0.0
**Last Updated**: November 5, 2025
