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
DB_USERNAME=postgres
DB_PASSWORD=postgres
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

```
http://localhost:3000/api/v1/docs
```

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

This section documents the key architectural and design decisions made during the development of Sirius Academy, explaining the rationale behind each choice.

### 1. Dual Lesson Workflow

**Decision**: Implement role-based lesson creation with different initial statuses.

**Rationale**:

- Teachers have scheduling authority and can directly create confirmed lessons
- Students can request lessons but require teacher confirmation
- Provides flexibility while maintaining teacher control over their schedule

**Implementation**:

- **Teacher-created lessons**: `creatorRole: 'teacher'` → Status automatically set to `confirmed`
- **Student-requested lessons**: `creatorRole: 'student'` → Status set to `pending`, requiring teacher action
- Status transitions are validated to ensure business rule compliance

**Example**:

```typescript
// Teacher creates lesson → immediately confirmed
POST /api/v1/lessons
{
  "teacherId": "...",
  "studentId": "...",
  "startTime": "2025-11-06T10:00:00Z",
  "endTime": "2025-11-06T11:00:00Z",
  "creatorRole": "teacher"  // → status: "confirmed"
}

// Student requests lesson → pending confirmation
POST /api/v1/lessons
{
  "teacherId": "...",
  "studentId": "...",
  "startTime": "2025-11-06T10:00:00Z",
  "endTime": "2025-11-06T11:00:00Z",
  "creatorRole": "student"  // → status: "pending"
}
```

**Benefits**:

- Clear separation of responsibilities
- Teachers maintain scheduling control
- Students can request lessons without direct teacher availability
- Audit trail of who created each lesson

---

### 2. Time Slot Standardization

**Decision**: Enforce 15-minute increments for lesson start times and 15 min - 4 hour duration limits.

**Rationale**:

- Standardizes scheduling and prevents arbitrary time slots
- Simplifies overlap detection algorithms
- Provides predictable scheduling windows
- Prevents unrealistic lesson durations (too short or too long)

**Implementation**:

- **Time Slot Validation**: Start times must be on 15-minute boundaries (:00, :15, :30, :45)
  - Database constraint: `CHECK (EXTRACT(MINUTE FROM "start_time") % 15 = 0)`
  - Custom validator: `@IsValidTimeSlot()` decorator
- **Duration Validation**: Lessons must be between 15 minutes and 4 hours
  - Database constraint: `CHECK (EXTRACT(EPOCH FROM ("end_time" - "start_time")) >= 900 AND <= 14400)`
  - Custom validator: `@IsValidLessonDuration()` decorator

**Example**:

```typescript
// ✅ Valid: 15-minute increments
startTime: "2025-11-06T10:00:00Z"  // 10:00 AM
startTime: "2025-11-06T10:15:00Z"  // 10:15 AM
startTime: "2025-11-06T10:30:00Z"  // 10:30 AM

// ❌ Invalid: Not on 15-minute boundary
startTime: "2025-11-06T10:07:00Z"  // Rejected

// ✅ Valid durations
15 minutes (minimum)
60 minutes (1 hour)
240 minutes (4 hours - maximum)

// ❌ Invalid durations
10 minutes (too short)
300 minutes (5 hours - too long)
```

**Benefits**:

- Predictable scheduling windows
- Easier conflict detection
- Better user experience with standardized time slots
- Database-level enforcement ensures data integrity

---

### 3. Soft Deletes

**Decision**: Use soft deletes for Teachers and Students, hard deletes for Lessons.

**Rationale**:

- Preserves historical relationships and data integrity
- Allows recovery of accidentally deleted entities
- Maintains referential integrity for historical lessons
- Lessons are transactional events and can be safely hard-deleted

**Implementation**:

- **Teachers & Students**: Use `@DeleteDateColumn()` with `deletedAt` timestamp
  - Soft delete: `deletedAt` is set to current timestamp
  - Queries automatically exclude soft-deleted entities (TypeORM's `@DeleteDateColumn` behavior)
  - Indexed for performance: `CREATE INDEX ... ON "users" ("deletedAt")`
- **Lessons**: Hard delete (permanent removal)
  - Lessons represent completed or cancelled events
  - No need to preserve deleted lesson records

**Example**:

```typescript
// Soft delete a teacher
DELETE / api / v1 / teachers / { id };
// Sets deletedAt timestamp, but teacher record remains in database

// Query teachers (automatically excludes soft-deleted)
GET / api / v1 / teachers;
// Returns only active teachers (deletedAt IS NULL)

// Hard delete a lesson
DELETE / api / v1 / lessons / { id };
// Permanently removes lesson from database
```

**Benefits**:

- Data recovery capabilities
- Historical data preservation
- Maintains relationship integrity
- Audit trail of deletions
- Performance: Indexed `deletedAt` column for fast filtering

**Trade-offs**:

- Requires filtering in queries (handled automatically by TypeORM)
- Database grows with deleted records (acceptable for this use case)
- Lessons hard-deleted for simplicity (can be changed if needed)

---

### 4. Many-to-Many Relationships

**Decision**: Allow unlimited teacher-student assignments without hard limits.

**Rationale**:

- Students may need multiple teachers for different instruments
- Teachers may teach multiple students
- Business rules can be added later without schema changes
- Provides maximum flexibility for the educational model

**Implementation**:

- **Join Table**: `teacher_students` with `teacher_id` and `student_id`
- **Indexes**: Separate indexes on both foreign keys for query performance
- **Cascading**: Cascade delete on teacher removal (teacher-student relationship removed)
- **No Limits**: No database or application-level constraints on assignment count

**Example**:

```typescript
// Student can have multiple teachers
student.teachers = [
  { id: 'uuid1', instrument: 'Piano' },
  { id: 'uuid2', instrument: 'Guitar' },
  { id: 'uuid3', instrument: 'Violin' },
];

// Teacher can have multiple students
teacher.students = [
  { id: 'uuid4', instrument: 'Piano' },
  { id: 'uuid5', instrument: 'Piano' },
  // ... many more
];
```

**Benefits**:

- Flexible assignment model
- Supports multi-instrument learning
- No artificial constraints
- Easy to add business rules later (e.g., max 5 students per teacher)

**Future Considerations**:

- Could add `maxStudents` field to Teacher entity
- Could add validation in service layer
- Could add monitoring/alerting for high assignment counts

---

### 5. Validation Strategy

**Decision**: Multi-layer validation approach (database + application + custom validators).

**Rationale**:

- Defense in depth: multiple layers catch different types of errors
- Database constraints ensure data integrity even if application logic is bypassed
- Application-level validation provides better error messages
- Custom validators handle complex business rules

**Implementation**:

**Layer 1: Database Constraints**

- Time slot validation: `CHECK (EXTRACT(MINUTE FROM "start_time") % 15 = 0)`
- Duration validation: `CHECK (EXTRACT(EPOCH FROM ("end_time" - "start_time")) >= 900 AND <= 14400)`
- Time range validation: `CHECK ("end_time" > "start_time")`

**Layer 2: Application-Level Validation (class-validator)**

- DTO validation with decorators: `@IsString()`, `@IsNotEmpty()`, `@MinLength()`, etc.
- Custom validators: `@IsValidTimeSlot()`, `@IsValidLessonDuration()`
- Shared validation constants for consistency

**Layer 3: Business Logic Validation**

- Overlap detection in service layer
- Status transition validation
- Role-based workflow validation

**Example**:

```typescript
// Database catches invalid data even if bypassed
INSERT INTO lessons (...) VALUES (...);  // ❌ Fails if time slot invalid

// Application validates before database
@IsValidTimeSlot()
startTime: Date;  // ✅ Validated before save

// Service layer enforces business rules
if (overlappingLesson) {
  throw new ConflictException('Time slot conflict');
}
```

**Benefits**:

- Multiple safety nets
- Better error messages at application level
- Data integrity guaranteed at database level
- Consistent validation rules across the application

---

### 6. Single Table Inheritance (STI)

**Decision**: Use TypeORM's Single Table Inheritance for User, Teacher, and Student entities.

**Rationale**:

- Teachers and Students share common fields (firstName, lastName, password, role)
- Reduces database complexity (single `users` table)
- Simplifies queries and relationships
- Discriminator column (`role`) distinguishes entity types

**Implementation**:

- **Base Entity**: `User` with common fields
- **Discriminator**: `role` enum column ('teacher' | 'student')
- **Child Entities**: `Teacher` and `Student` extend `User` with `@ChildEntity()`
- **Storage**: All stored in `users` table with type-specific columns

**Example**:

```typescript
// Base User entity
@Entity('users')
@TableInheritance({ column: { name: 'role', enum: UserRole } })
export class User {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole; // Discriminator
}

// Teacher extends User
@ChildEntity('teacher')
export class Teacher extends User {
  instrument: string;
  experience: number;
  students: Student[] = [];
}

// Student extends User
@ChildEntity('student')
export class Student extends User {
  instrument: string;
  teachers: Teacher[] = [];
}
```

**Benefits**:

- Single table simplifies queries
- Shared fields don't require joins
- Easy to add common features to all users
- Type-safe entity handling

**Trade-offs**:

- All columns in one table (can get wide)
- Nullable columns for type-specific fields (acceptable for this use case)

---

### 7. No Authentication (Current Version)

**Decision**: Implement without authentication for initial version.

**Rationale**:

- Simplifies initial development and testing
- Focus on core business logic first
- Authentication can be added incrementally
- Role information passed explicitly in requests

**Implementation**:

- All endpoints are public
- `creatorRole` field in lesson creation DTO determines workflow
- No JWT tokens or session management
- No user context or authorization checks

**Future Considerations**:

- Add JWT-based authentication
- Implement role-based access control (RBAC)
- Add user context to requests
- Protect endpoints with guards

**Migration Path**:

- Add `@nestjs/passport` and `@nestjs/jwt`
- Create auth module with login/register endpoints
- Add `@UseGuards(AuthGuard)` to protected routes
- Extract user from request instead of body

---

### 8. Error Handling Strategy

**Decision**: Global exception filter with consistent error responses.

**Rationale**:

- Provides consistent API error format
- Centralized error handling reduces duplication
- Better developer experience with clear error messages
- Easier to add logging and monitoring

**Implementation**:

- **Global Filter**: `HttpExceptionFilter` catches all exceptions
- **Standard Format**: `{ statusCode, message, timestamp, path }`
- **Error Types**: Proper HTTP status codes (400, 404, 409, 500)
- **Validation Errors**: Detailed field-level validation messages

**Example**:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "firstName must be longer than or equal to 2 characters",
    "password must match /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/"
  ],
  "timestamp": "2025-11-05T16:00:00.000Z",
  "path": "/api/v1/teachers"
}
```

**Benefits**:

- Consistent error format
- Better debugging
- Clear validation messages
- Easy to extend with logging

---

### 9. Performance Optimization

**Decision**: Strategic database indexing for common query patterns.

**Rationale**:

- Optimize frequently used queries
- Balance between read performance and write overhead
- Index composite columns for common filter combinations

**Indexes Implemented**:

- `users.role` - Filter by user role
- `users.deletedAt` - Soft delete queries
- `lessons.status` - Filter by lesson status
- `lessons.teacher_id + start_time` (composite) - Teacher schedule queries
- `lessons.student_id + start_time` (composite) - Student schedule queries
- `teacher_students.teacher_id` - Join performance
- `teacher_students.student_id` - Join performance

**Benefits**:

- Fast filtering by status, role, and soft delete
- Efficient schedule queries (teacher/student lessons)
- Optimized join operations
- Scales well with data growth

---

### 10. API Design Principles

**Decision**: RESTful API with versioning and explicit status codes.

**Rationale**:

- Standard REST conventions improve developer experience
- Versioning allows API evolution
- Explicit status codes improve API clarity
- Consistent endpoint naming

**Implementation**:

- **Base Path**: `/api/v1`
- **Resource Naming**: Plural nouns (`/teachers`, `/students`, `/lessons`)
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: Explicit `@HttpCode()` decorators
  - 200 OK - Successful GET/PUT
  - 201 Created - Successful POST
  - 204 No Content - Successful DELETE
  - 400 Bad Request - Validation errors
  - 404 Not Found - Resource not found
  - 409 Conflict - Business rule violations

**Example**:

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)  // Explicit 201
createTeacher(...)

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)  // Explicit 204
deleteTeacher(...)
```

**Benefits**:

- Predictable API behavior
- Clear status code semantics
- Easy to version and extend
- Follows REST best practices

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
