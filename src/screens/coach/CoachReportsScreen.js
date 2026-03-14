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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import { coachProfile } from '../../data/user';
import { sessions } from '../../data/sessions';
import { trainees } from '../../data/trainees';

// ─── Constants ───
const REPORT_TYPES = [
    { key: 'member-progress', label: 'Member Progress', icon: 'account-arrow-up', color: '#3b82f6' },
    { key: 'performance-summary', label: 'Performance Summary', icon: 'chart-bar', color: '#8b5cf6' },
    { key: 'attendance', label: 'Attendance Report', icon: 'clipboard-check-outline', color: '#22c55e' },
    { key: 'training-notes', label: 'Training Notes', icon: 'notebook-outline', color: '#f59e0b' },
];

const TIME_PERIODS = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
];

const FORMATS = [
    { key: 'pdf', label: 'PDF', icon: 'file-pdf-box', color: '#dc2626' },
    { key: 'excel', label: 'Excel', icon: 'file-excel-box', color: '#16a34a' },
    { key: 'csv', label: 'CSV', icon: 'file-delimited-outline', color: '#2563eb' },
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

// ─── Component ───
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

            const coachTrainees = trainees.filter(t => t.coachId === coachProfile.id);
            const totalSessions = sessions.length;
            const avgAttendance =
                coachTrainees.length > 0
                    ? Math.round(
                        coachTrainees.reduce((sum, t) => sum + t.attendance, 0) /
                        coachTrainees.length,
                    )
                    : 0;

            setStats({
                totalMembers: coachTrainees.length,
                activeThisMonth: Math.min(coachTrainees.length, 3),
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
            label: 'Total Members',
            value: stats.totalMembers,
            icon: 'account-group',
            color: '#3b82f6',
            bg: '#eff6ff',
        },
        {
            label: 'Active This Month',
            value: stats.activeThisMonth,
            icon: 'trending-up',
            color: '#22c55e',
            bg: '#f0fdf4',
        },
        {
            label: 'Avg Progress',
            value: stats.avgProgressRate,
            icon: 'chart-bar',
            color: '#8b5cf6',
            bg: '#f5f3ff',
        },
        {
            label: 'Total Sessions',
            value: stats.totalSessions,
            icon: 'calendar-check',
            color: '#f59e0b',
            bg: '#fffbeb',
        },
    ];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text className="text-gray-500 mt-3">Loading reports...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center flex-1">
                        <DrawerMenuButton />
                        <View className="ml-2 flex-1">
                            <Text className="text-white font-bold text-2xl">
                                Reports
                            </Text>
                            <Text className="text-white/80 text-sm">
                                Generate and view member progress reports
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        disabled={loading || refreshing}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon
                            name="refresh"
                            size={22}
                            color="#fff"
                            style={loading || refreshing ? { opacity: 0.5 } : {}}
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                    />
                }>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── STATS GRID ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-2 mt-4">
                    <View className="flex-row flex-wrap">
                        {statsConfig.map(stat => (
                            <View key={stat.label} className="w-1/2 p-2">
                                <View
                                    className="bg-white rounded-xl p-4 shadow-sm"
                                    style={{ elevation: 2 }}>
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs">{stat.label}</Text>
                                            <Text className="text-gray-900 font-bold text-2xl mt-1">
                                                {stat.value}
                                            </Text>
                                        </View>
                                        <View
                                            className="w-10 h-10 rounded-full justify-center items-center"
                                            style={{ backgroundColor: stat.bg }}>
                                            <Icon name={stat.icon} size={20} color={stat.color} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── GENERATE REPORT CARD ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">
                    <View
                        className="bg-white rounded-2xl p-5 shadow-sm"
                        style={{ elevation: 3 }}>
                        <View className="flex-row items-center mb-4">
                            <Icon name="file-chart-outline" size={22} color="#1e3a8a" />
                            <Text className="text-gray-900 font-bold text-lg ml-2">
                                Generate Report
                            </Text>
                        </View>

                        {/* Report Type Selector */}
                        <View className="mb-3">
                            <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                                Report Type
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowReportTypeModal(true)}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
                                <Text className={`text-sm ${selectedReportType ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                    {getReportTypeLabel()}
                                </Text>
                                <Icon name="chevron-down" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* Time Period Selector */}
                        <View className="mb-3">
                            <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                                Time Period
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowTimePeriodModal(true)}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
                                <Text className={`text-sm ${selectedTimePeriod ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                    {getTimePeriodLabel()}
                                </Text>
                                <Icon name="chevron-down" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* Format Selector */}
                        <View className="mb-4">
                            <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                                Format
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowFormatModal(true)}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
                                <Text className={`text-sm ${selectedFormat ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                    {getFormatLabel()}
                                </Text>
                                <Icon name="chevron-down" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* Generate Button */}
                        <TouchableOpacity
                            onPress={handleGenerateReport}
                            disabled={generating}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={generating ? ['#93c5fd', '#93c5fd'] : ['#1e3a8a', '#3b82f6']}
                                className="rounded-xl py-3.5 flex-row items-center justify-center">
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
                <View className="px-4 mt-4">
                    <Text className="text-gray-900 font-bold text-lg mb-3">
                        Quick Export
                    </Text>
                    <View className="flex-row gap-3">
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
                                className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-100"
                                style={{ elevation: 2 }}>
                                <View
                                    className="w-10 h-10 rounded-full justify-center items-center mb-2"
                                    style={{ backgroundColor: `${fmt.color}15` }}>
                                    <Icon name={fmt.icon} size={22} color={fmt.color} />
                                </View>
                                <Text className="text-gray-700 font-semibold text-xs">
                                    {fmt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── RECENT REPORTS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <Text className="text-gray-900 font-bold text-lg mb-3">
                        Recent Reports
                    </Text>

                    {MOCK_RECENT_REPORTS.map(report => (
                        <TouchableOpacity
                            key={report.id}
                            onPress={() => handleExportReport(report)}
                            activeOpacity={0.7}
                            className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
                            style={{ elevation: 2 }}>
                            {/* File Icon */}
                            <View
                                className="w-10 h-10 rounded-lg justify-center items-center"
                                style={{ backgroundColor: `${report.iconColor}15` }}>
                                <Icon name={report.icon} size={22} color={report.iconColor} />
                            </View>

                            {/* Report Info */}
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                                    {report.name}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {formatDate(report.date)}
                                </Text>
                            </View>

                            {/* Download Button */}
                            <TouchableOpacity
                                onPress={() => handleExportReport(report)}
                                activeOpacity={0.7}
                                className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2">
                                <Icon name="download" size={14} color="#3b82f6" />
                                <Text className="text-blue-600 text-xs font-semibold ml-1">
                                    {report.type}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── REPORT TYPE QUICK CARDS ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-6 mb-6">
                    <Text className="text-gray-900 font-bold text-lg mb-3">
                        Report Types
                    </Text>
                    {REPORT_TYPES.map((type, index) => (
                        <TouchableOpacity
                            key={type.key}
                            onPress={() => {
                                setSelectedReportType(type.key);
                                setShowTimePeriodModal(true);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 bg-white rounded-xl border border-gray-100 ${index < REPORT_TYPES.length - 1 ? 'mb-3' : ''
                                }`}
                            style={{ elevation: 2 }}>
                            <View
                                className="w-10 h-10 rounded-lg justify-center items-center"
                                style={{ backgroundColor: `${type.color}15` }}>
                                <Icon name={type.icon} size={22} color={type.color} />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-900 font-semibold text-sm">
                                    {type.label}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    Tap to generate this report
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={20} color="#d1d5db" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>

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
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg">
                                    Select Report Type
                                </Text>
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
                                    className={`flex-row items-center p-4 rounded-xl ${selectedReportType === type.key
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-gray-50 border border-gray-100'
                                        } ${index < REPORT_TYPES.length - 1 ? 'mb-2' : ''}`}>
                                    <View
                                        className="w-10 h-10 rounded-full justify-center items-center"
                                        style={{ backgroundColor: `${type.color}20` }}>
                                        <Icon name={type.icon} size={20} color={type.color} />
                                    </View>
                                    <Text className={`flex-1 ml-3 font-semibold text-sm ${selectedReportType === type.key ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {type.label}
                                    </Text>
                                    {selectedReportType === type.key && (
                                        <Icon name="check-circle" size={20} color="#2563eb" />
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
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg">
                                    Select Time Period
                                </Text>
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
                                    className={`flex-row items-center p-4 rounded-xl ${selectedTimePeriod === period.key
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-gray-50 border border-gray-100'
                                        } ${index < TIME_PERIODS.length - 1 ? 'mb-2' : ''}`}>
                                    <Icon
                                        name="calendar-range"
                                        size={20}
                                        color={selectedTimePeriod === period.key ? '#2563eb' : '#9ca3af'}
                                    />
                                    <Text className={`flex-1 ml-3 font-semibold text-sm ${selectedTimePeriod === period.key ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {period.label}
                                    </Text>
                                    {selectedTimePeriod === period.key && (
                                        <Icon name="check-circle" size={20} color="#2563eb" />
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
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg">
                                    Select Format
                                </Text>
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
                                    className={`flex-row items-center p-4 rounded-xl ${selectedFormat === fmt.key
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-gray-50 border border-gray-100'
                                        } ${index < FORMATS.length - 1 ? 'mb-2' : ''}`}>
                                    <View
                                        className="w-10 h-10 rounded-full justify-center items-center"
                                        style={{ backgroundColor: `${fmt.color}20` }}>
                                        <Icon name={fmt.icon} size={20} color={fmt.color} />
                                    </View>
                                    <Text className={`flex-1 ml-3 font-semibold text-sm ${selectedFormat === fmt.key ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {fmt.label}
                                    </Text>
                                    {selectedFormat === fmt.key && (
                                        <Icon name="check-circle" size={20} color="#2563eb" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Safe area bottom */}
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CoachReportsScreen;