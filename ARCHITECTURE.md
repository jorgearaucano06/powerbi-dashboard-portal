# Architecture & Technical Decisions

## Overview

This project implements a centralized dashboard management system with role-based access control. The architecture prioritizes simplicity and development velocity while maintaining awareness of enterprise scalability requirements.

---

## Technology Stack Rationale

### Frontend: Next.js 15 + React 19
- **Server-Side Rendering (SSR)** for improved SEO and initial load performance
- **App Router** for modern React Server Components
- **TypeScript** for type safety and developer experience

### Backend: Firebase
- **Serverless architecture** eliminates infrastructure management
- **Firestore** provides real-time data synchronization
- **Firebase Auth** handles authentication without custom backend
- **Security rules** enforce server-side data access validation

### Why Firebase over traditional backend?
Firebase was chosen for rapid development and built-in scalability. For small to medium organizations (< 1,000 users), this provides excellent value. For enterprise deployments, see "Enterprise Considerations" below.

---

## Data Model

### Permission System
Current implementation uses arrays for permission management:

```typescript
dashboard: {
  permissions: ["userId1", "userId2", "userId3"]
}
```

**Trade-offs**:
- ✅ Simple implementation and queries
- ✅ Suitable for < 1,000 users per dashboard
- ⚠️ Document size limit (1MB) may be reached with very large user bases
- ⚠️ Write contention on high-traffic dashboards

**Alternative for scale**: Subcollections (`dashboard/{id}/permissions/{userId}`) for unlimited users and distributed writes.

---

## Security

### Authentication
- Firebase Authentication with JWT tokens
- Session management handled by Firebase SDK
- Client-side route protection with AuthContext

### Authorization
- Role-based access control (RBAC): `admin` | `user`
- Firestore security rules enforce server-side validation
- Admin-only routes protected at component level

### Data Access
All data access is validated through Firestore security rules:
```javascript
// Users can only read their own data or if admin
allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));

// Only admins can create/update/delete
allow write: if isAdmin();
```

See `firestore.rules` for complete implementation.

---

## Enterprise Considerations

### Authentication at Scale
For organizations already using Microsoft ecosystem (Office 365, Azure AD):

**Current**: Firebase Authentication
**Enterprise alternative**: Azure Active Directory with SSO

Benefits of Azure AD:
- Single sign-on across Microsoft services
- Integration with existing corporate identity
- Power BI Row-Level Security (RLS) mapping
- Conditional access policies

Implementation would require MSAL.js and Power BI Embedded SDK.

### Power BI Integration
**Current**: Direct URLs to published dashboards
**Enterprise alternative**: Power BI Embedded with programmatic access control

Benefits:
- Dashboards embedded directly in application
- Row-Level Security enforced by Power BI
- No public URLs required
- Token-based access with expiration

---

## Performance Optimization

### Current Optimizations
- Next.js automatic code splitting
- React Server Components reduce client bundle
- Firestore indexes for efficient queries
- Client-side caching with Context API

### Future Optimizations
- Redis caching layer for frequently accessed data
- CDN for static assets
- Lazy loading for dashboard previews
- WebSocket connections for real-time updates (currently uses Firestore listeners)

---

## Deployment Architecture

```
┌─────────────┐
│   Vercel    │  Next.js hosting with edge functions
│   (CDN)     │  Automatic SSL, global distribution
└──────┬──────┘
       │
       ├─────▶ ┌──────────────┐
       │       │   Firebase   │  Authentication & Database
       │       │   (GCP)      │  Firestore + Auth services
       │       └──────────────┘
       │
       └─────▶ ┌──────────────┐
               │  Power BI    │  Dashboard hosting
               │  (Microsoft) │  External service
               └──────────────┘
```

---

## Scalability Considerations

### Current Capacity
- **Users**: < 1,000 concurrent users
- **Dashboards**: Unlimited
- **Queries**: Firestore free tier (50K reads/day)

### Scale Triggers
If any of these metrics are reached, consider architectural changes:

1. **> 1,000 active users**: Migrate permissions to subcollections
2. **> 100,000 reads/day**: Implement caching layer (Redis)
3. **> 10,000 simultaneous connections**: Consider dedicated backend with WebSockets
4. **Microsoft ecosystem**: Migrate to Azure AD + Power BI Embedded

---

## Development Principles

### Code Quality
- TypeScript strict mode enforced
- ESLint for consistent code style
- Component-based architecture for reusability
- Functional components with React hooks

### Security
- Input validation on all forms
- XSS prevention (React automatic escaping)
- CSRF protection (Firebase tokens)
- Environment variables for sensitive data

### Testing
Future implementation should include:
- Unit tests (Jest + React Testing Library)
- Integration tests (Playwright/Cypress)
- Firestore security rules testing

---

## Known Limitations

### Development Features
The `/admin-setup` route is disabled in production for security. In development, it can be enabled with `NEXT_PUBLIC_ENABLE_ADMIN_SETUP=true` for initial admin user creation.

### Browser Compatibility
Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

### Mobile Support
Fully responsive design tested on iOS and Android devices. However, dashboard viewing experience depends on Power BI's mobile optimization.

---

## Contributing

For architectural discussions or significant changes, please open an issue first to discuss the proposed changes and ensure alignment with project goals.

---

**Last Updated**: 2024
**Maintained by**: Jorge Jeferson Araucano Bonifaz
