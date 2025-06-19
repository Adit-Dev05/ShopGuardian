# ShopGuardian - Deception-Based Security Platform

## Overview

ShopGuardian is a full-stack deception security platform designed to detect and log unauthorized access attempts by creating realistic fake retail interfaces. The application uses a dual-interface approach: a deception layer that mimics legitimate e-commerce platforms (like Walmart) to trap potential attackers, and an admin dashboard for monitoring security events in real-time.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling and ESM output

### Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM with Neon Database serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema pushing
- **Connection**: Environment-based DATABASE_URL configuration

## Key Components

### 1. Deception Interface
- **Fake Login Form**: Captures login attempts with email/password logging
- **Fake Retail Dashboard**: Simulates product inventory management
- **Interactive Elements**: Tracks navigation clicks, form interactions, and user behavior
- **Walmart Branding**: Mimics legitimate retail interface to appear authentic

### 2. Admin Dashboard
- **Real-time Activity Feed**: Live monitoring of security events
- **Interaction Statistics**: Aggregated metrics on different interaction types
- **System Status**: Monitoring dashboard for deception layer health
- **IP Tracking**: Geographic and behavioral analysis of access attempts

### 3. Interaction Logging System
- **Client-side Logger**: Automatic tracking of user interactions
- **Session Management**: Persistent session tracking across page loads
- **Event Types**: Login attempts, form focus, navigation clicks, product views
- **Data Collection**: User agent, IP address, URL, and interaction metadata

## Data Flow

1. **User Access**: Visitors land on the deception interface
2. **Interaction Capture**: Client-side logger captures all user interactions
3. **Real-time Transmission**: Events sent to backend API endpoints
4. **Database Storage**: Interactions stored in PostgreSQL with timestamps
5. **Admin Monitoring**: Real-time dashboard updates via React Query polling
6. **Alert Generation**: Suspicious patterns trigger admin notifications

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **class-variance-authority**: Component variant management
- **zod**: Runtime type validation and schema definition

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **drizzle-kit**: Database schema management
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite development server with HMR
- **Database**: Automatic Neon database provisioning
- **Port Configuration**: Internal port 5000, external port 80

### Production Deployment
- **Build Process**: Dual build for client (Vite) and server (esbuild)
- **Output Structure**: 
  - Client assets in `dist/public`
  - Server bundle in `dist/index.js`
- **Deployment Target**: Replit Autoscale for automatic scaling
- **Process Management**: PM2-style process management with npm scripts

### Database Management
- **Schema Evolution**: Drizzle migrations in `./migrations` directory
- **Environment Variables**: DATABASE_URL for connection string
- **Development Workflow**: `npm run db:push` for schema synchronization

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```