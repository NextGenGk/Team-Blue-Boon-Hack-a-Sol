// API Base URL
const API_BASE_URL = window.location.origin;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const searchInfo = document.getElementById('searchInfo');
const noResults = document.getElementById('noResults');
const specializationsGrid = document.getElementById('specializationsGrid');
const specializationsSection = document.getElementById('specializationsSection');

// State
let currentSearchQuery = '';

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

async function searchDoctors(query) {
    if (!query || query.trim() === '') {
        alert('Please enter a search query');
        return;
    }

    currentSearchQuery = query;

    // Update UI - Show loading
    setLoadingState(true);
    hideSpecializations();
    showResultsSection();

    try {
        const response = await fetch(`${API_BASE_URL}/api/search-doctors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Search failed');
        }

        console.log('Search results:', data);

        // Display results
        displaySearchInfo(data);
        displayResults(data.results);

    } catch (error) {
        console.error('Search error:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

function displaySearchInfo(data) {
    const { searchCriteria, count, query } = data;

    searchInfo.innerHTML = `
        <h3>🔍 Search Results for: "${query}"</h3>
        <p>
            <strong>AI Understanding:</strong> ${searchCriteria.explanation || 'Searching for relevant doctors'}
            <br>
            <strong>Specialization:</strong> ${searchCriteria.specialization || 'Any'}
            ${searchCriteria.urgency ? `<br><strong>Urgency:</strong> <span style="color: ${getUrgencyColor(searchCriteria.urgency)}">${searchCriteria.urgency.toUpperCase()}</span>` : ''}
            <br>
            <strong>Found:</strong> ${count} doctor(s)
        </p>
    `;
}

function displayResults(doctors) {
    if (!doctors || doctors.length === 0) {
        resultsGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    resultsGrid.style.display = 'grid';
    noResults.style.display = 'none';

    resultsGrid.innerHTML = doctors.map(doctor => createDoctorCard(doctor)).join('');
}

function createDoctorCard(doctor) {
    const languages = doctor.languages ? doctor.languages.join(', ') : 'English';
    const location = doctor.location || 'Location not specified';

    return `
        <div class="doctor-card" onclick="viewDoctorDetails('${doctor.id}')">
            <div class="doctor-header">
                <img 
                    src="${doctor.profileImage || 'https://i.pravatar.cc/150?img=1'}" 
                    alt="${doctor.name}"
                    class="doctor-avatar"
                    onerror="this.src='https://i.pravatar.cc/150?img=1'"
                >
                <div class="doctor-info">
                    <div class="doctor-name">
                        ${doctor.name}
                        ${doctor.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}
                    </div>
                    <div class="doctor-specialization">${doctor.specialization}</div>
                    <div class="doctor-experience">${doctor.experience || 0}+ years experience</div>
                </div>
            </div>
            
            ${doctor.bio ? `<p class="doctor-bio">${doctor.bio}</p>` : ''}
            
            <div class="doctor-details">
                <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span>${location}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🗣️</span>
                    <span>${languages}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🎓</span>
                    <span>${doctor.qualification}</span>
                </div>
            </div>
            
            <div class="doctor-footer">
                <div class="consultation-fee">₹${doctor.consultationFee}</div>
                <button class="book-btn" onclick="event.stopPropagation(); bookAppointment('${doctor.id}')">
                    Book Now
                </button>
            </div>
        </div>
    `;
}

// ============================================
// SPECIALIZATIONS
// ============================================

async function loadSpecializations() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/specializations`);
        const data = await response.json();

        if (data.success && data.specializations) {
            displaySpecializations(data.specializations);
        }
    } catch (error) {
        console.error('Error loading specializations:', error);
    }
}

function displaySpecializations(specializations) {
    specializationsGrid.innerHTML = specializations.map(spec => `
        <div class="specialization-card" onclick="searchBySpecialization('${spec.specialization}')">
            <h3>${spec.specialization}</h3>
            <p>${spec.doctor_count} doctor(s)</p>
        </div>
    `).join('');
}

function searchBySpecialization(specialization) {
    searchInput.value = `I need a ${specialization} specialist`;
    searchDoctors(searchInput.value);
}

// ============================================
// UI HELPERS
// ============================================

function setLoadingState(isLoading) {
    const btnText = searchBtn.querySelector('.btn-text');
    const btnLoader = searchBtn.querySelector('.btn-loader');

    searchBtn.disabled = isLoading;

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showResultsSection() {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideSpecializations() {
    specializationsSection.style.display = 'none';
}

function showSpecializations() {
    specializationsSection.style.display = 'block';
}

function showError(message) {
    searchInfo.innerHTML = `
        <h3 style="color: #f5576c;">❌ Error</h3>
        <p>${message}</p>
    `;
    resultsGrid.style.display = 'none';
    noResults.style.display = 'block';
}

function getUrgencyColor(urgency) {
    const colors = {
        low: '#4facfe',
        medium: '#f093fb',
        high: '#f5576c'
    };
    return colors[urgency] || '#b4b4c8';
}

// ============================================
// ACTIONS
// ============================================

function viewDoctorDetails(doctorId) {
    console.log('View doctor details:', doctorId);
    // TODO: Implement doctor details modal or page
    alert(`Doctor details for ID: ${doctorId}\n\nThis would open a detailed view with:\n- Full profile\n- Available slots\n- Reviews\n- Book appointment form`);
}

function bookAppointment(doctorId) {
    console.log('Book appointment with doctor:', doctorId);
    // TODO: Implement booking flow
    alert(`Booking appointment with doctor ID: ${doctorId}\n\nThis would open a booking form with:\n- Date/time selection\n- Online/Offline mode\n- Payment integration`);
}

// ============================================
// EVENT LISTENERS
// ============================================

searchBtn.addEventListener('click', () => {
    searchDoctors(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchDoctors(searchInput.value);
    }
});

// Suggestion chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        searchInput.value = query;
        searchDoctors(query);
    });
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 AyurSutra Doctor Search initialized');
    loadSpecializations();

    // Focus search input
    searchInput.focus();
});
