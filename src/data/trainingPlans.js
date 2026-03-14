// Training Plans mock data for coach portal
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const PLAN_STATUSES = ['draft', 'active', 'completed', 'cancelled'];

let nextPlanId = 200;
export const generatePlanId = () => {
    nextPlanId += 1;
    return `tp_${nextPlanId}`;
};

export const trainingPlans = [
    {
        _id: 'tp1',
        title: 'Karate Advanced Sparring',
        description: 'Focus on advanced sparring techniques and competition prep for green belt advancement.',
        sport: 'Karate',
        difficulty: 'Advanced',
        duration: 12,
        startDate: '2026-01-15',
        endDate: '2026-04-15',
        memberId: 'm1',
        memberName: 'John Smith',
        status: 'active',
        goals: ['Improve sparring', 'Competition readiness', 'Speed training'],
        exercises: [
            { name: 'Roundhouse Kick Drills', description: 'Practice roundhouse kicks on pads', sets: 4, reps: 10, duration: 15, restTime: 60, notes: 'Focus on form' },
            { name: 'Sparring Combos', description: 'Light contact sparring combinations', sets: 3, reps: 8, duration: 20, restTime: 90, notes: 'Light contact' },
            { name: 'Speed Bag', description: 'Speed bag training for hand speed', sets: 3, reps: 60, duration: 5, restTime: 30, notes: '60 seconds each' },
        ],
        schedule: [
            { day: 'Monday', exercises: ['Roundhouse Kick Drills', 'Speed Bag'], notes: 'Focus on technique' },
            { day: 'Wednesday', exercises: ['Sparring Combos', 'Speed Bag'], notes: 'Increase intensity' },
            { day: 'Friday', exercises: ['Roundhouse Kick Drills', 'Sparring Combos'], notes: 'Full session' },
        ],
        frequency: '3 times per week',
        dietRecommendation: { calories: 2200, protein: 130, carbs: 280, fat: 60, notes: 'High protein for muscle recovery' },
        specialConsiderations: ['Avoid heavy sparring before competitions'],
        stats: { progressPercentage: 65 },
    },
    {
        _id: 'tp3',
        title: 'Boxing Competition Prep',
        description: 'Intensive training for upcoming regional championship with focus on power and endurance.',
        sport: 'Boxing',
        difficulty: 'Advanced',
        duration: 16,
        startDate: '2026-02-01',
        endDate: '2026-05-25',
        memberId: 'm4',
        memberName: 'Jessica Wilson',
        status: 'active',
        goals: ['Speed & power', 'Defensive technique', 'Stamina'],
        exercises: [
            { name: 'Jab-Cross Combo', description: 'Basic jab-cross combination drills', sets: 5, reps: 20, duration: 10, restTime: 45, notes: 'Full speed' },
            { name: 'Heavy Bag Rounds', description: 'Heavy bag work in timed rounds', sets: 6, reps: 1, duration: 3, restTime: 60, notes: '3 min rounds' },
            { name: 'Shadow Boxing', description: 'Shadow boxing for form and footwork', sets: 4, reps: 1, duration: 2, restTime: 30, notes: '2 min rounds' },
            { name: 'Jump Rope', description: 'Cardio conditioning with jump rope', sets: 3, reps: 1, duration: 5, restTime: 60, notes: '5 min each' },
        ],
        schedule: [
            { day: 'Monday', exercises: ['Jab-Cross Combo', 'Heavy Bag Rounds'], notes: 'Power day' },
            { day: 'Tuesday', exercises: ['Shadow Boxing', 'Jump Rope'], notes: 'Cardio day' },
            { day: 'Thursday', exercises: ['Jab-Cross Combo', 'Shadow Boxing', 'Heavy Bag Rounds'], notes: 'Full session' },
            { day: 'Saturday', exercises: ['Heavy Bag Rounds', 'Jump Rope'], notes: 'Endurance day' },
        ],
        frequency: '4 times per week',
        dietRecommendation: { calories: 2500, protein: 150, carbs: 300, fat: 70, notes: 'Increase carbs on training days' },
        specialConsiderations: ['Previous wrist sprain - wrap wrists before training', 'Hydration focus'],
        stats: { progressPercentage: 40 },
    },
    {
        _id: 'tp4',
        title: 'Shoulder Rehab & Strength',
        description: 'Gradual return to full lifting capacity post-shoulder rehab with progressive overload.',
        sport: 'Weightlifting',
        difficulty: 'Intermediate',
        duration: 10,
        startDate: '2026-01-20',
        endDate: '2026-04-01',
        memberId: 'm5',
        memberName: 'David Martinez',
        status: 'active',
        goals: ['Shoulder mobility', 'Progressive overload', 'Pain-free lifting'],
        exercises: [
            { name: 'Band Pull-Aparts', description: 'Resistance band pull-aparts for shoulder health', sets: 3, reps: 15, duration: 5, restTime: 30, notes: 'Light resistance' },
            { name: 'Face Pulls', description: 'Cable face pulls for rear delts', sets: 3, reps: 12, duration: 5, restTime: 45, notes: 'Slow and controlled' },
            { name: 'Dumbbell Press', description: 'Light dumbbell shoulder press', sets: 3, reps: 10, duration: 8, restTime: 60, notes: 'Light weight only' },
        ],
        schedule: [
            { day: 'Monday', exercises: ['Band Pull-Aparts', 'Face Pulls'], notes: 'Rehab focus' },
            { day: 'Wednesday', exercises: ['Band Pull-Aparts', 'Face Pulls', 'Dumbbell Press'], notes: 'Add pressing' },
            { day: 'Friday', exercises: ['Face Pulls', 'Dumbbell Press'], notes: 'Strength focus' },
        ],
        frequency: '3 times per week',
        dietRecommendation: { calories: 2800, protein: 160, carbs: 320, fat: 80, notes: 'Anti-inflammatory foods recommended' },
        specialConsiderations: ['Avoid overhead pressing above 80% 1RM', 'Stop if sharp pain occurs', 'Ice after sessions'],
        stats: { progressPercentage: 55 },
    },
    {
        _id: 'tp5',
        title: 'Beginner Swimming Program',
        description: 'Introduction to swimming techniques focusing on freestyle and breathing.',
        sport: 'Swimming',
        difficulty: 'Beginner',
        duration: 8,
        startDate: '2026-03-01',
        endDate: '2026-04-26',
        memberId: 'm3',
        memberName: 'Michael Brown',
        status: 'draft',
        goals: ['Learn freestyle', 'Improve breathing', 'Build endurance'],
        exercises: [
            { name: 'Freestyle Laps', description: 'Basic freestyle swimming laps', sets: 4, reps: 2, duration: 10, restTime: 60, notes: '50m each' },
            { name: 'Breathing Drills', description: 'Bilateral breathing practice', sets: 3, reps: 4, duration: 8, restTime: 45, notes: '25m each' },
        ],
        schedule: [
            { day: 'Tuesday', exercises: ['Freestyle Laps', 'Breathing Drills'], notes: 'Technique focus' },
            { day: 'Thursday', exercises: ['Freestyle Laps'], notes: 'Endurance build' },
        ],
        frequency: '2 times per week',
        dietRecommendation: { calories: 2000, protein: 100, carbs: 250, fat: 55, notes: 'Stay hydrated' },
        specialConsiderations: ['Has mild asthma - keep inhaler nearby', 'Avoid high-intensity without warm-up'],
        stats: { progressPercentage: 10 },
    },
];