# SecureScan - Security Vulnerability Scanner

## Overview

SecureScan is a full-stack web application designed for security professionals and developers to perform comprehensive security scans on web applications and infrastructure. The application provides port scanning capabilities, vulnerability detection, and detailed security reporting through an intuitive web interface.

The system is built as a modern web application with a React frontend, Express.js backend, and PostgreSQL database, focusing on real-time scanning capabilities and professional security analysis reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Animations**: Framer Motion for smooth UI transitions and loading states

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API structure with rate limiting for security scanning endpoints
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot module replacement with Vite integration for full-stack development

### Database Layer
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Structured tables for scans, scan results, and vulnerabilities with proper relationships
- **Storage Strategy**: Dual storage implementation with in-memory storage for development and PostgreSQL for production

### Security Scanning Engine
- **Port Scanning**: Custom TCP port scanning implementation using Node.js net module
- **Service Detection**: Built-in service identification for common ports
- **Vulnerability Assessment**: Structured vulnerability reporting with CVSS scoring
- **Rate Limiting**: Express rate limiting to prevent abuse of scanning endpoints
- **Risk Classification**: Multi-level risk assessment (low, medium, high, critical)

### Real-time Features
- **Polling Strategy**: Client-side polling for scan progress updates
- **Status Management**: Comprehensive scan status tracking (pending, running, completed, failed)
- **Live Updates**: Real-time progress indicators and result streaming

### Data Models
The application uses a three-table structure:
- **Scans**: Primary scan records with URL, status, and metadata
- **Scan Results**: Individual port scan results with service detection
- **Vulnerabilities**: Security findings with severity classification and remediation guidance

### UI/UX Design
- **Component System**: shadcn/ui components with Radix UI primitives for accessibility
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Loading States**: Progressive loading with skeleton screens and animated indicators
- **Error Handling**: User-friendly error messages with toast notifications
- **Theme Support**: CSS custom properties for consistent theming

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Vercel/Replit**: Platform deployment with environment variable configuration

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **TypeScript Compiler**: Type checking and compilation
- **ESBuild**: Fast JavaScript bundling for production builds

### Frontend Libraries
- **Radix UI**: Accessible component primitives for form controls and overlays
- **Lucide React**: Consistent icon library for UI elements
- **React Hook Form**: Form state management with validation
- **Class Variance Authority**: Component variant management
- **Tailwind Merge**: CSS class optimization and deduplication

### Backend Libraries
- **Express Rate Limit**: API rate limiting for security endpoints
- **Connect PG Simple**: PostgreSQL session storage (configured but not actively used)
- **Zod**: Runtime type validation for API inputs and database schemas

### Font and Styling
- **Google Fonts**: Inter, DM Sans, Architects Daughter, Fira Code, and Geist Mono for typography
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

The application is designed for easy deployment on platforms like Replit with minimal configuration requirements, using environment variables for database connections and feature flags.