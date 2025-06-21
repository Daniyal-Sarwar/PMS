// API Configuration - will be set from config.js
let API_BASE_URL = 'http://localhost:8000'; // fallback default

// Global state
let allPatients = {};
let currentPatient = null;

// DOM Elements
const elements = {
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    successMessage: document.getElementById('success-message'),
    errorText: document.getElementById('error-text'),
    successText: document.getElementById('success-text'),
    patientsGrid: document.getElementById('patients-grid'),
    patientForm: document.getElementById('patient-form'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    searchResults: document.getElementById('search-results'),
    sortField: document.getElementById('sort-field'),
    sortOrder: document.getElementById('sort-order'),
    sortBtn: document.getElementById('sort-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    patientModal: document.getElementById('patient-modal'),
    editModal: document.getElementById('edit-modal'),
    patientDetails: document.getElementById('patient-details'),
    editPatientForm: document.getElementById('edit-patient-form'),
    editPatientId: document.getElementById('edit-patient-id')
};

// Utility Functions
const showLoading = () => elements.loading.classList.remove('hidden');
const hideLoading = () => elements.loading.classList.add('hidden');

const showError = (message) => {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    setTimeout(() => elements.errorMessage.classList.add('hidden'), 5000);
};

const showSuccess = (message) => {
    elements.successText.textContent = message;
    elements.successMessage.classList.remove('hidden');
    setTimeout(() => elements.successMessage.classList.add('hidden'), 3000);
};

const hideMessages = () => {
    elements.errorMessage.classList.add('hidden');
    elements.successMessage.classList.add('hidden');
};

// API Functions
const api = {
    async getAllPatients() {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw new Error('Failed to fetch patients. Please check if the backend server is running.');
        }
    },

    async getPatient(patientId) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw new Error('Failed to fetch patient details.');
        }
    },

    async createPatient(patientData) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating patient:', error);
            throw error;
        }
    },

    async updatePatient(patientId, patientData) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating patient:', error);
            throw error;
        }
    },

    async deletePatient(patientId) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    },

    async searchPatients(name) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/search/?name=${encodeURIComponent(name)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching patients:', error);
            throw error;
        }
    },

    async sortPatients(field, order) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients/sort/?sort=${field}&order=${order}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error sorting patients:', error);
            throw error;
        }
    }
};

// UI Rendering Functions
const renderPatientCard = (patient) => {
    const verdictClass = `verdict-${patient.verdict.toLowerCase()}`;
    return `
        <div class="patient-card" onclick="showPatientDetails('${patient.patient_id}')">
            <div class="patient-header">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-id">${patient.patient_id}</div>
            </div>
            <div class="patient-info">
                <div class="patient-detail"><strong>Age:</strong> ${patient.age} years</div>
                <div class="patient-detail"><strong>Gender:</strong> ${patient.gender}</div>
                <div class="patient-detail"><strong>Height:</strong> ${patient.height} cm</div>
                <div class="patient-detail"><strong>Weight:</strong> ${patient.weight} kg</div>
                <div class="patient-detail"><strong>City:</strong> ${patient.city}</div>
            </div>
            <div class="patient-bmi ${verdictClass}">
                <span>BMI: ${patient.bmi}</span>
                <span>${patient.verdict}</span>
            </div>
        </div>
    `;
};

const renderPatients = (patients) => {
    if (Array.isArray(patients)) {
        // Handle sorted/search results (array format)
        elements.patientsGrid.innerHTML = patients.map(renderPatientCard).join('');
    } else {
        // Handle regular patient data (object format)
        const patientCards = Object.values(patients).map(renderPatientCard).join('');
        elements.patientsGrid.innerHTML = patientCards;
    }
};

const renderPatientDetails = (patient) => {
    const verdictClass = `verdict-${patient.verdict.toLowerCase()}`;
    return `
        <div class="patient-details-grid">
            <div class="detail-item">
                <div class="detail-label">Patient ID</div>
                <div class="detail-value">${patient.patient_id}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Name</div>
                <div class="detail-value">${patient.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Age</div>
                <div class="detail-value">${patient.age} years</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Gender</div>
                <div class="detail-value">${patient.gender}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Height</div>
                <div class="detail-value">${patient.height} cm</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Weight</div>
                <div class="detail-value">${patient.weight} kg</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">City</div>
                <div class="detail-value">${patient.city}</div>
            </div>
            <div class="detail-item ${verdictClass}">
                <div class="detail-label">BMI</div>
                <div class="detail-value">${patient.bmi}</div>
            </div>
            <div class="detail-item ${verdictClass}" style="grid-column: 1 / -1;">
                <div class="detail-label">Health Status</div>
                <div class="detail-value">${patient.verdict}</div>
            </div>
        </div>
    `;
};

// Dashboard Functions
const updateDashboardStats = (patients) => {
    const patientArray = Object.values(patients);
    const totalPatients = patientArray.length;
    const healthyPatients = patientArray.filter(p => p.verdict === 'Healthy').length;
    const avgBmi = totalPatients > 0 ? 
        (patientArray.reduce((sum, p) => sum + p.bmi, 0) / totalPatients).toFixed(1) : 0;
    const uniqueCities = new Set(patientArray.map(p => p.city)).size;

    document.getElementById('total-patients').textContent = totalPatients;
    document.getElementById('healthy-patients').textContent = healthyPatients;
    document.getElementById('avg-bmi').textContent = avgBmi;
    document.getElementById('cities-count').textContent = uniqueCities;

    updateGenderStats(patientArray);
    updateBMIChart(patientArray);
};

const updateGenderStats = (patients) => {
    const genderStats = patients.reduce((stats, patient) => {
        stats[patient.gender] = (stats[patient.gender] || 0) + 1;
        return stats;
    }, {});

    const genderStatsHTML = Object.entries(genderStats).map(([gender, count]) => `
        <div class="gender-stat">
            <span class="gender-label">
                <i class="fas fa-${gender === 'Male' ? 'mars' : gender === 'Female' ? 'venus' : 'genderless'}"></i>
                ${gender}
            </span>
            <span class="gender-count">${count}</span>
        </div>
    `).join('');

    document.getElementById('gender-stats').innerHTML = genderStatsHTML;
};

const updateBMIChart = (patients) => {
    const canvas = document.getElementById('bmiCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const bmiCategories = {
        'Underweight': patients.filter(p => p.verdict === 'Underweight').length,
        'Healthy': patients.filter(p => p.verdict === 'Healthy').length,
        'Overweight': patients.filter(p => p.verdict === 'Overweight').length,
        'Obese': patients.filter(p => p.verdict === 'Obese').length
    };
    
    const colors = ['#3498db', '#27ae60', '#f39c12', '#e74c3c'];
    const total = Object.values(bmiCategories).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const barWidth = canvas.width / Object.keys(bmiCategories).length;
    const maxCount = Math.max(...Object.values(bmiCategories));
    
    Object.entries(bmiCategories).forEach(([category, count], index) => {
        const barHeight = (count / maxCount) * (canvas.height - 40);
        const x = index * barWidth + 10;
        const y = canvas.height - barHeight - 20;
        
        // Draw bar
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth - 20, barHeight);
        
        // Draw count on top of bar
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(count, x + (barWidth - 20) / 2, y - 5);
        
        // Draw category label
        ctx.save();
        ctx.translate(x + (barWidth - 20) / 2, canvas.height - 5);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(category, 0, 0);
        ctx.restore();
    });
};

// Event Handlers
const handleTabSwitch = (e) => {
    const targetTab = e.target.dataset.tab;
    
    // Update active tab
    elements.tabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    
    // Update active content
    elements.tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(targetTab).classList.add('active');
    
    // Load data if needed
    if (targetTab === 'patients' || targetTab === 'dashboard') {
        loadPatients();
    }
};

const handlePatientFormSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const patientData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        height: parseFloat(formData.get('height')),
        weight: parseFloat(formData.get('weight')),
        city: formData.get('city'),
        gender: formData.get('gender')
    };
    
    try {
        showLoading();
        const result = await api.createPatient(patientData);
        showSuccess(`Patient created successfully with ID: ${result.patient_id}`);
        e.target.reset();
        // Refresh patients list
        await loadPatients();
        // Switch to patients tab
        document.querySelector('[data-tab="patients"]').click();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
};

const handleSearch = async () => {
    const searchTerm = elements.searchInput.value.trim();
    if (!searchTerm) {
        showError('Please enter a search term');
        return;
    }
    
    try {
        showLoading();
        const results = await api.searchPatients(searchTerm);
        if (results.length === 0) {
            elements.searchResults.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No patients found matching your search.</p>';
        } else {
            elements.searchResults.innerHTML = `
                <h3 style="margin-bottom: 20px; color: #2c3e50;">Search Results (${results.length} found)</h3>
                <div class="patients-grid">
                    ${results.map(renderPatientCard).join('')}
                </div>
            `;
        }
    } catch (error) {
        showError(error.message);
        elements.searchResults.innerHTML = '';
    } finally {
        hideLoading();
    }
};

const handleSort = async () => {
    const field = elements.sortField.value;
    const order = elements.sortOrder.value;
    
    if (!field) {
        showError('Please select a field to sort by');
        return;
    }
    
    try {
        showLoading();
        const sortedPatients = await api.sortPatients(field, order);
        renderPatients(sortedPatients);
        showSuccess(`Patients sorted by ${field} in ${order}ending order`);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
};

const showPatientDetails = async (patientId) => {
    try {
        showLoading();
        const patient = await api.getPatient(patientId);
        currentPatient = patient;
        elements.patientDetails.innerHTML = renderPatientDetails(patient);
        elements.patientModal.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
};

const handleEditPatient = () => {
    if (!currentPatient) return;
    
    // Populate edit form
    document.getElementById('edit-patient-id').value = currentPatient.patient_id;
    document.getElementById('edit-name').value = currentPatient.name;
    document.getElementById('edit-age').value = currentPatient.age;
    document.getElementById('edit-height').value = currentPatient.height;
    document.getElementById('edit-weight').value = currentPatient.weight;
    document.getElementById('edit-city').value = currentPatient.city;
    document.getElementById('edit-gender').value = currentPatient.gender;
    
    // Show edit modal
    elements.patientModal.classList.add('hidden');
    elements.editModal.classList.remove('hidden');
};

const handleSaveEdit = async () => {
    const patientId = document.getElementById('edit-patient-id').value;
    const formData = new FormData(elements.editPatientForm);
    
    const updateData = {};
    for (const [key, value] of formData.entries()) {
        if (value.trim()) {
            if (key === 'age') {
                updateData[key] = parseInt(value);
            } else if (key === 'height' || key === 'weight') {
                updateData[key] = parseFloat(value);
            } else {
                updateData[key] = value;
            }
        }
    }
    
    try {
        showLoading();
        await api.updatePatient(patientId, updateData);
        showSuccess('Patient updated successfully');
        elements.editModal.classList.add('hidden');
        await loadPatients();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
};

const handleDeletePatient = async () => {
    if (!currentPatient) return;
    
    if (confirm(`Are you sure you want to delete patient ${currentPatient.name} (${currentPatient.patient_id})?`)) {
        try {
            showLoading();
            await api.deletePatient(currentPatient.patient_id);
            showSuccess('Patient deleted successfully');
            elements.patientModal.classList.add('hidden');
            await loadPatients();
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }
};

// Main Functions
const loadPatients = async () => {
    try {
        showLoading();
        allPatients = await api.getAllPatients();
        renderPatients(allPatients);
        updateDashboardStats(allPatients);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
};

const initializeApp = () => {
    // Set API base URL from configuration
    if (window.APP_CONFIG) {
        API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
        console.log(`Using API base URL: ${API_BASE_URL}`);
    }
    
    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', handleTabSwitch);
    });
    
    // Form submission
    elements.patientForm.addEventListener('submit', handlePatientFormSubmit);
    
    // Search functionality
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Sort functionality
    elements.sortBtn.addEventListener('click', handleSort);
    
    // Refresh button
    elements.refreshBtn.addEventListener('click', loadPatients);
    
    // Modal controls
    document.getElementById('close-modal').addEventListener('click', () => {
        elements.patientModal.classList.add('hidden');
    });
    
    document.getElementById('close-edit-modal').addEventListener('click', () => {
        elements.editModal.classList.add('hidden');
    });
    
    document.getElementById('edit-patient-btn').addEventListener('click', handleEditPatient);
    document.getElementById('delete-patient-btn').addEventListener('click', handleDeletePatient);
    document.getElementById('save-edit-btn').addEventListener('click', handleSaveEdit);
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        elements.editModal.classList.add('hidden');
    });
    
    // Message close buttons
    document.getElementById('close-error').addEventListener('click', () => {
        elements.errorMessage.classList.add('hidden');
    });
    
    document.getElementById('close-success').addEventListener('click', () => {
        elements.successMessage.classList.add('hidden');
    });
    
    // Close modals when clicking outside
    elements.patientModal.addEventListener('click', (e) => {
        if (e.target === elements.patientModal) {
            elements.patientModal.classList.add('hidden');
        }
    });
    
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) {
            elements.editModal.classList.add('hidden');
        }
    });
    
    // Initial load
    loadPatients();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
