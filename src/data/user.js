// Mock user data for the Profile screen and other member screens
export const currentUser = {
    _id: 'u1',
    name: 'John Doe',
    email: 'member@test.com',
    phone: '+1 234 567 890',
    address: '123 Main Street, Los Angeles, CA',
    role: 'member',
    status: 'active',
    profileImage: '',
    membership: {
        type: 'Premium',
        startDate: '2025-01-15',
        expiryDate: '2026-01-15',
        daysRemaining: 308,
        status: 'active',
    },
    profile: {
        age: 28,
        gender: 'Male',
        height: '180 cm',
        weight: '75 kg',
        bloodType: 'O+',
        allergies: 'None',
        conditions: 'None',
    },
    emergencyContact: {
        name: 'Jane Doe',
        relation: 'Spouse',
        phone: '+1 234 567 891',
    },
    branch: {
        name: 'Downtown Fitness Hub',
    },
    healthInfo: {
        height: '180',
        weight: '75',
        bloodType: 'O+',
        allergies: 'None',
    },
    stats: {
        totalSessions: 48,
        attendanceRate: 88,
        streak: 12,
    },
};

// Mock coach data for Coach screens
export const coachProfile = {
    id: 'c1',
    name: 'Coach Williams',
    email: 'coach@test.com',
    phone: '+1 234 567 892',
    specialization: 'Fitness & Strength Training',
    experience: '8 Years',
    rating: 4.8,
    bio: 'Certified fitness trainer with 8 years of experience in strength training, HIIT, and sports conditioning. Passionate about helping athletes achieve their peak performance.',
    totalStudents: 45,
    activeClasses: 6,
    certifications: [
        'NASM Certified Personal Trainer',
        'CrossFit Level 2 Trainer',
        'First Aid & CPR Certified',
        'Sports Nutrition Specialist',
    ],
    availability: {
        Monday: '6:00 AM - 8:00 PM',
        Tuesday: '6:00 AM - 8:00 PM',
        Wednesday: '6:00 AM - 6:00 PM',
        Thursday: '6:00 AM - 8:00 PM',
        Friday: '6:00 AM - 6:00 PM',
        Saturday: '8:00 AM - 2:00 PM',
        Sunday: 'Off',
    },
};