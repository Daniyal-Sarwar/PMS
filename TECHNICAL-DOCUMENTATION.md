# Patient Management System - Technical Documentation

## 📋 Project Overview

A modern, microservices-based Patient Management System designed for enterprise deployment with FastAPI backend, responsive frontend, Docker containerization, and Kubernetes orchestration.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Nginx       │    │    Backend      │
│   (React-like)  │────│     Proxy       │────│   (FastAPI)     │
│   Port: 80      │    │   Load Balancer │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌─────────────────┐
                         │   Persistent    │
                         │    Storage      │
                         │   (NFS/PVC)     │
                         └─────────────────┘
```

---

## 🎯 Backend Features (FastAPI)

### Core API Capabilities
- **RESTful Architecture** - Full REST API compliance with OpenAPI 3.0 specification
- **Patient CRUD Operations** - Complete Create, Read, Update, Delete functionality
- **Advanced Search Engine** - Patient search by name with partial matching
- **Multi-field Sorting** - Sort by BMI, height, weight, age, or name
- **Health Monitoring** - Comprehensive health check endpoints for system monitoring
- **Auto-generated Documentation** - Interactive Swagger UI at `/docs` endpoint

### Data Management
- **JSON-based Persistence** - Lightweight file-based data storage system
- **BMI Auto-calculation** - Automatic BMI computation based on height/weight
- **Health Verdict System** - Automatic health status classification:
  - Underweight (BMI < 18.5)
  - Healthy (18.5 ≤ BMI < 25)
  - Overweight (25 ≤ BMI < 30)
  - Obese (BMI ≥ 30)
- **UUID-based Patient IDs** - Unique patient identification with "P" prefix

### Security & Performance
- **CORS Support** - Cross-Origin Resource Sharing for frontend integration
- **Input Validation** - Pydantic models for request/response validation
- **Error Handling** - Comprehensive exception handling with proper HTTP status codes
- **Structured Logging** - Timestamp-based logging system for debugging and monitoring
- **Rate Limiting Ready** - Backend prepared for nginx rate limiting

### API Endpoints Structure
```
GET    /                     - Welcome message
GET    /about               - API information
GET    /health              - Health check status
GET    /patients/           - List all patients
GET    /patients/{id}       - Get specific patient
POST   /patients/           - Create new patient
PUT    /patients/{id}       - Update patient
DELETE /patients/{id}       - Delete patient
GET    /patients/search/    - Search patients by name
GET    /patients/sort/      - Sort patients by field
```

---

## 🎨 Frontend Features (HTML/CSS/JavaScript)

### User Interface
- **Modern Material Design** - Clean, professional interface with gradient backgrounds
- **Responsive Layout** - Mobile-first design that works on all screen sizes
- **Interactive Dashboard** - Real-time statistics and data visualization
- **Modal-based Forms** - Smooth patient creation and editing workflows
- **Tab-based Navigation** - Organized content sections (Dashboard, Patients, Add Patient, Search)

### Data Visualization
- **Statistics Cards** - Live counters for total patients, healthy patients, average BMI
- **BMI Distribution Chart** - Canvas-based bar chart showing health categories
- **Patient Cards Grid** - Responsive grid layout with hover effects
- **Color-coded Verdicts** - Visual health status indicators

### Interactive Features
- **Live Search** - Real-time patient search with instant results
- **Advanced Sorting** - Multiple sort options with ascending/descending order
- **CRUD Operations** - Complete patient management through modal dialogs
- **Error Handling** - User-friendly error messages and success notifications
- **Loading States** - Visual feedback during API operations

### Environment Configuration
- **Smart API Detection** - Automatic endpoint configuration:
  - `localhost` → Direct API calls (`http://localhost:8000`)
  - Production → Proxy calls (`/api/*`)
- **Configuration Management** - `config.js` handles environment switching
- **Cross-platform Support** - Works in Docker, Kubernetes, and local development

---

## 🐳 Docker Implementation

### Backend Container (pms-backend:v1)
- **Base Image**: `python:3.11-slim` - Minimal Python runtime
- **Security**: Non-root user execution for enhanced security
- **Port Exposure**: 8000 for API access
- **Volume Mounting**: `/app/data` for persistent patient data
- **Health Checks**: Built-in endpoint monitoring
- **Environment Variables**:
  - `PYTHONUNBUFFERED=1` - Real-time logging
  - `PORT=8000` - Application port
  - `HOST=0.0.0.0` - Accept all connections

### Frontend Container (pms-frontend:v1)
- **Base Image**: `nginx:alpine` - Lightweight web server
- **Static Serving**: Optimized HTML/CSS/JS delivery
- **API Proxying**: Seamless backend integration via `/api/*` routes
- **Port Exposure**: 80 for web access
- **Configuration**: Custom nginx.conf for advanced features

---

## 🌐 Nginx Configuration & Features

### Reverse Proxy Setup
- **API Proxying**: `/api/*` requests forwarded to backend service
- **URL Rewriting**: Strips `/api` prefix before forwarding to backend
- **Backend Service**: Connects to `backend:8000` service name

### Performance Optimizations
- **Gzip Compression**: Automatic compression for text, CSS, JS, JSON
- **Static File Caching**: 1-hour cache headers for optimal performance
- **Worker Processes**: Optimized for container environments
- **Connection Limits**: 1024 worker connections per process

### Security Headers
- **XSS Protection**: `X-XSS-Protection: 1; mode=block`
- **Frame Options**: `X-Frame-Options: SAMEORIGIN`
- **Content Type**: `X-Content-Type-Options: nosniff`
- **Referrer Policy**: `no-referrer-when-downgrade`
- **CSP**: Content Security Policy for script execution

### CORS Configuration
- **Origin**: `Access-Control-Allow-Origin: *`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Full header support for API operations
- **Preflight**: Proper OPTIONS request handling

### Rate Limiting
- **Zone Configuration**: `zone=api:10m rate=10r/s`
- **Burst Handling**: Up to 20 requests in burst mode
- **Applied Routes**: All `/api/*` endpoints protected

---

## ☸️ Kubernetes Architecture

### Namespace Organization
- **Environment**: `dev` namespace for isolated deployment
- **Resource Grouping**: All components deployed in single namespace

### Backend Deployment (`backend-deploy.yaml`)
- **Deployment Name**: `backend-deployment`
- **Image**: `pms-backend:v1`
- **Replicas**: 1 (scalable via HPA)
- **Container Port**: 8000
- **Resource Limits**:
  - CPU: 250m request, 500m limit
  - Memory: 256Mi request, 512Mi limit
- **Storage**: Persistent volume mounted at `/app/data`

### Backend Service (`backend-svc.yaml`)
- **Service Name**: `backend`
- **Type**: ClusterIP (internal communication)
- **Port Mapping**: 8000:8000
- **Protocol**: TCP

### Frontend Deployment (`frontend-deploy.yaml`)
- **Deployment Name**: `frontend-deploy`
- **Image**: `pms-frontend:v1`
- **Replicas**: 1 (scalable via HPA)
- **Container Port**: 80
- **Resource Limits**:
  - CPU: 250m request, 500m limit
  - Memory: 256Mi request, 512Mi limit

### Frontend Service (`frontend-svc.yaml`)
- **Service Name**: `patient-frontend-service`
- **Type**: LoadBalancer (external access)
- **Port Mapping**: 80:80
- **Protocol**: TCP

### Auto-scaling Configuration

#### Backend HPA (`hpa-backend.yaml`)
- **Min Replicas**: 1
- **Max Replicas**: 10
- **CPU Threshold**: 50% utilization
- **Memory Threshold**: 50% utilization
- **Target**: `backend-deployment`

#### Frontend HPA (`hpa-frontend.yaml`)
- **Min Replicas**: 1
- **Max Replicas**: 10
- **CPU Threshold**: 50% utilization
- **Memory Threshold**: 50% utilization
- **Target**: `frontend-deploy`

### Persistent Storage

#### Persistent Volume (`pv-nfs.yaml`)
- **Storage Type**: NFS (Network File System)
- **Capacity**: 5Gi total storage
- **Access Mode**: ReadWriteOnce
- **Mount Options**: `hard`, `nfsvers=4.1`
- **Reclaim Policy**: Retain
- **NFS Path**: `/exports/kubernetes_nfs_pv`

#### Persistent Volume Claim (`pvc-nfs.yaml`)
- **Claim Name**: `pvc-nfs`
- **Requested Storage**: 2Gi
- **Access Mode**: ReadWriteOnce
- **Storage Class**: "" (manual binding)

---

## 🚀 Deployment Scenarios

### 1. Local Docker Development
```bash
# Build images
docker build -f docker/Dockerfile-backend -t pms-backend:v1 .
docker build -f docker/Dockerfile-frontend -t pms-frontend:v1 .

# Run backend
docker run -p 8000:8000 -v $(pwd)/backend/data:/app/data pms-backend:v1

# Run frontend
docker run -p 3000:80 pms-frontend:v1
```

### 2. Kubernetes Production
```bash
# Create namespace
kubectl create namespace dev

# Deploy storage
kubectl apply -f k8s/pv-nfs.yaml
kubectl apply -f k8s/pvc-nfs.yaml

# Deploy backend
kubectl apply -f k8s/backend-deploy.yaml
kubectl apply -f k8s/backend-svc.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deploy.yaml
kubectl apply -f k8s/frontend-svc.yaml

# Enable auto-scaling
kubectl apply -f k8s/hpa-backend.yaml
kubectl apply -f k8s/hpa-frontend.yaml
```

---

## 📊 Monitoring & Observability

### Health Check Endpoints
- **Backend Health**: `GET /health`
- **API Documentation**: `GET /docs`
- **System Status**: Kubernetes readiness/liveness probes

### Resource Monitoring
- **HPA Metrics**: CPU and memory utilization tracking
- **Pod Scaling**: Automatic scaling based on demand
- **Storage Monitoring**: Persistent volume usage tracking

### Logging Strategy
- **Application Logs**: Structured JSON logging
- **Container Logs**: stdout/stderr capture
- **Nginx Logs**: Access and error logging
- **Kubernetes Events**: Deployment and scaling events

---

## 🔒 Security Implementation

### Container Security
- **Non-root Execution**: Both containers run as non-root users
- **Resource Limits**: CPU and memory limits prevent resource exhaustion
- **Network Policies**: Isolated namespace communication

### Application Security
- **Input Validation**: Pydantic models validate all input data
- **CORS Policy**: Controlled cross-origin access
- **Rate Limiting**: API protection against abuse
- **Error Handling**: No sensitive information in error responses

---

## 🎯 Production Readiness Features

### Scalability
- **Horizontal Pod Autoscaling**: Automatic scaling based on metrics
- **Resource Management**: Defined CPU/memory requests and limits
- **Load Balancing**: Service-level load distribution

### Reliability
- **Health Checks**: Automated health monitoring
- **Persistent Storage**: Data persistence across pod restarts
- **Error Recovery**: Graceful error handling and recovery

### Performance
- **Nginx Optimization**: Static file serving and compression
- **Resource Efficiency**: Minimal container footprint
- **Caching Strategy**: Browser and proxy caching

---

This architecture provides a robust, scalable, and maintainable patient management system suitable for production deployment in Kubernetes environments.
