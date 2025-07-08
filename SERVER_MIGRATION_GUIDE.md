# Server-Side Migration Guide: JWT to httpOnly Cookies

## Overview

This guide outlines the server-side changes needed to complete the migration from localStorage JWT tokens to httpOnly cookies for enhanced security.

## Frontend Changes Complete ✅

The frontend has been updated to:
- Use httpOnly cookies for authentication instead of localStorage
- Include CSRF tokens in all state-changing requests
- Automatically handle token refresh through cookies
- Clear authentication state properly on logout

## Backend Response Format

The backend should return this format for login:

```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  csrfToken: string;
  message?: string;
}
```

## Required Server Changes

### 1. Cookie Configuration

Update your server to set httpOnly cookies for JWT tokens:

```javascript
// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // ... authenticate user ...
  
  const accessToken = generateJWT(user, '15m');
  const refreshToken = generateJWT(user, '7d', 'refresh');
  const csrfToken = generateCSRFToken();
  
  // Set httpOnly cookies
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  // Store CSRF token in session
  req.session.csrf_token = csrfToken;
  
  res.json({
    user: user,
    csrfToken: csrfToken,
    message: 'Login successful',
  });
});
```

### 2. Authentication Middleware

Update middleware to read tokens from cookies:

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### 3. CSRF Protection

Implement CSRF token validation:

```javascript
const validateCSRF = (req, res, next) => {
  const clientToken = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrf_token;
  
  if (!clientToken || !sessionToken || clientToken !== sessionToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }
  
  next();
};

// Apply to all state-changing routes
app.use('/api', validateCSRF);
```

### 4. Token Refresh Endpoint

Update refresh endpoint to use cookies:

```javascript
app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    const newAccessToken = generateJWT(user, '15m');
    const newRefreshToken = generateJWT(user, '7d', 'refresh');
    const csrfToken = generateCSRFToken();
    
    // Update cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    req.session.csrf_token = csrfToken;
    
    res.json({
      csrfToken: csrfToken,
    });
  });
});
```

### 5. Logout Endpoint

Clear cookies on logout:

```javascript
app.post('/auth/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});
```

### 6. CSRF Token Endpoint

Provide CSRF token to client:

```javascript
app.get('/auth/csrf-token', (req, res) => {
  const csrfToken = generateCSRFToken();
  req.session.csrf_token = csrfToken;
  res.json({ csrfToken: csrfToken });
});
```

### 7. User Profile Endpoint

Add profile endpoint for authentication checking:

```javascript
app.get('/auth/me', authenticateToken, (req, res) => {
  res.json(req.user);
});
```

### 8. CORS Configuration

Update CORS to allow cookies:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### 9. Session Configuration

Add session middleware:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
```

## Helper Functions

### Generate CSRF Token

```javascript
const crypto = require('crypto');

const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
```

### Generate JWT Token

```javascript
const jwt = require('jsonwebtoken');

const generateJWT = (user, expiresIn = '15m', type = 'access') => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      type: type 
    },
    type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET,
    { expiresIn }
  );
};
```

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
SESSION_SECRET=your-session-secret-key
FRONTEND_URL=http://localhost:5173
```

## Testing

Test the migration with:

1. **Login Flow**: Verify cookies are set after login
2. **API Requests**: Check that authenticated requests work
3. **Token Refresh**: Ensure automatic token refresh works
4. **Logout**: Verify cookies are cleared
5. **CSRF Protection**: Test that CSRF tokens are validated

## Security Benefits

✅ **XSS Protection**: Cookies can't be accessed by JavaScript
✅ **CSRF Protection**: Tokens prevent cross-site requests
✅ **Automatic Expiration**: Server controls token lifetime
✅ **Secure Transport**: Cookies use Secure and SameSite flags
✅ **No Client Storage**: Eliminates localStorage vulnerabilities

## Migration Checklist

- [ ] Update login endpoint to set httpOnly cookies
- [ ] Update authentication middleware to read cookies
- [ ] Implement CSRF token generation and validation
- [ ] Update refresh endpoint for cookie handling
- [ ] Add logout endpoint to clear cookies
- [ ] Add /auth/me endpoint for profile checking
- [ ] Configure CORS for credentials
- [ ] Add session middleware
- [ ] Test all authentication flows
- [ ] Update environment variables
- [ ] Deploy and verify in production

This migration significantly improves the security posture of your application by eliminating XSS vulnerabilities related to token storage and adding CSRF protection.