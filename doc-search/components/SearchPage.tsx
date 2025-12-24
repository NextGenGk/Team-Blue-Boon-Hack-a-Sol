'use client'

import { useState, useEffect } from 'react'
import styles from './SearchPage.module.css'

interface Doctor {
    id: string
    name: string
    specialization: string
    qualification: string
    experience: number
    consultationFee: number
    bio: string
    clinicName: string
    location: string | null
    languages: string[]
    verified: boolean
    profileImage: string
    relevanceScore: number
}

interface SearchCriteria {
    specialization: string
    symptoms: string[]
    urgency: string
    preferredMode: string
    searchKeywords: string[]
    explanation: string
}

interface SearchResponse {
    success: boolean
    query: string
    searchCriteria: SearchCriteria
    results: Doctor[]
    count: number
    message: string
}

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<Doctor[]>([])
    const [searchInfo, setSearchInfo] = useState<SearchResponse | null>(null)
    const [specializations, setSpecializations] = useState<any[]>([])
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        loadSpecializations()
    }, [])

    const loadSpecializations = async () => {
        try {
            const response = await fetch('/api/specializations')
            const data = await response.json()
            if (data.success) {
                setSpecializations(data.specializations)
            }
        } catch (error) {
            console.error('Error loading specializations:', error)
        }
    }

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            alert('Please enter a search query')
            return
        }

        setLoading(true)
        setShowResults(true)

        try {
            const response = await fetch('/api/search-doctors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            })

            const data: SearchResponse = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Search failed')
            }

            setSearchInfo(data)
            setResults(data.results)
        } catch (error: any) {
            console.error('Search error:', error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getUrgencyColor = (urgency: string) => {
        const colors: Record<string, string> = {
            low: '#4facfe',
            medium: '#f093fb',
            high: '#f5576c'
        }
        return colors[urgency] || '#b4b4c8'
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="12" fill="url(#gradient)" />
                                <path d="M20 10L25 15L20 20L15 15L20 10Z" fill="white" />
                                <path d="M20 20L25 25L20 30L15 25L20 20Z" fill="white" opacity="0.7" />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1>AyurSutra</h1>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgeIcon}>🤖</span>
                        <span>AI-Powered Search</span>
                    </div>
                    <h2 className={styles.heroTitle}>Find Your Perfect Doctor</h2>
                    <p className={styles.heroSubtitle}>
                        Describe your symptoms or health concerns in natural language. Our AI will find the right specialist for you.
                    </p>

                    {/* Search Box */}
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBox}>
                            <svg className={styles.searchIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="e.g., I have chest pain and breathing issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                            />
                            <button
                                className={styles.searchBtn}
                                onClick={() => handleSearch(searchQuery)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className={styles.btnLoader}>
                                        <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24">
                                            <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3"></circle>
                                        </svg>
                                    </span>
                                ) : (
                                    <span>Search</span>
                                )}
                            </button>
                        </div>

                        {/* Quick Suggestions */}
                        <div className={styles.suggestions}>
                            <span className={styles.suggestionLabel}>Try:</span>
                            {[
                                'I have chest pain and breathing issues',
                                'Looking for skin doctor for acne treatment',
                                'Need diabetes checkup and management',
                                'Pregnancy checkup and consultation'
                            ].map((suggestion, index) => (
                                <button
                                    key={index}
                                    className={styles.suggestionChip}
                                    onClick={() => {
                                        setSearchQuery(suggestion)
                                        handleSearch(suggestion)
                                    }}
                                >
                                    {suggestion.split(' ').slice(0, 3).join(' ')}...
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Results */}
            {showResults && (
                <section className={styles.resultsSection}>
                    {searchInfo && (
                        <div className={styles.searchInfo}>
                            <h3>🔍 Search Results for: "{searchInfo.query}"</h3>
                            <p>
                                <strong>AI Understanding:</strong> {searchInfo.searchCriteria.explanation}
                                <br />
                                <strong>Specialization:</strong> {searchInfo.searchCriteria.specialization}
                                {searchInfo.searchCriteria.urgency && (
                                    <>
                                        <br />
                                        <strong>Urgency:</strong>{' '}
                                        <span style={{ color: getUrgencyColor(searchInfo.searchCriteria.urgency) }}>
                                            {searchInfo.searchCriteria.urgency.toUpperCase()}
                                        </span>
                                    </>
                                )}
                                <br />
                                <strong>Found:</strong> {searchInfo.count} doctor(s)
                            </p>
                        </div>
                    )}

                    {results.length > 0 ? (
                        <div className={styles.resultsGrid}>
                            {results.map((doctor) => (
                                <div key={doctor.id} className={styles.doctorCard}>
                                    <div className={styles.doctorHeader}>
                                        <img
                                            src={doctor.profileImage || 'https://i.pravatar.cc/150?img=1'}
                                            alt={doctor.name}
                                            className={styles.doctorAvatar}
                                        />
                                        <div className={styles.doctorInfo}>
                                            <div className={styles.doctorName}>
                                                {doctor.name}
                                                {doctor.verified && <span className={styles.verifiedBadge} title="Verified">✓</span>}
                                            </div>
                                            <div className={styles.doctorSpecialization}>{doctor.specialization}</div>
                                            <div className={styles.doctorExperience}>{doctor.experience}+ years experience</div>
                                        </div>
                                    </div>

                                    {doctor.bio && <p className={styles.doctorBio}>{doctor.bio}</p>}

                                    <div className={styles.doctorDetails}>
                                        {doctor.location && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailIcon}>📍</span>
                                                <span>{doctor.location}</span>
                                            </div>
                                        )}
                                        {doctor.languages && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailIcon}>🗣️</span>
                                                <span>{doctor.languages.join(', ')}</span>
                                            </div>
                                        )}
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>🎓</span>
                                            <span>{doctor.qualification}</span>
                                        </div>
                                    </div>

                                    <div className={styles.doctorFooter}>
                                        <div className={styles.consultationFee}>₹{doctor.consultationFee}</div>
                                        <button className={styles.bookBtn}>Book Now</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <div className={styles.noResultsIcon}>🔍</div>
                            <h3>No doctors found</h3>
                            <p>Try adjusting your search terms or browse our specializations</p>
                        </div>
                    )}
                </section>
            )}

            {/* Specializations */}
            {!showResults && specializations.length > 0 && (
                <section className={styles.specializationsSection}>
                    <h2 className={styles.sectionTitle}>Browse by Specialization</h2>
                    <div className={styles.specializationsGrid}>
                        {specializations.map((spec, index) => (
                            <div
                                key={index}
                                className={styles.specializationCard}
                                onClick={() => {
                                    const query = `I need a ${spec.specialization} specialist`
                                    setSearchQuery(query)
                                    handleSearch(query)
                                }}
                            >
                                <h3>{spec.specialization}</h3>
                                <p>{spec.doctor_count} doctor(s)</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Features */}
            <section className={styles.featuresSection}>
                <h2 className={styles.sectionTitle}>Why Choose AyurSutra?</h2>
                <div className={styles.featuresGrid}>
                    {[
                        { icon: '🤖', title: 'AI-Powered Search', desc: 'Describe your symptoms naturally. Our AI understands and finds the right specialist.' },
                        { icon: '✅', title: 'Verified Doctors', desc: 'All doctors are verified professionals with proven qualifications and experience.' },
                        { icon: '💊', title: 'AI Prescriptions', desc: 'Get AI-generated prescriptions reviewed by qualified doctors for accuracy.' },
                        { icon: '🌐', title: 'Online & Offline', desc: 'Choose between video consultations or in-person visits at the clinic.' }
                    ].map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>&copy; 2024 AyurSutra. AI-Powered Healthcare Platform.</p>
            </footer>
        </div>
    )
}
