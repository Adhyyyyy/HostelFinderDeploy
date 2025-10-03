# Hostel Finder API v2.0 - Object-Oriented Architecture

## Overview

This is the completely refactored version of the Hostel Finder API, now built using **Object-Oriented Programming (OOP)** principles with modern design patterns and best practices.

## 🏗️ Architecture

### Object-Oriented Design Patterns

- **Repository Pattern**: Data access layer abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **Dependency Injection**: Loose coupling between components
- **Factory Pattern**: Object creation management
- **Singleton Pattern**: Database connection management

### Layer Structure

```
┌─────────────────────────────────────┐
│           Controllers               │  ← HTTP Request/Response handling
├─────────────────────────────────────┤
│            Services                 │  ← Business Logic Layer
├─────────────────────────────────────┤
│          Repositories               │  ← Data Access Layer
├─────────────────────────────────────┤
│            Models                   │  ← Data Models (Mongoose)
└─────────────────────────────────────┘
```

## 📁 Project Structure

```
api/
├── core/                          # Foundation classes
│   ├── BaseModel.js              # Abstract base model
│   ├── BaseRepository.js         # Abstract repository
│   ├── BaseService.js            # Abstract service
│   ├── BaseController.js         # Abstract controller
│   └── Database.js               # Database singleton
├── interfaces/                    # Interface definitions
│   ├── IRepository.js
│   ├── IService.js
│   └── IController.js
├── repositories/                  # Data access layer
│   ├── UserRepository.js
│   ├── HostelRepository.js
│   ├── RoomRepository.js
│   ├── BedRepository.js
│   ├── BookingRepository.js
│   ├── RestaurantRepository.js
│   └── ReviewRepository.js
├── services/                      # Business logic layer
│   ├── AuthService.js
│   ├── UserService.js
│   ├── HostelService.js
│   ├── RoomService.js
│   ├── BedService.js
│   ├── BookingService.js
│   ├── RestaurantService.js
│   └── ReviewService.js
├── controllers-oop/               # Presentation layer
│   ├── AuthController.js
│   ├── UserController.js
│   ├── HostelController.js
│   ├── RoomController.js
│   ├── BedController.js
│   ├── BookingController.js
│   ├── RestaurantController.js
│   └── ReviewController.js
├── middleware/                    # Middleware classes
│   ├── AuthMiddleware.js
│   ├── ValidationMiddleware.js
│   ├── ErrorMiddleware.js
│   └── LoggingMiddleware.js
├── utils/classes/                 # Utility classes
│   ├── ErrorHandler.js
│   ├── TokenManager.js
│   ├── Validator.js
│   ├── Logger.js
│   └── ResponseBuilder.js
├── routes-oop/                    # OOP route definitions
│   ├── auth.js
│   ├── users.js
│   ├── hostels.js
│   ├── rooms.js
│   ├── beds.js
│   ├── bookings.js
│   ├── restaurants.js
│   └── reviews.js
├── models/                        # Mongoose models (unchanged)
├── logs/                          # Application logs
├── index-oop.js                   # Main OOP application
└── package-oop.json              # OOP package configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the OOP version**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

5. **Start the old version (for comparison)**
   ```bash
   # Development
   npm run dev:old

   # Production
   npm run start:old
   ```

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGO=mongodb://localhost:27017/hostel-finder

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=8800
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
```

## 📚 API Documentation

### Base URL
```
http://localhost:8800/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/auth/verify` | Verify token |
| GET | `/auth/profile` | Get user profile |
| PUT | `/auth/change-password` | Change password |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (admin) |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user (admin) |
| GET | `/users/statistics` | User statistics (admin) |

### Hostel Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hostels` | Get all hostels |
| GET | `/hostels/:id` | Get hostel by ID |
| POST | `/hostels` | Create hostel (admin) |
| PUT | `/hostels/:id` | Update hostel (admin) |
| DELETE | `/hostels/:id` | Delete hostel (admin) |
| GET | `/hostels/search` | Search hostels |
| GET | `/hostels/statistics` | Hostel statistics |

### Room Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | Get all rooms |
| GET | `/rooms/:id` | Get room by ID |
| POST | `/rooms/:hostelid` | Create room (admin) |
| PUT | `/rooms/:id` | Update room (admin) |
| DELETE | `/rooms/:id/:hostelid` | Delete room (admin) |
| GET | `/rooms/hostel/:hostelId` | Get rooms by hostel |

### Booking Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create booking |
| GET | `/bookings` | Get all bookings (admin) |
| PUT | `/bookings/:id/approve` | Approve booking (admin) |
| PUT | `/bookings/:id/reject` | Reject booking (admin) |
| DELETE | `/bookings/:id` | Delete booking (admin) |

## 🏛️ Architecture Benefits

### 1. **Separation of Concerns**
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Manage data access
- **Models**: Define data structure

### 2. **Code Reusability**
- Base classes provide common functionality
- Inheritance reduces code duplication
- Polymorphism enables flexible implementations

### 3. **Maintainability**
- Clear structure makes code easy to understand
- Changes in one layer don't affect others
- Easy to add new features or modify existing ones

### 4. **Testability**
- Each layer can be tested independently
- Dependency injection enables easy mocking
- Clear interfaces define contracts

### 5. **Scalability**
- Easy to add new entities
- Horizontal scaling through service separation
- Performance optimization at specific layers

## 🔍 Key Features

### Advanced Error Handling
```javascript
// Centralized error handling with custom error types
throw ErrorHandler.createValidationError('Invalid email format', 'email');
throw ErrorHandler.createAuthError('Token expired');
throw ErrorHandler.createNotFoundError('User');
```

### Comprehensive Validation
```javascript
// Schema-based validation with sanitization
ValidationMiddleware.validateBody({
  email: { type: 'email', required: true, sanitize: true },
  password: { type: 'string', required: true, minLength: 6 }
})
```

### Advanced Logging
```javascript
// Structured logging with different levels
Logger.info('User created', { userId, email, ip });
Logger.error('Database error', { error, operation, collection });
Logger.logPerformance('API call', duration, { endpoint, statusCode });
```

### Token Management
```javascript
// JWT token management with refresh capabilities
const tokenManager = new TokenManager();
const token = tokenManager.generateAccessToken(payload);
const isValid = tokenManager.verifyToken(token);
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Input Validation** and sanitization
- **Rate Limiting** for authentication endpoints
- **CORS** configuration
- **Security Headers** and middleware
- **SQL Injection** prevention
- **XSS Protection**

## 📊 Monitoring & Logging

### Log Levels
- **Error**: System errors and exceptions
- **Warn**: Warning messages and slow operations
- **Info**: General application information
- **HTTP**: Request/response logging
- **Debug**: Detailed debugging information

### Log Files
- `logs/error.log` - Error messages
- `logs/warn.log` - Warning messages
- `logs/info.log` - Information logs
- `logs/http.log` - HTTP request logs
- `logs/debug.log` - Debug information

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── controllers/
├── integration/
│   ├── auth.test.js
│   ├── users.test.js
│   └── hostels.test.js
└── e2e/
    └── api.test.js
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGO=mongodb://production-url
   JWT_SECRET=production-secret
   ```

2. **Build and Start**
   ```bash
   npm start
   ```

3. **Process Management (PM2)**
   ```bash
   pm2 start index-oop.js --name "hostel-finder-api"
   pm2 startup
   pm2 save
   ```

## 📈 Performance Optimizations

- **Database Indexing** for frequently queried fields
- **Connection Pooling** for database connections
- **Caching** strategies for frequently accessed data
- **Pagination** for large data sets
- **Query Optimization** in repositories
- **Memory Management** and garbage collection

## 🔄 Migration from Old API

### Backward Compatibility
- All existing endpoints remain functional
- Same request/response formats
- Gradual migration approach supported

### Migration Steps
1. Deploy OOP version alongside old version
2. Test endpoints for compatibility
3. Gradually switch traffic to OOP version
4. Monitor performance and errors
5. Complete migration when stable

## 🤝 Contributing

### Code Style
- Use ES6+ features
- Follow OOP principles
- Write comprehensive tests
- Document all public methods
- Use meaningful variable names

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request with description

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Hostel Finder API v2.0** - Built with ❤️ using Object-Oriented Programming principles.
