# StudExam

> Together we share, together we pass.

A collaborative platform for students to share and discover study materials and exam packages.

## Overview

StudExam is a full-stack application designed to help students collaborate by sharing study materials, exam papers, and educational resources. The platform features a RESTful API built with NestJS and TypeScript, providing a robust backend for managing users, packages, tags, and categories.

## Project Structure

This repository contains the following components:

- **studexam-api**: NestJS REST API backend

## Features

### Authentication & Authorization
- JWT-based authentication with cookie support
- Role-based access control (Admin, Moderator, User)
- Secure password hashing with Argon2
- Partial and complete JWT strategies for flexible authentication

### Core Modules

#### Packages
- Create, read, update, and delete study packages
- Search and filter packages
- Tag-based organization
- User ownership and permissions

#### Tags
- Flexible tagging system for packages
- CRUD operations for tags
- Tag-based package discovery

#### Categories
- Hierarchical organization of content
- Category management

#### Users
- User registration and authentication
- Profile management
- Role-based permissions

## Technology Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: Passport JWT
- **Password Hashing**: Argon2
- **Validation**: class-validator, class-transformer
- **Configuration**: Joi for environment validation

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/erikscolaro/studexam.git
   cd studexam
   ```

2. **Navigate to the API directory**
   ```bash
   cd studexam-api
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   - Copy `config.json.example` to `config.json` (or rename the existing `config.json`)
   - Update the configuration with your database credentials and JWT secret
   ```json
   {
     "NODE_ENV": "development",
     "PORT": 3000,
     "DB_TYPE": "postgres",
     "DB_HOST": "localhost",
     "DB_PORT": 5432,
     "DB_USER": "your_db_user",
     "DB_PASS": "your_db_password",
     "DB_NAME": "studexam_db_dev",
     "JWT_SECRET": "your-secure-jwt-secret-here"
   }
   ```

5. **Initialize the database**
   ```bash
   npm run init-db
   ```

6. **Run database migrations** (if applicable)
   ```bash
   npm run migration:run
   ```

### Running the Application

```bash
# Development mode
npm run start:dev

# Fast development mode with SWC builder
npm run start:fast

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## API Documentation

### Main Endpoints

- **Authentication**: `/auth`
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Login and receive JWT token
  - `GET /auth/me` - Get current user profile

- **Users**: `/users`
  - CRUD operations for user management

- **Packages**: `/packages`
  - CRUD operations for study packages
  - Search and filter functionality

- **Tags**: `/tags`
  - Tag management for organizing packages

- **Categories**: `/categories`
  - Category management for content organization

## Security Features

- Password hashing with Argon2
- JWT tokens stored in HTTP-only cookies
- Role-based access control with decorators
- Request validation and sanitization
- Environment-based configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

**Erik Scolaro**
- GitHub: [@erikscolaro](https://github.com/erikscolaro)

## Acknowledgments

Built with [NestJS](https://nestjs.com/) - A progressive Node.js framework
