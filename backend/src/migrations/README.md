# Database Migrations

## Overview

This directory contains TypeORM migrations for the Sirius Academy database schema.

## Important Guidelines

### ⚠️ Production Safety

**NEVER run migrations in production without:**

1. Creating a complete database backup
2. Testing the migration on a staging environment
3. Reviewing the generated SQL queries
4. Having a rollback plan ready

### 🔄 Running Migrations

```bash
# Generate a new migration (after entity changes)
npm run migration:generate src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration (USE WITH CAUTION)
npm run migration:revert

# Show migration status
npm run migration:show
```

### ⚠️ Rollback Warnings

**CRITICAL:** The `down()` method in migrations will **DELETE ALL DATA** in affected tables.

**Before running `migration:revert` in production:**

1. ✅ Create a full database backup
2. ✅ Export critical data to CSV/JSON
3. ✅ Verify backup integrity
4. ✅ Have a tested restore procedure
5. ✅ Notify your team
6. ✅ Schedule during maintenance window

### 📝 Migration Best Practices

1. **Test migrations locally first**
   - Run `up()` and verify schema
   - Run `down()` and verify rollback works
   - Run `up()` again to ensure idempotency

2. **Add data migrations when needed**
   - Use `queryRunner.query()` to transform existing data
   - Handle null/default values appropriately
   - Add logging for data transformations

3. **Never modify existing migrations**
   - Once deployed, migrations are immutable
   - Create a new migration to fix issues
   - Maintain migration history for audit trail

4. **Review generated migrations**
   - TypeORM auto-generates migrations
   - Always review the SQL before committing
   - Adjust if needed (e.g., add indexes, data migrations)

### 🗂️ Migration Naming Convention

Format: `{timestamp}-{DescriptiveName}.ts`

Examples:

- `1762339145322-InitialSchema.ts`
- `1762339876543-AddUserEmailColumn.ts`
- `1762340123456-MigrateOldLessonStatus.ts`

### 🔍 Troubleshooting

**Migration fails halfway:**

```bash
# Check which migrations ran
npm run migration:show

# Manually fix the database if needed
# Then run again or revert
```

**Need to reset database (DEVELOPMENT ONLY):**

```bash
# Drop all tables
docker-compose down -v
docker-compose up -d

# Run all migrations fresh
npm run migration:run
```

## Migration History

| Date       | Migration     | Description                                                        | Author |
| ---------- | ------------- | ------------------------------------------------------------------ | ------ |
| 2024-11-05 | InitialSchema | Created base schema with users, teachers, students, lessons tables | System |
