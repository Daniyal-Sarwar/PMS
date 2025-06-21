# Patient Management System - Features & Components

## 🏥 System Overview
A enterprise-grade Patient Management System with microservices architecture, built for production deployment on Kubernetes with Docker containerization.

---

## 🔧 Backend Features (FastAPI)

### 🎯 Core Capabilities
- **REST API** with OpenAPI 3.0 specification
- **Patient CRUD** operations with unique ID generation
- **Advanced Search** by patient name (partial matching)
- **Multi-field Sorting** (BMI, height, weight, age, name)
- **Health Monitoring** with `/health` endpoint
- **Auto BMI Calculation** and health verdict assignment
- **JSON Data Persistence** with file-based storage
- **Comprehensive Logging** with timestamps

### 📊 Health Verdict System
- **Underweight**: BMI < 18.5
- **Healthy**: 18.5 ≤ BMI < 25  
- **Overweight**: 25 ≤ BMI < 30
- **Obese**: BMI ≥ 30

### 🔐 Security Features
- **Input Validation** with Pydantic models
- **CORS Support** for cross-origin requests
- **Error Handling** with proper HTTP status codes
- **Rate Limiting Ready** for nginx integration

---

## 🎨 Frontend Features (HTML/CSS/JavaScript)

### 🖥️ User Interface
- **Modern Design** with gradient backgrounds and animations
- **Responsive Layout** optimized for all screen sizes
- **Tab Navigation** (Dashboard, Patients, Add Patient, Search)
- **Modal Dialogs** for patient forms and details
- **Interactive Cards** with hover effects

### 📈 Data Visualization
- **Live Statistics** (Total patients, Healthy count, Average BMI)
- **BMI Distribution Chart** using HTML5 Canvas
- **Color-coded Health Status** for visual identification
- **Real-time Updates** when data changes

### ⚡ Interactive Features
- **Live Search** with instant results
- **Advanced Sorting** with multiple criteria
- **Complete CRUD** operations through UI
- **Error/Success Messages** with auto-hide
- **Loading States** during API operations

### 🌐 Environment Detection
- **Smart API Configuration**: 
  - `localhost` → Direct API (`http://localhost:8000`)
  - Production → Proxy API (`/api/*`)
- **Automatic Switching** based on hostname
- **Cross-platform Support** (Docker, Kubernetes, Local)

---

## 🐳 Docker Architecture

### Backend Container (`pms-backend:v1`)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
EXPOSE 8000
VOLUME ["/app/data"]
USER app  # Non-root security
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Features:**
- Minimal Python runtime for efficiency
- Non-root user execution for security
- Persistent data volume mounting
- Environment variable configuration
- Health check endpoint integration

### Frontend Container (`pms-frontend:v1`)
```dockerfile
FROM nginx:alpine
COPY frontend/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Features:**
- Lightweight Alpine Linux base
- Optimized static file serving
- Custom nginx configuration
- API proxy integration

---

## 🌐 Nginx Configuration

### 🔄 Reverse Proxy
- **API Routing**: `/api/*` → `http://backend:8000`
- **URL Rewriting**: Strips `/api` prefix before forwarding
- **Service Discovery**: Uses Docker/K8s service names

### ⚡ Performance Optimizations
- **Gzip Compression**: All text/CSS/JS/JSON files
- **Static Caching**: 1-hour cache headers
- **Worker Optimization**: 1024 connections per worker
- **Rate Limiting**: 10 requests/second with 20-burst capacity

### 🔒 Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 🌍 CORS Configuration
- **Origins**: `*` (configurable for production)
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Full API header support
- **Preflight**: Proper OPTIONS handling

---

## ☸️ Kubernetes Architecture

### 📦 Deployment Structure
```
Namespace: dev
├── Backend Deployment (backend-deployment)
├── Backend Service (backend)
├── Frontend Deployment (frontend-deploy) 
├── Frontend Service (patient-frontend-service)
├── Persistent Volume (pv-nfs)
├── Persistent Volume Claim (pvc-nfs)
├── HPA Backend (backend-hpa)
└── HPA Frontend (frontend-hpa)
```

### 🎯 Backend Deployment
- **Image**: `pms-backend:v1`
- **Replicas**: 1 (auto-scalable)
- **Resources**: 250m CPU / 256Mi RAM (request), 500m CPU / 512Mi RAM (limit)
- **Storage**: NFS persistent volume at `/app/data`
- **Port**: 8000

### 🌐 Frontend Deployment  
- **Image**: `pms-frontend:v1`
- **Replicas**: 1 (auto-scalable)
- **Resources**: 250m CPU / 256Mi RAM (request), 500m CPU / 512Mi RAM (limit)
- **Port**: 80

### 🔄 Services Configuration
- **Backend Service**: ClusterIP on port 8000 (internal)
- **Frontend Service**: LoadBalancer on port 80 (external)
- **Service Discovery**: DNS-based service resolution

### 📈 Auto-scaling (HPA)
- **Metrics**: CPU (50%) and Memory (50%) thresholds
- **Scale Range**: 1-10 replicas per service
- **Response Time**: Automatic scaling based on load

### 💾 Storage System
- **Type**: NFS (Network File System)
- **Capacity**: 5Gi total, 2Gi claimed
- **Access**: ReadWriteOnce mode
- **Persistence**: Data survives pod restarts
- **Mount**: `/app/data` in backend container

---

## 🚀 Deployment Workflow

### 1. Image Building
```bash
# Backend image
docker build -f docker/Dockerfile-backend -t pms-backend:v1 .

# Frontend image  
docker build -f docker/Dockerfile-frontend -t pms-frontend:v1 .
```

### 2. Kubernetes Deployment
```bash
# Create namespace
kubectl create namespace dev

# Deploy storage
kubectl apply -f k8s/pv-nfs.yaml
kubectl apply -f k8s/pvc-nfs.yaml

# Deploy applications
kubectl apply -f k8s/backend-deploy.yaml
kubectl apply -f k8s/backend-svc.yaml
kubectl apply -f k8s/frontend-deploy.yaml
kubectl apply -f k8s/frontend-svc.yaml

# Enable auto-scaling
kubectl apply -f k8s/hpa-backend.yaml
kubectl apply -f k8s/hpa-frontend.yaml
```

### 3. Verification
```bash
# Check deployments
kubectl get deployments -n dev

# Check services
kubectl get services -n dev

# Check HPA status
kubectl get hpa -n dev

# View logs
kubectl logs -f deployment/backend-deployment -n dev
```

---

## 📊 System Monitoring

### 🔍 Health Checks
- **Backend**: `GET /health` endpoint
- **Frontend**: Nginx status monitoring
- **Kubernetes**: Readiness/liveness probes

### 📈 Metrics & Scaling
- **CPU Utilization**: Real-time monitoring
- **Memory Usage**: Container memory tracking  
- **Request Rate**: API request monitoring
- **Auto-scaling**: Automatic pod scaling

### 📝 Logging
- **Application Logs**: Structured JSON format
- **Container Logs**: stdout/stderr capture
- **Nginx Logs**: Access and error logging
- **Kubernetes Events**: Deployment events

---

## 🔧 Configuration Files

### Key Configuration Files
- `k8s/backend-deploy.yaml` - Backend deployment configuration
- `k8s/frontend-deploy.yaml` - Frontend deployment configuration  
- `k8s/backend-svc.yaml` - Backend service configuration
- `k8s/frontend-svc.yaml` - Frontend service configuration
- `k8s/hpa-backend.yaml` - Backend auto-scaling configuration
- `k8s/hpa-frontend.yaml` - Frontend auto-scaling configuration
- `k8s/pv-nfs.yaml` - Persistent volume configuration
- `k8s/pvc-nfs.yaml` - Volume claim configuration
- `docker/nginx.conf` - Nginx proxy configuration
- `frontend/config.js` - Frontend environment configuration

### Environment Variables
- **Backend**: `PYTHONUNBUFFERED`, `PORT`, `HOST`
- **Frontend**: Automatic environment detection
- **Nginx**: Worker processes and connections

---

## 🎯 Production Features

### ✅ Scalability
- Horizontal pod autoscaling based on metrics
- Load balancing across multiple replicas
- Resource requests and limits defined

### ✅ Reliability  
- Health check endpoints for monitoring
- Persistent data storage with NFS
- Graceful error handling and recovery

### ✅ Security
- Non-root container execution
- CORS policy configuration
- Rate limiting protection
- Security headers implementation

### ✅ Performance
- Nginx static file optimization
- Gzip compression enabled
- Efficient resource utilization
- Caching strategies implemented

---

This system provides a robust, scalable foundation for patient management with enterprise-grade deployment capabilities.
