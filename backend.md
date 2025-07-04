# Backend Specification - Todo Application

## Overview

This document outlines the backend architecture and implementation requirements for the todo application using **Nest.js** with **TypeScript**. The backend will provide RESTful APIs for user authentication, todo management, and data persistence.

## Technology Stack

- **Framework**: Nest.js (Express.js under the hood)
- **Language**: TypeScript
- **Database**: PostgreSQL (recommended) or MongoDB
- **ORM**: TypeORM (for PostgreSQL) or Mongoose (for MongoDB)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Caching**: Redis (optional)

## Project Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── todos/
│   │   ├── todos.controller.ts
│   │   ├── todos.service.ts
│   │   ├── todos.module.ts
│   │   ├── entities/
│   │   │   └── todo.entity.ts
│   │   └── dto/
│   │       ├── create-todo.dto.ts
│   │       ├── update-todo.dto.ts
│   │       └── bulk-action.dto.ts
│   ├── settings/
│   │   ├── settings.controller.ts
│   │   ├── settings.service.ts
│   │   ├── settings.module.ts
│   │   ├── entities/
│   │   │   └── user-settings.entity.ts
│   │   └── dto/
│   │       └── update-settings.dto.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Data Models

### User Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Todo } from '../todos/entities/todo.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed with bcrypt

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Todo, todo => todo.user)
  todos: Todo[];

  @OneToOne(() => UserSettings, settings => settings.user)
  settings: UserSettings;
}
```

### Todo Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'inProgress' | 'done' | custom statuses

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

### User Settings Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json', { nullable: true })
  customStatuses?: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
  }>;

  @Column({ default: 'kanban' })
  defaultView: string; // 'kanban' | 'calendar'

  @Column({ default: false })
  showCompletedTodos: boolean;

  @Column({ default: true })
  enableNotifications: boolean;

  @OneToOne(() => User, user => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
```

## DTOs (Data Transfer Objects)

### Auth DTOs

```typescript
// dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

// dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### Todo DTOs

```typescript
// dto/create-todo.dto.ts
import { IsString, IsOptional, IsDate, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dueDate?: Date;
}

// dto/update-todo.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

// dto/bulk-action.dto.ts
import { IsArray, IsString, IsOptional } from 'class-validator';

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  todoIds: string[];

  @IsString()
  action: 'delete' | 'complete' | 'incomplete' | 'changeStatus';

  @IsOptional()
  @IsString()
  newStatus?: string;
}
```

## API Endpoints

### Authentication Routes

```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}
```

### Todo Routes

```typescript
// todos.controller.ts
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.todosService.findAll(user.id, { status, search, page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.todosService.findOne(id, user.id);
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: User) {
    return this.todosService.create(createTodoDto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: User,
  ) {
    return this.todosService.update(id, updateTodoDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.todosService.remove(id, user.id);
  }

  @Post('bulk-action')
  async bulkAction(@Body() bulkActionDto: BulkActionDto, @CurrentUser() user: User) {
    return this.todosService.bulkAction(bulkActionDto, user.id);
  }
}
```

### Settings Routes

```typescript
// settings.controller.ts
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(user.id);
  }

  @Patch()
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser() user: User,
  ) {
    return this.settingsService.updateSettings(user.id, updateSettingsDto);
  }
}
```

## Database Configuration

### TypeORM Configuration

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=todo_app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Authentication & Authorization

### JWT Strategy

```typescript
// strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    return user;
  }
}
```

### Auth Service

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !await bcrypt.compare(loginDto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    // Implement refresh token logic
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}
```

## Error Handling & Validation

### Global Exception Filter

```typescript
// filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## Testing Strategy

### Unit Tests Example

```typescript
// todos.service.spec.ts
describe('TodosService', () => {
  let service: TodosService;
  let repository: Repository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto = { title: 'Test Todo' };
      const userId = 'user-id';
      
      jest.spyOn(repository, 'create').mockReturnValue(mockTodo);
      jest.spyOn(repository, 'save').mockResolvedValue(mockTodo);

      const result = await service.create(createTodoDto, userId);
      
      expect(result).toEqual(mockTodo);
    });
  });
});
```

## Deployment & DevOps

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    volumes:
      - ./.env:/app/.env

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: todo_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Integration with Frontend

### API Client Setup

```typescript
// Frontend: services/api.ts
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL = API_BASE_URL;
  private token = localStorage.getItem('access_token');

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Auth methods
  async login(credentials: LoginDto) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.access_token;
    localStorage.setItem('access_token', this.token);
    return response;
  }

  // Todo methods
  async getTodos(params?: TodoQueryParams) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/todos?${queryString}`);
  }

  async createTodo(todo: CreateTodoDto) {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(id: string, todo: UpdateTodoDto) {
    return this.request(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(todo),
    });
  }

  async deleteTodo(id: string) {
    return this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkAction(action: BulkActionDto) {
    return this.request('/todos/bulk-action', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }
}

export const apiClient = new ApiClient();
```

## Security Considerations

1. **Password Security**: Use bcrypt with salt rounds >= 12
2. **JWT Security**: Short-lived access tokens (15 minutes) with refresh tokens
3. **Input Validation**: Use class-validator for all DTOs
4. **SQL Injection**: Use TypeORM parameterized queries
5. **CORS**: Configure proper CORS origins
6. **Rate Limiting**: Implement rate limiting for auth endpoints
7. **Helmet**: Use helmet for security headers
8. **Environment Variables**: Never commit secrets to version control

## Performance Optimizations

1. **Database Indexing**: Index frequently queried fields (userId, status, createdAt)
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Caching**: Use Redis for frequently accessed data
4. **Connection Pooling**: Configure database connection pooling
5. **Query Optimization**: Use select specific fields, avoid N+1 queries
6. **Compression**: Enable gzip compression
7. **CDN**: Use CDN for static assets

## Next Steps

1. **Setup Development Environment**:
   ```bash
   npm i -g @nestjs/cli
   nest new todo-backend
   npm install @nestjs/typeorm typeorm pg
   npm install @nestjs/jwt @nestjs/passport passport-jwt
   npm install class-validator class-transformer
   npm install bcrypt
   ```

2. **Database Setup**:
   - Install PostgreSQL
   - Create database and user
   - Run migrations

3. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Configure database and JWT secrets

4. **Development**:
   - Implement entities and DTOs
   - Create services and controllers
   - Add authentication guards
   - Write unit tests

5. **Integration**:
   - Update frontend to use API endpoints
   - Replace localStorage with API calls
   - Add error handling and loading states

This backend specification provides a complete foundation for your todo application with proper authentication, data persistence, and scalability considerations.