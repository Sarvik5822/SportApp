export const CATEGORIES = [
    { key: 'facility', label: 'Facility', icon: 'office-building' },
    { key: 'coach', label: 'Coach', icon: 'account-tie' },
    { key: 'service', label: 'Service', icon: 'room-service' },
    { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
    { key: 'equipment', label: 'Equipment', icon: 'dumbbell' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal-circle' },
];

export const DROPDOWN_CATEGORIES = ['coach', 'facility'];
export const TEXT_TARGET_CATEGORIES = ['service', 'cleanliness', 'equipment'];

export const TARGET_PLACEHOLDERS = {
    service: 'e.g., Front desk service, Locker room service...',
    cleanliness: 'e.g., Gym floor, Washroom, Pool area...',
    equipment: 'e.g., Treadmill #3, Dumbbells, Yoga mats...',
};

export const MOCK_TARGETS = {
    coach: [
        { _id: 'c1', name: 'Coach Rajesh Kumar', detail: 'Cricket & Fitness' },
        { _id: 'c2', name: 'Coach Priya Sharma', detail: 'Yoga & Meditation' },
        { _id: 'c3', name: 'Coach Amit Patel', detail: 'Swimming' },
    ],
    facility: [
        { _id: 'f1', name: 'Main Gym', detail: 'Ground Floor' },
        { _id: 'f2', name: 'Swimming Pool', detail: 'Block B' },
        { _id: 'f3', name: 'Tennis Court A', detail: 'Outdoor' },
        { _id: 'f4', name: 'Yoga Studio', detail: 'First Floor' },
        { _id: 'f5', name: 'Basketball Court', detail: 'Outdoor' },
    ],
};

export const MOCK_FEEDBACK_STATS = {
    total: 12,
    averageRating: 4.2,
    pending: 3,
    resolved: 7,
    reviewed: 2,
};

export const MOCK_MY_FEEDBACK = [
    {
        _id: 'fb1',
        category: 'facility',
        rating: 5,
        subject: 'Excellent Gym Equipment',
        message:
            'The new treadmills and ellipticals are fantastic! Great upgrade from the old ones. The gym feels much more modern now.',
        status: 'resolved',
        targetName: 'Main Gym',
        createdAt: '2026-03-10T09:30:00Z',
        adminResponse:
            'Thank you for your positive feedback! We are glad you are enjoying the new equipment. We plan to add more machines next month.',
        respondedBy: { name: 'Admin Rahul' },
    },
    {
        _id: 'fb2',
        category: 'coach',
        rating: 5,
        subject: 'Amazing Yoga Sessions',
        message:
            'Coach Priya is an excellent instructor. Her sessions are well-structured and she pays attention to each participant. Highly recommend her classes!',
        status: 'reviewed',
        targetName: 'Coach Priya Sharma',
        createdAt: '2026-03-05T14:00:00Z',
        adminResponse: null,
    },
    {
        _id: 'fb3',
        category: 'cleanliness',
        rating: 2,
        subject: 'Washroom Needs Attention',
        message:
            'The washroom near the swimming pool area has not been cleaned properly for the past few days. The floor is slippery and soap dispensers are empty.',
        status: 'pending',
        targetName: 'Pool area washroom',
        createdAt: '2026-03-08T16:45:00Z',
        adminResponse: null,
    },
    {
        _id: 'fb4',
        category: 'equipment',
        rating: 3,
        subject: 'Treadmill #3 Making Noise',
        message:
            'Treadmill #3 in the main gym has been making a grinding noise when running at speeds above 8 km/h. It might need maintenance or belt replacement.',
        status: 'resolved',
        targetName: 'Treadmill #3',
        createdAt: '2026-02-28T11:20:00Z',
        adminResponse:
            'Thank you for reporting this. Our maintenance team has fixed the treadmill. The belt has been replaced and it should be working smoothly now.',
        respondedBy: { name: 'Maintenance Head' },
    },
    {
        _id: 'fb5',
        category: 'service',
        rating: 4,
        subject: 'Good Front Desk Service',
        message:
            'The front desk staff is always helpful and welcoming. Quick check-in process. Only suggestion would be to extend the reception hours on weekends.',
        status: 'reviewed',
        targetName: 'Front desk service',
        createdAt: '2026-02-20T08:15:00Z',
        adminResponse:
            'We appreciate your kind words! We are considering extending weekend hours and will update members soon.',
        respondedBy: { name: 'Club Manager' },
    },
    {
        _id: 'fb6',
        category: 'other',
        rating: 4,
        subject: 'Parking Space Suggestion',
        message:
            'It would be great if the club could allocate more parking spaces for members. During peak hours (6-8 PM), finding parking is quite difficult.',
        status: 'pending',
        targetName: '',
        createdAt: '2026-02-15T18:30:00Z',
        adminResponse: null,
    },
    {
        _id: 'fb7',
        category: 'facility',
        rating: 1,
        subject: 'AC Not Working in Yoga Studio',
        message:
            'The air conditioning in the Yoga Studio has not been working for the past 3 days. It becomes very uncomfortable during sessions, especially in the afternoon.',
        status: 'pending',
        targetName: 'Yoga Studio',
        createdAt: '2026-03-12T10:00:00Z',
        adminResponse: null,
    },
];