# Tags-Packages API Implementation

This implementation provides a many-to-many relationship between Tags and Packages with the following features:

## Entities

### TagEntity
- `id`: UUID primary key
- `slug`: Unique string identifier (max 100 chars)
- `name`: Display name (max 255 chars)  
- `description`: Optional text description

### PackageEntity
- `id`: UUID primary key
- `name`: Package name (max 255 chars)
- `description`: Optional package description
- `version`: Optional version string
- `isPublic`: Boolean flag for public visibility
- `userId`: Foreign key to user (owner)
- `tags`: Many-to-many relationship with TagEntity
- `createdAt`/`updatedAt`: Timestamps

## API Endpoints

### Package Search
`GET /packages/search?username=<partial>&keywords=<slug1>,<slug2>,...`

**Query Parameters:**
- `username` (optional): Partial username to filter by package owner
- `keywords` (optional): Comma-separated list of tag slugs

**Search Logic:**
1. First filters by partial username if provided
2. Then finds packages with at least one matching keyword
3. Orders results by number of matching keywords (descending)
4. Each package includes the total tag count

**Response Format:**
```json
[
  {
    "id": "uuid",
    "name": "Package Name",
    "description": "Package description",
    "version": "1.0.0",
    "isPublic": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z",
    "username": "owner_username",
    "tags": [
      {
        "id": "uuid",
        "slug": "tag-slug",
        "name": "Tag Name",
        "description": "Tag description"
      }
    ],
    "tagCount": 2
  }
]
```

### Other Endpoints
- `GET /packages` - List all public packages
- `GET /packages/:id` - Get specific package by ID
- `POST /packages` - Create new package (requires authentication)

## Database Schema

The many-to-many relationship uses TypeORM's `@JoinTable` which creates an intermediate table `package_tags` with:
- `packageId`: Foreign key to packages.id
- `tagId`: Foreign key to tags.id

## Authentication

- Search endpoints use `JwtAuthGuardPartialUser` (allows public access)
- Create endpoints use `JwtAuthGuardCompleteUser` (requires full authentication)

## Features Implemented

✅ Tag and Package entities with proper TypeORM configuration
✅ Many-to-many relationship with intermediate table
✅ Keyword search functionality
✅ Username filtering
✅ Result sorting by matching keyword count
✅ Public field exposure through DTOs
✅ Proper error handling
✅ Unit tests for service layer