export const MOCK_HEALTH_RECORDS = [
    {
        _id: 'hr1',
        type: 'medical_certificate',
        description: 'Annual medical fitness certificate from Dr. Smith',
        status: 'approved',
        documentUrl: 'https://example.com/docs/medical-cert.pdf',
        fileName: 'medical_certificate_2026.pdf',
        expiryDate: '2027-03-15',
        createdAt: '2026-03-01',
    },
    {
        _id: 'hr2',
        type: 'fitness_assessment',
        description: 'Quarterly fitness assessment report',
        status: 'pending',
        documentUrl: 'https://example.com/docs/fitness-report.pdf',
        fileName: 'fitness_assessment_q1.pdf',
        expiryDate: '2026-06-30',
        createdAt: '2026-02-20',
    },
    {
        _id: 'hr3',
        type: 'vaccination_record',
        description: 'COVID-19 vaccination certificate',
        status: 'approved',
        documentUrl: '/images/COVID19Vaccination.jpg',
        fileName: '/images/COVID19Vaccination.jpg',
        expiryDate: null,
        createdAt: '2025-06-10',
    },
    {
        _id: 'hr4',
        type: 'insurance',
        description: 'Sports injury insurance policy document',
        status: 'expired',
        documentUrl: 'https://example.com/docs/insurance.pdf',
        fileName: 'insurance_policy.pdf',
        expiryDate: '2026-01-31',
        createdAt: '2025-02-01',
    },
];

export const MOCK_WAIVER_DATA = {
    hasAcknowledged: false,
    waivers: [],
};

export const MOCK_WAIVER_DATA_SIGNED = {
    hasAcknowledged: true,
    waivers: [
        {
            waiverId: 'standard-waiver-v2',
            signature: 'acknowledged',
            acknowledgedAt: '2026-02-15T10:30:00Z',
        },
    ],
};

export const DOCUMENT_TYPES = [
    { value: 'medical_certificate', label: 'Medical Certificate', icon: 'file-document' },
    { value: 'fitness_assessment', label: 'Fitness Assessment', icon: 'chart-line' },
    { value: 'vaccination_record', label: 'Vaccination Record', icon: 'needle' },
    { value: 'insurance', label: 'Insurance Document', icon: 'shield-check' },
    { value: 'other', label: 'Other', icon: 'file-plus' },
];