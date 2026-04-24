import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachProfile } from '../../data/user';
import { sessions } from '../../data/sessions';
import { members } from '../../data/members';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Constants ───
const REPORT_TYPES = [
    { key: 'member-progress', label: 'Member Progress', icon: 'account-arrow-up', color: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    { key: 'performance-summary', label: 'Performance Summary', icon: 'chart-bar', color: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'] },
    { key: 'attendance', label: 'Attendance Report', icon: 'clipboard-check-outline', color: '#22c55e', gradient: ['#22c55e', '#4ade80'] },
    { key: 'training-notes', label: 'Training Notes', icon: 'notebook-outline', color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] },
];

const TIME_PERIODS = [
    { key: 'week', label: 'This Week', icon: 'calendar-week' },
    { key: 'month', label: 'This Month', icon: 'calendar-month' },
    { key: 'quarter', label: 'This Quarter', icon: 'calendar-text' },
    { key: 'year', label: 'This Year', icon: 'calendar-star' },
];

const FORMATS = [
    { key: 'pdf', label: 'PDF', icon: 'file-pdf-box', color: '#dc2626', gradient: ['#dc2626', '#ef4444'] },
    { key: 'excel', label: 'Excel', icon: 'file-excel-box', color: '#16a34a', gradient: ['#16a34a', '#22c55e'] },
    { key: 'csv', label: 'CSV', icon: 'file-delimited-outline', color: '#2563eb', gradient: ['#2563eb', '#3b82f6'] },
];

const MOCK_RECENT_REPORTS = [
    { id: 'r1', name: 'January Member Progress Report', date: '2026-01-20', type: 'PDF', icon: 'file-pdf-box', iconColor: '#dc2626' },
    { id: 'r2', name: 'December Performance Summary', date: '2026-01-05', type: 'Excel', icon: 'file-excel-box', iconColor: '#16a34a' },
    { id: 'r3', name: 'Q4 2025 Training Analytics', date: '2025-12-31', type: 'PDF', icon: 'file-pdf-box', iconColor: '#dc2626' },
    { id: 'r4', name: 'November Attendance Report', date: '2025-11-30', type: 'CSV', icon: 'file-delimited-outline', iconColor: '#2563eb' },
];

// ─── Helpers ───
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#1e3a8a' }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View
                className="w-8 h-8 rounded-lg justify-center items-center mr-2.5"
                style={{ backgroundColor: `${iconColor}12` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {onViewAll && (
            <TouchableOpacity
                onPress={onViewAll}
                activeOpacity={0.7}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
                <Text className="text-blue-600 font-semibold text-xs">View All</Text>
                <Icon name="chevron-right" size={14} color="#2563eb" />
            </TouchableOpacity>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── CIRCULAR STAT COMPONENT ───
// ═══════════════════════════════════════════════
const CircularStat = ({ value, label, color, suffix = '' }) => {
    return (
        <View className="items-center flex-1">
            <View
                className="w-16 h-16 rounded-full justify-center items-center mb-2"
                style={{
                    backgroundColor: `${color}12`,
                    borderWidth: 3,
                    borderColor: `${color}30`,
                }}>
                <Text className="font-bold text-lg" style={{ color }}>
                    {value}{suffix}
                </Text>
            </View>
            <Text className="text-gray-500 text-[11px] text-center font-medium">{label}</Text>
        </View>
    );
};

// ═══════════════════════════════════════════════
// ─── RECENT REPORT ITEM ───
// ═══════════════════════════════════════════════
const RecentReportItem = ({ report, onExport }) => {
    const getTypeGradient = (type) => {
        switch (type) {
            case 'PDF': return ['#dc2626', '#ef4444'];
            case 'Excel': return ['#16a34a', '#22c55e'];
            case 'CSV': return ['#2563eb', '#3b82f6'];
            default: return ['#6b7280', '#9ca3af'];
        }
    };

    return (
        <TouchableOpacity
            onPress={() => onExport(report)}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            style={{
                elevation: 2,
                borderLeftWidth: 3,
                borderLeftColor: report.iconColor,
            }}>
            <View className="flex-row items-center">
                {/* File Icon */}
                <LinearGradient
                    colors={getTypeGradient(report.type)}
                    className="w-12 h-12 rounded-2xl justify-center items-center"
                    style={{ borderRadius: 14 }}>
                    <Icon name={report.icon} size={22} color="#fff" />
                </LinearGradient>

                {/* Report Info */}
                <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {report.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Icon name="clock-outline" size={12} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs ml-1">
                            {formatDate(report.date)}
                        </Text>
                    </View>
                </View>

                {/* Download Button */}
                <TouchableOpacity
                    onPress={() => onExport(report)}
                    activeOpacity={0.7}>
                    <LinearGradient
                        colors={getTypeGradient(report.type)}
                        style={{
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <Icon name="download" size={14} color="#fff" />
                        <Text className="text-white text-xs font-bold ml-1">
                            {report.type}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const CoachReportsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeThisMonth: 0,
        avgProgressRate: '0%',
        totalSessions: 0,
    });

    // Report generation selections
    const [selectedReportType, setSelectedReportType] = useState('');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('pdf');

    // Modals
    const [showReportTypeModal, setShowReportTypeModal] = useState(false);
    const [showTimePeriodModal, setShowTimePeriodModal] = useState(false);
    const [showFormatModal, setShowFormatModal] = useState(false);

    // ─── Data Fetching (Mock) ───
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));

            const coachMembers = members.filter(m => m.coachId === coachProfile.id || m.status === 'active');
            const totalSessions = sessions.length;
            const avgAttendance =
                coachMembers.length > 0
                    ? Math.round(
                        coachMembers.reduce((sum, m) => sum + (m.attendance || 0), 0) /
                        coachMembers.length,
                    )
                    : 0;

            setStats({
                totalMembers: coachMembers.length,
                activeThisMonth: Math.min(coachMembers.length, 3),
                avgProgressRate: `${avgAttendance}%`,
                totalSessions: totalSessions,
            });
        } catch (error) {
            // Silently handle error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    // ─── Handlers ───
    const handleGenerateReport = async () => {
        if (!selectedReportType || !selectedTimePeriod) {
            Alert.alert(
                'Missing Information',
                'Please select both a report type and time period before generating.',
                [{ text: 'OK' }],
            );
            return;
        }

        try {
            setGenerating(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const reportTypeLabel = REPORT_TYPES.find(r => r.key === selectedReportType)?.label || '';
            const timePeriodLabel = TIME_PERIODS.find(t => t.key === selectedTimePeriod)?.label || '';
            const formatLabel = FORMATS.find(f => f.key === selectedFormat)?.label || 'PDF';

            Alert.alert(
                'Report Generated! ✅',
                `${reportTypeLabel} for ${timePeriodLabel} has been generated as ${formatLabel}.`,
                [{ text: 'OK' }],
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to generate report. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleExportReport = (report) => {
        Alert.alert(
            'Exporting Report',
            `Exporting "${report.name}" as ${report.type}...`,
            [{ text: 'OK' }],
        );
    };

    // ─── Get Labels ───
    const getReportTypeLabel = () => {
        const found = REPORT_TYPES.find(r => r.key === selectedReportType);
        return found ? found.label : 'Select type';
    };

    const getTimePeriodLabel = () => {
        const found = TIME_PERIODS.find(t => t.key === selectedTimePeriod);
        return found ? found.label : 'Select period';
    };

    const getFormatLabel = () => {
        const found = FORMATS.find(f => f.key === selectedFormat);
        return found ? found.label : 'PDF';
    };

    // ─── Stats Config ───
    const statsConfig = [
        {
            label: 'Members',
            value: stats.totalMembers,
            icon: 'account-group',
            color: '#3b82f6',
            gradient: ['#3b82f6', '#60a5fa'],
        },
        {
            label: 'Active',
            value: stats.activeThisMonth,
            icon: 'trending-up',
            color: '#22c55e',
            gradient: ['#22c55e', '#4ade80'],
        },
        {
            label: 'Avg Progress',
            value: stats.avgProgressRate,
            icon: 'chart-bar',
            color: '#8b5cf6',
            gradient: ['#8b5cf6', '#a78bfa'],
        },
        {
            label: 'Sessions',
            value: stats.totalSessions,
            icon: 'calendar-check',
            color: '#f59e0b',
            gradient: ['#f59e0b', '#fbbf24'],
        },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#1e3a8a" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Reports</Text>
                <Text className="text-gray-400 mt-1 text-sm">Preparing your reports...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#1e3a8a']}
                    tintColor="#1e3a8a"
                />
            }>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-5">
                    <DrawerMenuButton />
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={onRefresh}
                            disabled={loading || refreshing}
                            className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                            <Icon
                                name="refresh"
                                size={22}
                                color="#fff"
                                style={loading || refreshing ? { opacity: 0.5 } : {}}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Title Section */}
                <View className="px-5 mb-5">
                    <Text className="text-white/60 text-sm font-medium">Coach Portal</Text>
                    <Text className="text-white font-bold text-2xl mt-0.5">
                        Reports
                    </Text>
                    <Text className="text-white/70 text-sm mt-1">
                        Generate and view member progress reports
                    </Text>
                </View>

                {/* Reports Summary Bar */}
                <View className="mx-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-blue-400/20 rounded-xl justify-center items-center">
                                <Icon name="file-chart-outline" size={20} color="#93c5fd" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-white font-bold text-sm">
                                    {MOCK_RECENT_REPORTS.length} Reports Generated
                                </Text>
                                <Text className="text-white/50 text-xs mt-0.5">
                                    Last generated {formatDate(MOCK_RECENT_REPORTS[0]?.date)}
                                </Text>
                            </View>
                        </View>
                        <View className="bg-blue-400 px-4 py-2 rounded-xl flex-row items-center">
                            <Icon name="plus" size={14} color="#fff" />
                            <Text className="text-white font-bold text-sm ml-1">
                                New
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── STATS GRID ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                    {statsConfig.map(stat => (
                        <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                            <View
                                className="bg-white rounded-2xl p-4 shadow-md"
                                style={{ elevation: 4 }}>
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                            {stat.label}
                                        </Text>
                                        <Text className="text-gray-900 font-bold text-3xl mt-1">
                                            {stat.value}
                                        </Text>
                                    </View>
                                    <LinearGradient
                                        colors={stat.gradient}
                                        className="w-11 h-11 rounded-xl justify-center items-center"
                                        style={{ borderRadius: 12 }}>
                                        <Icon name={stat.icon} size={20} color="#fff" />
                                    </LinearGradient>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── GENERATE REPORT CARD ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-5">
                <SectionTitle title="Generate Report" icon="file-chart-outline" iconColor="#1e3a8a" />
                <View
                    className="bg-white rounded-2xl p-5 shadow-md"
                    style={{ elevation: 3 }}>

                    {/* Report Type Selector */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Report Type
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowReportTypeModal(true)}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-4"
                            style={{ borderWidth: 1.5, borderColor: selectedReportType ? '#3b82f6' : '#f3f4f6' }}>
                            <View className="flex-row items-center flex-1">
                                {selectedReportType ? (
                                    <View
                                        className="w-8 h-8 rounded-lg justify-center items-center mr-3"
                                        style={{ backgroundColor: `${REPORT_TYPES.find(r => r.key === selectedReportType)?.color}15` }}>
                                        <Icon
                                            name={REPORT_TYPES.find(r => r.key === selectedReportType)?.icon || 'file'}
                                            size={16}
                                            color={REPORT_TYPES.find(r => r.key === selectedReportType)?.color}
                                        />
                                    </View>
                                ) : (
                                    <View className="w-8 h-8 rounded-lg bg-gray-100 justify-center items-center mr-3">
                                        <Icon name="file-document-outline" size={16} color="#9ca3af" />
                                    </View>
                                )}
                                <Text className={`text-sm font-medium ${selectedReportType ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {getReportTypeLabel()}
                                </Text>
                            </View>
                            <Icon name="chevron-down" size={20} color={selectedReportType ? '#3b82f6' : '#d1d5db'} />
                        </TouchableOpacity>
                    </View>

                    {/* Time Period Selector */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Time Period
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowTimePeriodModal(true)}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-4"
                            style={{ borderWidth: 1.5, borderColor: selectedTimePeriod ? '#22c55e' : '#f3f4f6' }}>
                            <View className="flex-row items-center flex-1">
                                {selectedTimePeriod ? (
                                    <View className="w-8 h-8 rounded-lg bg-green-50 justify-center items-center mr-3">
                                        <Icon
                                            name={TIME_PERIODS.find(t => t.key === selectedTimePeriod)?.icon || 'calendar'}
                                            size={16}
                                            color="#22c55e"
                                        />
                                    </View>
                                ) : (
                                    <View className="w-8 h-8 rounded-lg bg-gray-100 justify-center items-center mr-3">
                                        <Icon name="calendar-range" size={16} color="#9ca3af" />
                                    </View>
                                )}
                                <Text className={`text-sm font-medium ${selectedTimePeriod ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {getTimePeriodLabel()}
                                </Text>
                            </View>
                            <Icon name="chevron-down" size={20} color={selectedTimePeriod ? '#22c55e' : '#d1d5db'} />
                        </TouchableOpacity>
                    </View>

                    {/* Format Selector */}
                    <View className="mb-5">
                        <Text className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                            Format
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFormatModal(true)}
                            activeOpacity={0.7}
                            className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-4"
                            style={{ borderWidth: 1.5, borderColor: selectedFormat ? '#8b5cf6' : '#f3f4f6' }}>
                            <View className="flex-row items-center flex-1">
                                {selectedFormat ? (
                                    <View
                                        className="w-8 h-8 rounded-lg justify-center items-center mr-3"
                                        style={{ backgroundColor: `${FORMATS.find(f => f.key === selectedFormat)?.color}15` }}>
                                        <Icon
                                            name={FORMATS.find(f => f.key === selectedFormat)?.icon || 'file'}
                                            size={16}
                                            color={FORMATS.find(f => f.key === selectedFormat)?.color}
                                        />
                                    </View>
                                ) : (
                                    <View className="w-8 h-8 rounded-lg bg-gray-100 justify-center items-center mr-3">
                                        <Icon name="file-outline" size={16} color="#9ca3af" />
                                    </View>
                                )}
                                <Text className={`text-sm font-medium ${selectedFormat ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {getFormatLabel()}
                                </Text>
                            </View>
                            <Icon name="chevron-down" size={20} color={selectedFormat ? '#8b5cf6' : '#d1d5db'} />
                        </TouchableOpacity>
                    </View>

                    {/* Generate Button */}
                    <TouchableOpacity
                        onPress={handleGenerateReport}
                        disabled={generating}
                        activeOpacity={0.8}>
                        <LinearGradient
                            colors={generating ? ['#93c5fd', '#93c5fd'] : ['#1e3a8a', '#3b82f6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 16,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            {generating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Icon name="file-document-outline" size={18} color="#fff" />
                            )}
                            <Text className="text-white font-bold text-sm ml-2">
                                {generating ? 'Generating...' : 'Generate Report'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── QUICK EXPORT BUTTONS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle title="Quick Export" icon="export" iconColor="#8b5cf6" />
                <View className="flex-row" style={{ marginHorizontal: -4 }}>
                    {FORMATS.map(fmt => (
                        <TouchableOpacity
                            key={fmt.key}
                            onPress={() => {
                                Alert.alert(
                                    'Quick Export',
                                    `Exporting Performance Summary as ${fmt.label}...`,
                                    [{ text: 'OK' }],
                                );
                            }}
                            activeOpacity={0.7}
                            style={{ flex: 1, marginHorizontal: 4 }}>
                            <View
                                className="bg-white rounded-2xl p-4 items-center shadow-sm"
                                style={{ elevation: 2 }}>
                                <LinearGradient
                                    colors={fmt.gradient}
                                    className="w-12 h-12 rounded-xl justify-center items-center mb-2.5"
                                    style={{ borderRadius: 14 }}>
                                    <Icon name={fmt.icon} size={22} color="#fff" />
                                </LinearGradient>
                                <Text className="text-gray-700 font-semibold text-xs">
                                    {fmt.label}
                                </Text>
                                <Text className="text-gray-400 text-[10px] mt-0.5">Export</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RECENT REPORTS ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle
                    title="Recent Reports"
                    icon="history"
                    iconColor="#f59e0b"
                    onViewAll={() => { }}
                />

                {MOCK_RECENT_REPORTS.map(report => (
                    <RecentReportItem
                        key={report.id}
                        report={report}
                        onExport={handleExportReport}
                    />
                ))}
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── REPORT TYPES OVERVIEW ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 mt-6">
                <SectionTitle title="Report Types" icon="file-multiple" iconColor="#22c55e" />

                {/* Performance Overview Card */}
                <View
                    className="bg-white rounded-2xl p-5 shadow-md mb-4"
                    style={{ elevation: 3 }}>
                    <View className="flex-row items-center justify-around">
                        <CircularStat
                            value={stats.totalMembers}
                            label="Total Members"
                            color="#3b82f6"
                        />
                        <View className="w-px h-12 bg-gray-100" />
                        <CircularStat
                            value={stats.activeThisMonth}
                            label="Active"
                            color="#22c55e"
                        />
                        <View className="w-px h-12 bg-gray-100" />
                        <CircularStat
                            value={stats.totalSessions}
                            label="Sessions"
                            color="#f59e0b"
                        />
                    </View>
                </View>

                {REPORT_TYPES.map((type, index) => (
                    <TouchableOpacity
                        key={type.key}
                        onPress={() => {
                            setSelectedReportType(type.key);
                            setShowTimePeriodModal(true);
                        }}
                        activeOpacity={0.7}
                        className={`bg-white rounded-2xl p-4 shadow-sm ${index < REPORT_TYPES.length - 1 ? 'mb-3' : ''}`}
                        style={{
                            elevation: 2,
                            borderLeftWidth: 3,
                            borderLeftColor: type.color,
                        }}>
                        <View className="flex-row items-center">
                            <LinearGradient
                                colors={type.gradient}
                                className="w-12 h-12 rounded-2xl justify-center items-center"
                                style={{ borderRadius: 14 }}>
                                <Icon name={type.icon} size={22} color="#fff" />
                            </LinearGradient>
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-900 font-bold text-sm">
                                    {type.label}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    Tap to generate this report
                                </Text>
                            </View>
                            <View className="w-8 h-8 bg-gray-50 rounded-full justify-center items-center">
                                <Icon name="chevron-right" size={18} color="#d1d5db" />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── REPORT TYPE SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showReportTypeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowReportTypeModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="p-5">
                            {/* Handle bar */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2.5">
                                        <Icon name="file-chart-outline" size={16} color="#1e3a8a" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Select Report Type
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowReportTypeModal(false)}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {REPORT_TYPES.map((type, index) => (
                                <TouchableOpacity
                                    key={type.key}
                                    onPress={() => {
                                        setSelectedReportType(type.key);
                                        setShowReportTypeModal(false);
                                    }}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-4 rounded-2xl ${selectedReportType === type.key
                                        ? 'bg-blue-50'
                                        : 'bg-gray-50'
                                        } ${index < REPORT_TYPES.length - 1 ? 'mb-2' : ''}`}
                                    style={{
                                        borderWidth: 1.5,
                                        borderColor: selectedReportType === type.key ? '#93c5fd' : '#f3f4f6',
                                    }}>
                                    <LinearGradient
                                        colors={selectedReportType === type.key ? type.gradient : [`${type.color}20`, `${type.color}10`]}
                                        className="w-10 h-10 rounded-xl justify-center items-center"
                                        style={{ borderRadius: 12 }}>
                                        <Icon
                                            name={type.icon}
                                            size={20}
                                            color={selectedReportType === type.key ? '#fff' : type.color}
                                        />
                                    </LinearGradient>
                                    <Text className={`flex-1 ml-3 font-semibold text-sm ${selectedReportType === type.key ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {type.label}
                                    </Text>
                                    {selectedReportType === type.key && (
                                        <View className="w-6 h-6 bg-blue-500 rounded-full justify-center items-center">
                                            <Icon name="check" size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Safe area bottom */}
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── TIME PERIOD SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showTimePeriodModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTimePeriodModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="p-5">
                            {/* Handle bar */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-lg bg-green-50 justify-center items-center mr-2.5">
                                        <Icon name="calendar-range" size={16} color="#22c55e" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Select Time Period
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowTimePeriodModal(false)}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {TIME_PERIODS.map((period, index) => (
                                <TouchableOpacity
                                    key={period.key}
                                    onPress={() => {
                                        setSelectedTimePeriod(period.key);
                                        setShowTimePeriodModal(false);
                                    }}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-4 rounded-2xl ${selectedTimePeriod === period.key
                                        ? 'bg-green-50'
                                        : 'bg-gray-50'
                                        } ${index < TIME_PERIODS.length - 1 ? 'mb-2' : ''}`}
                                    style={{
                                        borderWidth: 1.5,
                                        borderColor: selectedTimePeriod === period.key ? '#86efac' : '#f3f4f6',
                                    }}>
                                    <View
                                        className="w-10 h-10 rounded-xl justify-center items-center"
                                        style={{
                                            backgroundColor: selectedTimePeriod === period.key ? '#dcfce7' : '#f9fafb',
                                        }}>
                                        <Icon
                                            name={period.icon}
                                            size={20}
                                            color={selectedTimePeriod === period.key ? '#22c55e' : '#9ca3af'}
                                        />
                                    </View>
                                    <Text className={`flex-1 ml-3 font-semibold text-sm ${selectedTimePeriod === period.key ? 'text-green-700' : 'text-gray-700'
                                        }`}>
                                        {period.label}
                                    </Text>
                                    {selectedTimePeriod === period.key && (
                                        <View className="w-6 h-6 bg-green-500 rounded-full justify-center items-center">
                                            <Icon name="check" size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Safe area bottom */}
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FORMAT SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showFormatModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFormatModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="p-5">
                            {/* Handle bar */}
                            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-lg bg-purple-50 justify-center items-center mr-2.5">
                                        <Icon name="file-outline" size={16} color="#8b5cf6" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Select Format
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowFormatModal(false)}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {FORMATS.map((fmt, index) => (
                                <TouchableOpacity
                                    key={fmt.key}
                                    onPress={() => {
                                        setSelectedFormat(fmt.key);
                                        setShowFormatModal(false);
                                    }}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-4 rounded-2xl ${selectedFormat === fmt.key
                                        ? 'bg-purple-50'
                                        : 'bg-gray-50'
                                        } ${index < FORMATS.length - 1 ? 'mb-2' : ''}`}
                                    style={{
                                        borderWidth: 1.5,
                                        borderColor: selectedFormat === fmt.key ? '#c4b5fd' : '#f3f4f6',
                                    }}>
                                    <LinearGradient
                                        colors={selectedFormat === fmt.key ? fmt.gradient : [`${fmt.color}20`, `${fmt.color}10`]}
                                        className="w-10 h-10 rounded-xl justify-center items-center"
                                        style={{ borderRadius: 12 }}>
                                        <Icon
                                            name={fmt.icon}
                                            size={20}
                                            color={selectedFormat === fmt.key ? '#fff' : fmt.color}
                                        />
                                    </LinearGradient>
                                    <Text className={`flex-1 ml-3 font-semibold text-sm ${selectedFormat === fmt.key ? 'text-purple-700' : 'text-gray-700'
                                        }`}>
                                        {fmt.label}
                                    </Text>
                                    {selectedFormat === fmt.key && (
                                        <View className="w-6 h-6 bg-purple-500 rounded-full justify-center items-center">
                                            <Icon name="check" size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Safe area bottom */}
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default CoachReportsScreen;