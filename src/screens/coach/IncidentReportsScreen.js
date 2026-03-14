import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert,
    TextInput,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import {
    MOCK_INCIDENTS,
    MOCK_INCIDENT_STATS,
    MOCK_FACILITIES,
    MOCK_MEMBERS_LIST,
    SEVERITY_OPTIONS,
    STATUS_OPTIONS,
    TYPE_OPTIONS,
} from '../../data/incidents';

// ─── Constants ───
const ITEMS_PER_PAGE = 5;

const initialFormState = {
    title: '',
    description: '',
    type: '',
    severity: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    customLocation: '',
    actionsTaken: '',
    involvedMembers: [],
};

// ─── Helpers ───
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getSeverityColor = (severity) => {
    switch (severity) {
        case 'critical':
            return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
        case 'high':
            return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
        case 'medium':
            return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
        case 'low':
            return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
        default:
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'open':
            return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
        case 'investigating':
            return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
        case 'resolved':
            return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
        case 'closed':
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        default:
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
};

const getTypeIcon = (type) => {
    switch (type) {
        case 'injury':
            return 'bandage';
        case 'equipment':
            return 'wrench';
        case 'safety':
            return 'shield-alert';
        case 'behavior':
            return 'account-alert';
        default:
            return 'alert-circle';
    }
};

// ─── Badge Component ───
const BadgePill = ({ label, colorConfig }) => (
    <View
        className="px-2.5 py-1 rounded-full mr-1.5 mb-1"
        style={{ backgroundColor: colorConfig.bg }}>
        <Text
            className="text-[10px] font-bold capitalize"
            style={{ color: colorConfig.text }}>
            {label}
        </Text>
    </View>
);

// ─── Stat Card Component ───
const StatCardItem = ({ label, value, icon, color, bgColor }) => (
    <View className="w-1/2 p-2">
        <View
            className="bg-white rounded-xl p-4 shadow-sm"
            style={{ elevation: 2 }}>
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-gray-400 text-xs">{label}</Text>
                    <Text className="text-gray-900 font-bold text-2xl mt-1">
                        {value}
                    </Text>
                </View>
                <View
                    className="w-10 h-10 rounded-full justify-center items-center"
                    style={{ backgroundColor: bgColor }}>
                    <Icon name={icon} size={20} color={color} />
                </View>
            </View>
        </View>
    </View>
);

// ─── Bottom Sheet Modal Wrapper ───
const BottomSheetModal = ({ visible, onClose, title, children }) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-[85%]">
                <View className="p-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 font-bold text-lg flex-1 mr-2">
                            {title}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                            <Icon name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    {children}
                </View>
                <View className="h-6" />
            </View>
        </View>
    </Modal>
);

// ─── Selector Field Component ───
const SelectorField = ({ label, value, placeholder, onPress, required }) => (
    <View className="mb-3">
        <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
            {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
            <Text
                className={`text-sm flex-1 ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
                numberOfLines={1}>
                {value || placeholder}
            </Text>
            <Icon name="chevron-down" size={20} color="#9ca3af" />
        </TouchableOpacity>
    </View>
);

// ─── Input Field Component ───
const InputField = ({ label, value, onChangeText, placeholder, required, multiline, numberOfLines }) => (
    <View className="mb-3">
        <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
            {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 ${multiline ? 'py-3 min-h-[100px]' : 'py-3.5'
                }`}
        />
    </View>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const IncidentReportsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState(MOCK_INCIDENT_STATS);

    // Modals
    const [showReportModal, setShowReportModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showSeverityModal, setShowSeverityModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Selected
    const [selectedIncident, setSelectedIncident] = useState(null);

    // Form
    const [formData, setFormData] = useState(initialFormState);
    const [resolveNote, setResolveNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Member search in form
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // ─── Data Fetching (Mock) ───
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            setIncidents(MOCK_INCIDENTS);
            setStats(MOCK_INCIDENT_STATS);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ─── Filtered & Paginated Incidents ───
    const filteredIncidents = useMemo(() => {
        let result = [...incidents];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (inc) =>
                    (inc.title && inc.title.toLowerCase().includes(q)) ||
                    (inc.description && inc.description.toLowerCase().includes(q)),
            );
        }
        if (filterSeverity) {
            result = result.filter((inc) => inc.severity === filterSeverity);
        }
        if (filterStatus) {
            result = result.filter((inc) => inc.status === filterStatus);
        }
        if (filterType) {
            result = result.filter((inc) => inc.type === filterType);
        }

        return result;
    }, [incidents, searchQuery, filterSeverity, filterStatus, filterType]);

    const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE));
    const paginatedIncidents = filteredIncidents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const activeFilterCount = [filterSeverity, filterStatus, filterType].filter(Boolean).length;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterSeverity, filterStatus, filterType]);

    // ─── Form Handlers ───
    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleMember = (memberId) => {
        setFormData((prev) => {
            const current = prev.involvedMembers || [];
            if (current.includes(memberId)) {
                return { ...prev, involvedMembers: current.filter((id) => id !== memberId) };
            }
            return { ...prev, involvedMembers: [...current, memberId] };
        });
    };

    const handleRemoveMember = (memberId) => {
        setFormData((prev) => ({
            ...prev,
            involvedMembers: (prev.involvedMembers || []).filter((id) => id !== memberId),
        }));
    };

    const filteredMembersList = MOCK_MEMBERS_LIST.filter((m) => {
        const q = memberSearchQuery.toLowerCase();
        if (!q) return true;
        return (
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.email && m.email.toLowerCase().includes(q))
        );
    });

    // ─── Submit Report ───
    const handleSubmitReport = async () => {
        if (!formData.title || !formData.description || !formData.type || !formData.incidentDate) {
            Alert.alert('Missing Information', 'Please fill in all required fields (Title, Description, Type, Date).');
            return;
        }

        setSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const resolvedLocation =
                formData.location === 'other'
                    ? formData.customLocation || ''
                    : formData.location || '';

            const newIncident = {
                _id: `inc_${Date.now()}`,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                severity: formData.severity || 'medium',
                status: 'open',
                incidentDate: formData.incidentDate
                    ? formData.incidentTime
                        ? `${formData.incidentDate}T${formData.incidentTime}:00Z`
                        : `${formData.incidentDate}T00:00:00Z`
                    : new Date().toISOString(),
                location: resolvedLocation,
                actionsTaken: formData.actionsTaken || '',
                reportedBy: { name: 'Coach Smith', email: 'coach@test.com' },
                involvedMembers: (formData.involvedMembers || []).map((id) => {
                    const member = MOCK_MEMBERS_LIST.find((m) => m._id === id);
                    return member || { _id: id, name: 'Unknown' };
                }),
                resolvedDate: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setIncidents((prev) => [newIncident, ...prev]);
            setStats((prev) => ({
                ...prev,
                total: prev.total + 1,
                open: prev.open + 1,
            }));

            Alert.alert('Success ✅', 'Incident report submitted successfully.');
            setShowReportModal(false);
            setFormData(initialFormState);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit incident report.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── View Details ───
    const handleViewDetails = (incident) => {
        setSelectedIncident(incident);
        setShowViewModal(true);
    };

    // ─── Resolve ───
    const handleOpenResolve = (incident) => {
        setSelectedIncident(incident);
        setResolveNote('');
        setShowResolveModal(true);
    };

    const handleSubmitResolve = async () => {
        if (!selectedIncident) return;
        setSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            setIncidents((prev) =>
                prev.map((inc) =>
                    inc._id === selectedIncident._id
                        ? {
                            ...inc,
                            status: 'resolved',
                            actionsTaken: resolveNote || inc.actionsTaken,
                            resolvedDate: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }
                        : inc,
                ),
            );
            setStats((prev) => ({
                ...prev,
                resolved: prev.resolved + 1,
                open: selectedIncident.status === 'open' ? prev.open - 1 : prev.open,
                investigating: selectedIncident.status === 'investigating' ? prev.investigating - 1 : prev.investigating,
            }));

            Alert.alert('Success ✅', 'Incident resolved successfully.');
            setShowResolveModal(false);
            setResolveNote('');
        } catch (error) {
            Alert.alert('Error', 'Failed to resolve incident.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Delete ───
    const handleOpenDelete = (incident) => {
        setSelectedIncident(incident);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedIncident) return;
        setSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            setIncidents((prev) => prev.filter((inc) => inc._id !== selectedIncident._id));
            setStats((prev) => ({
                ...prev,
                total: prev.total - 1,
                open: selectedIncident.status === 'open' ? prev.open - 1 : prev.open,
                investigating: selectedIncident.status === 'investigating' ? prev.investigating - 1 : prev.investigating,
                resolved: selectedIncident.status === 'resolved' ? prev.resolved - 1 : prev.resolved,
            }));

            Alert.alert('Deleted', 'Incident report deleted successfully.');
            setShowDeleteConfirm(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete incident.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Clear Filters ───
    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterSeverity('');
        setFilterStatus('');
        setFilterType('');
        setCurrentPage(1);
    };

    // ─── Get Labels ───
    const getTypeLabel = (val) => TYPE_OPTIONS.find((o) => o.value === val)?.label || '';
    const getSeverityLabel = (val) => SEVERITY_OPTIONS.find((o) => o.value === val)?.label || '';
    const getStatusLabel = (val) => STATUS_OPTIONS.find((o) => o.value === val)?.label || '';

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text className="text-gray-500 mt-3">Loading incidents...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#1e3a8a', '#3b82f6']}
                className="px-6 pt-12 pb-6">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center flex-1">
                        <DrawerMenuButton />
                        <View className="ml-2 flex-1">
                            <Text className="text-white font-bold text-2xl">
                                Incident Reports
                            </Text>
                            <Text className="text-white/80 text-sm">
                                Report and track safety incidents
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        disabled={refreshing}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon
                            name="refresh"
                            size={22}
                            color="#fff"
                            style={refreshing ? { opacity: 0.5 } : {}}
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
                        <StatCardItem
                            label="Total Incidents"
                            value={stats.total}
                            icon="file-document-outline"
                            color="#6b7280"
                            bgColor="#f3f4f6"
                        />
                        <StatCardItem
                            label="Open"
                            value={stats.open}
                            icon="alert-circle-outline"
                            color="#f59e0b"
                            bgColor="#fffbeb"
                        />
                        <StatCardItem
                            label="Investigating"
                            value={stats.investigating}
                            icon="magnify"
                            color="#3b82f6"
                            bgColor="#eff6ff"
                        />
                        <StatCardItem
                            label="Resolved"
                            value={stats.resolved}
                            icon="check-circle-outline"
                            color="#22c55e"
                            bgColor="#f0fdf4"
                        />
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── REPORT NEW INCIDENT BUTTON ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">
                    <TouchableOpacity
                        onPress={() => setShowReportModal(true)}
                        activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#dc2626', '#ef4444']}
                            className="rounded-xl py-4 flex-row items-center justify-center">
                            <Icon name="plus-circle" size={20} color="#fff" />
                            <Text className="text-white font-bold text-sm ml-2">
                                Report New Incident
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SEARCH & FILTER BAR ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">
                    <View className="flex-row items-center gap-2">
                        {/* Search */}
                        <View className="flex-1 flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5"
                            style={{ elevation: 1 }}>
                            <Icon name="magnify" size={20} color="#9ca3af" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search incidents..."
                                placeholderTextColor="#9ca3af"
                                className="flex-1 ml-2 text-sm text-gray-900 py-0"
                            />
                            {searchQuery ? (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Icon name="close-circle" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {/* Filter Button */}
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(true)}
                            activeOpacity={0.7}
                            className="bg-white border border-gray-200 rounded-xl p-3 relative"
                            style={{ elevation: 1 }}>
                            <Icon name="filter-variant" size={22} color="#6b7280" />
                            {activeFilterCount > 0 && (
                                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full justify-center items-center">
                                    <Text className="text-white text-[10px] font-bold">
                                        {activeFilterCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Active Filter Tags */}
                    {activeFilterCount > 0 && (
                        <View className="flex-row flex-wrap items-center mt-2 gap-1.5">
                            {filterSeverity ? (
                                <TouchableOpacity
                                    onPress={() => setFilterSeverity('')}
                                    className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                    <Text className="text-blue-700 text-xs font-medium mr-1">
                                        {getSeverityLabel(filterSeverity)}
                                    </Text>
                                    <Icon name="close" size={12} color="#1d4ed8" />
                                </TouchableOpacity>
                            ) : null}
                            {filterStatus ? (
                                <TouchableOpacity
                                    onPress={() => setFilterStatus('')}
                                    className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                    <Text className="text-blue-700 text-xs font-medium mr-1">
                                        {getStatusLabel(filterStatus)}
                                    </Text>
                                    <Icon name="close" size={12} color="#1d4ed8" />
                                </TouchableOpacity>
                            ) : null}
                            {filterType ? (
                                <TouchableOpacity
                                    onPress={() => setFilterType('')}
                                    className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                    <Text className="text-blue-700 text-xs font-medium mr-1">
                                        {getTypeLabel(filterType)}
                                    </Text>
                                    <Icon name="close" size={12} color="#1d4ed8" />
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity onPress={handleClearFilters}>
                                <Text className="text-red-500 text-xs font-semibold ml-1">
                                    Clear All
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── INCIDENTS LIST ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4">
                    <Text className="text-gray-900 font-bold text-lg mb-3">
                        Incidents ({filteredIncidents.length})
                    </Text>

                    {paginatedIncidents.length === 0 ? (
                        <View className="bg-white rounded-xl p-8 items-center" style={{ elevation: 2 }}>
                            <Icon name="alert-circle-outline" size={48} color="#d1d5db" />
                            <Text className="text-gray-500 font-semibold text-base mt-3">
                                No incidents found
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1 text-center">
                                No incident reports match your current filters.
                            </Text>
                        </View>
                    ) : (
                        paginatedIncidents.map((incident) => (
                            <View
                                key={incident._id}
                                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                                style={{ elevation: 2 }}>
                                {/* Top Row: Title + Badges */}
                                <View className="flex-row items-start justify-between mb-2">
                                    <View className="flex-1 mr-2">
                                        <View className="flex-row items-center mb-1.5">
                                            <View
                                                className="w-8 h-8 rounded-lg justify-center items-center mr-2"
                                                style={{ backgroundColor: getSeverityColor(incident.severity).bg }}>
                                                <Icon
                                                    name={getTypeIcon(incident.type)}
                                                    size={16}
                                                    color={getSeverityColor(incident.severity).text}
                                                />
                                            </View>
                                            <Text className="text-gray-900 font-semibold text-sm flex-1" numberOfLines={1}>
                                                {incident.title || `${incident.type} Incident`}
                                            </Text>
                                        </View>
                                        <View className="flex-row flex-wrap ml-10">
                                            <BadgePill label={incident.severity} colorConfig={getSeverityColor(incident.severity)} />
                                            <BadgePill label={incident.status} colorConfig={getStatusColor(incident.status)} />
                                            <BadgePill
                                                label={getTypeLabel(incident.type) || incident.type}
                                                colorConfig={{ bg: '#f3f4f6', text: '#374151' }}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Date & Location */}
                                <View className="flex-row items-center mb-2">
                                    <Icon name="clock-outline" size={14} color="#9ca3af" />
                                    <Text className="text-gray-400 text-xs ml-1">
                                        {formatDate(incident.incidentDate)} {formatTime(incident.incidentDate)}
                                    </Text>
                                    {incident.location ? (
                                        <>
                                            <Text className="text-gray-300 mx-1.5">•</Text>
                                            <Icon name="map-marker-outline" size={14} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1" numberOfLines={1}>
                                                {incident.location}
                                            </Text>
                                        </>
                                    ) : null}
                                </View>

                                {/* Reported By */}
                                {incident.reportedBy && (
                                    <View className="flex-row items-center mb-1.5">
                                        <Icon name="account-outline" size={14} color="#9ca3af" />
                                        <Text className="text-gray-400 text-xs ml-1">
                                            Reported by:{' '}
                                            <Text className="text-gray-600 font-medium">
                                                {incident.reportedBy.name || incident.reportedBy.email}
                                            </Text>
                                        </Text>
                                    </View>
                                )}

                                {/* Involved Members */}
                                {incident.involvedMembers && incident.involvedMembers.length > 0 && (
                                    <View className="flex-row items-center mb-1.5">
                                        <Icon name="account-group-outline" size={14} color="#9ca3af" />
                                        <Text className="text-gray-400 text-xs ml-1 flex-1" numberOfLines={1}>
                                            Involved:{' '}
                                            <Text className="text-gray-600 font-medium">
                                                {incident.involvedMembers.map((m) => m.name || m.email).join(', ')}
                                            </Text>
                                        </Text>
                                    </View>
                                )}

                                {/* Description */}
                                <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                                    {incident.description}
                                </Text>

                                {/* Action Buttons */}
                                <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <TouchableOpacity
                                        onPress={() => handleViewDetails(incident)}
                                        activeOpacity={0.7}
                                        className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2">
                                        <Icon name="eye-outline" size={14} color="#3b82f6" />
                                        <Text className="text-blue-600 text-xs font-semibold ml-1">
                                            View
                                        </Text>
                                    </TouchableOpacity>

                                    {incident.status !== 'resolved' && incident.status !== 'closed' && (
                                        <TouchableOpacity
                                            onPress={() => handleOpenResolve(incident)}
                                            activeOpacity={0.7}
                                            className="flex-row items-center border border-green-200 rounded-lg px-3 py-2">
                                            <Icon name="check-circle-outline" size={14} color="#22c55e" />
                                            <Text className="text-green-600 text-xs font-semibold ml-1">
                                                Resolve
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        onPress={() => handleOpenDelete(incident)}
                                        activeOpacity={0.7}
                                        className="flex-row items-center border border-red-200 rounded-lg px-3 py-2">
                                        <Icon name="trash-can-outline" size={14} color="#ef4444" />
                                        <Text className="text-red-500 text-xs font-semibold ml-1">
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <View className="flex-row items-center justify-between mt-2 mb-2">
                            <Text className="text-gray-400 text-xs">
                                Page {currentPage} of {totalPages}
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center border rounded-lg px-3 py-2 ${currentPage <= 1 ? 'border-gray-100 opacity-40' : 'border-gray-200'}`}>
                                    <Icon name="chevron-left" size={16} color="#6b7280" />
                                    <Text className="text-gray-600 text-xs font-semibold ml-0.5">Prev</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center border rounded-lg px-3 py-2 ${currentPage >= totalPages ? 'border-gray-100 opacity-40' : 'border-gray-200'}`}>
                                    <Text className="text-gray-600 text-xs font-semibold mr-0.5">Next</Text>
                                    <Icon name="chevron-right" size={16} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* ═══════════════════════════════════════════════ */}
                {/* ─── SAFETY GUIDELINES ─── */}
                {/* ═══════════════════════════════════════════════ */}
                <View className="px-4 mt-4 mb-6">
                    <View
                        className="bg-white rounded-2xl p-5 shadow-sm"
                        style={{ elevation: 2 }}>
                        <View className="flex-row items-center mb-4">
                            <Icon name="shield-check" size={22} color="#1e3a8a" />
                            <Text className="text-gray-900 font-bold text-lg ml-2">
                                Safety Guidelines
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold text-sm mb-2">
                                When to Report
                            </Text>
                            {[
                                'Any injury, regardless of severity',
                                'Equipment malfunction or damage',
                                'Facility safety concerns',
                                'Member behavioral issues',
                                'Near-miss incidents',
                            ].map((item, idx) => (
                                <View key={idx} className="flex-row items-start mb-1.5">
                                    <Icon name="circle-small" size={20} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs flex-1">{item}</Text>
                                </View>
                            ))}
                        </View>

                        <View>
                            <Text className="text-gray-700 font-semibold text-sm mb-2">
                                Immediate Actions
                            </Text>
                            {[
                                'Ensure member safety first',
                                'Provide first aid if trained',
                                'Call emergency services if needed',
                                'Secure the area',
                                'Document everything immediately',
                            ].map((item, idx) => (
                                <View key={idx} className="flex-row items-start mb-1.5">
                                    <Icon name="circle-small" size={20} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs flex-1">{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ─── REPORT NEW INCIDENT MODAL (Full Screen ScrollView) ─── */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Modal
                visible={showReportModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowReportModal(false);
                    setFormData(initialFormState);
                }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl max-h-[92%]">
                        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg">
                                    Report New Incident
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowReportModal(false);
                                        setFormData(initialFormState);
                                    }}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Title */}
                            <InputField
                                label="Title"
                                value={formData.title}
                                onChangeText={(val) => handleFormChange('title', val)}
                                placeholder="Brief title for the incident"
                                required
                            />

                            {/* Type & Severity */}
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <SelectorField
                                        label="Incident Type"
                                        value={getTypeLabel(formData.type)}
                                        placeholder="Select type"
                                        onPress={() => setShowTypeModal(true)}
                                        required
                                    />
                                </View>
                                <View className="flex-1">
                                    <SelectorField
                                        label="Severity"
                                        value={getSeverityLabel(formData.severity)}
                                        placeholder="Select severity"
                                        onPress={() => setShowSeverityModal(true)}
                                    />
                                </View>
                            </View>

                            {/* Date & Time */}
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <InputField
                                        label="Date"
                                        value={formData.incidentDate}
                                        onChangeText={(val) => handleFormChange('incidentDate', val)}
                                        placeholder="YYYY-MM-DD"
                                        required
                                    />
                                </View>
                                <View className="flex-1">
                                    <InputField
                                        label="Time"
                                        value={formData.incidentTime}
                                        onChangeText={(val) => handleFormChange('incidentTime', val)}
                                        placeholder="HH:MM"
                                    />
                                </View>
                            </View>

                            {/* Location */}
                            <SelectorField
                                label="Location / Facility"
                                value={
                                    formData.location === 'other'
                                        ? 'Other'
                                        : formData.location || ''
                                }
                                placeholder="Select facility"
                                onPress={() => setShowLocationModal(true)}
                            />
                            {formData.location === 'other' && (
                                <InputField
                                    label="Custom Location"
                                    value={formData.customLocation}
                                    onChangeText={(val) => handleFormChange('customLocation', val)}
                                    placeholder="Specify location..."
                                />
                            )}

                            {/* Involved Members */}
                            <View className="mb-3">
                                <Text className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                                    Involved Members
                                </Text>
                                {/* Selected Tags */}
                                {formData.involvedMembers && formData.involvedMembers.length > 0 && (
                                    <View className="flex-row flex-wrap gap-1.5 mb-2">
                                        {formData.involvedMembers.map((memberId) => {
                                            const member = MOCK_MEMBERS_LIST.find((m) => m._id === memberId);
                                            return (
                                                <View
                                                    key={memberId}
                                                    className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                                    <Text className="text-blue-700 text-xs font-medium mr-1">
                                                        {member ? member.name : memberId}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => handleRemoveMember(memberId)}>
                                                        <Icon name="close" size={12} color="#1d4ed8" />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => setShowMembersModal(true)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
                                    <Text className="text-gray-400 text-sm">
                                        {formData.involvedMembers?.length
                                            ? `${formData.involvedMembers.length} member(s) selected`
                                            : 'Select involved members'}
                                    </Text>
                                    <Icon name="chevron-down" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            {/* Description */}
                            <InputField
                                label="Incident Description"
                                value={formData.description}
                                onChangeText={(val) => handleFormChange('description', val)}
                                placeholder="Describe what happened in detail..."
                                required
                                multiline
                                numberOfLines={4}
                            />

                            {/* Actions Taken */}
                            <InputField
                                label="Immediate Action Taken"
                                value={formData.actionsTaken}
                                onChangeText={(val) => handleFormChange('actionsTaken', val)}
                                placeholder="Describe the immediate response..."
                                multiline
                                numberOfLines={3}
                            />

                            {/* Submit Buttons */}
                            <View className="flex-row gap-3 mt-2 mb-6">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowReportModal(false);
                                        setFormData(initialFormState);
                                    }}
                                    disabled={submitting}
                                    activeOpacity={0.7}
                                    className="flex-1 border border-gray-200 rounded-xl py-3.5 items-center justify-center">
                                    <Text className="text-gray-600 font-semibold text-sm">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSubmitReport}
                                    disabled={submitting}
                                    activeOpacity={0.8}
                                    className="flex-1">
                                    <LinearGradient
                                        colors={submitting ? ['#93c5fd', '#93c5fd'] : ['#1e3a8a', '#3b82f6']}
                                        className="rounded-xl py-3.5 flex-row items-center justify-center">
                                        {submitting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Icon name="send" size={16} color="#fff" />
                                        )}
                                        <Text className="text-white font-bold text-sm ml-2">
                                            {submitting ? 'Submitting...' : 'Submit'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── TYPE SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                title="Select Incident Type">
                {TYPE_OPTIONS.map((opt, index) => (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => {
                            handleFormChange('type', opt.value);
                            setShowTypeModal(false);
                        }}
                        activeOpacity={0.7}
                        className={`flex-row items-center p-4 rounded-xl ${formData.type === opt.value
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-100'
                            } ${index < TYPE_OPTIONS.length - 1 ? 'mb-2' : ''}`}>
                        <View
                            className="w-10 h-10 rounded-full justify-center items-center"
                            style={{
                                backgroundColor: formData.type === opt.value ? '#dbeafe' : '#f3f4f6',
                            }}>
                            <Icon
                                name={getTypeIcon(opt.value)}
                                size={20}
                                color={formData.type === opt.value ? '#2563eb' : '#9ca3af'}
                            />
                        </View>
                        <Text
                            className={`flex-1 ml-3 font-semibold text-sm ${formData.type === opt.value ? 'text-blue-700' : 'text-gray-700'
                                }`}>
                            {opt.label}
                        </Text>
                        {formData.type === opt.value && (
                            <Icon name="check-circle" size={20} color="#2563eb" />
                        )}
                    </TouchableOpacity>
                ))}
            </BottomSheetModal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SEVERITY SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showSeverityModal}
                onClose={() => setShowSeverityModal(false)}
                title="Select Severity">
                {SEVERITY_OPTIONS.map((opt, index) => {
                    const colorConfig = getSeverityColor(opt.value);
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => {
                                handleFormChange('severity', opt.value);
                                setShowSeverityModal(false);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 rounded-xl ${formData.severity === opt.value
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-100'
                                } ${index < SEVERITY_OPTIONS.length - 1 ? 'mb-2' : ''}`}>
                            <View
                                className="w-10 h-10 rounded-full justify-center items-center"
                                style={{ backgroundColor: colorConfig.bg }}>
                                <Icon name="alert-circle" size={20} color={colorConfig.text} />
                            </View>
                            <Text
                                className={`flex-1 ml-3 font-semibold text-sm ${formData.severity === opt.value ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                {opt.label}
                            </Text>
                            {formData.severity === opt.value && (
                                <Icon name="check-circle" size={20} color="#2563eb" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </BottomSheetModal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── LOCATION SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                title="Select Location">
                <ScrollView style={{ maxHeight: 350 }}>
                    {MOCK_FACILITIES.map((facility, index) => (
                        <TouchableOpacity
                            key={facility._id}
                            onPress={() => {
                                handleFormChange('location', facility.name);
                                setShowLocationModal(false);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 rounded-xl ${formData.location === facility.name
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-100'
                                } ${index < MOCK_FACILITIES.length ? 'mb-2' : ''}`}>
                            <Icon
                                name="map-marker"
                                size={20}
                                color={formData.location === facility.name ? '#2563eb' : '#9ca3af'}
                            />
                            <Text
                                className={`flex-1 ml-3 font-semibold text-sm ${formData.location === facility.name ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                {facility.name}
                            </Text>
                            {formData.location === facility.name && (
                                <Icon name="check-circle" size={20} color="#2563eb" />
                            )}
                        </TouchableOpacity>
                    ))}
                    {/* Other Option */}
                    <TouchableOpacity
                        onPress={() => {
                            handleFormChange('location', 'other');
                            setShowLocationModal(false);
                        }}
                        activeOpacity={0.7}
                        className={`flex-row items-center p-4 rounded-xl ${formData.location === 'other'
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-100'
                            }`}>
                        <Icon
                            name="dots-horizontal"
                            size={20}
                            color={formData.location === 'other' ? '#2563eb' : '#9ca3af'}
                        />
                        <Text
                            className={`flex-1 ml-3 font-semibold text-sm ${formData.location === 'other' ? 'text-blue-700' : 'text-gray-700'
                                }`}>
                            Other
                        </Text>
                        {formData.location === 'other' && (
                            <Icon name="check-circle" size={20} color="#2563eb" />
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </BottomSheetModal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── MEMBERS SELECTION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showMembersModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowMembersModal(false);
                    setMemberSearchQuery('');
                }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl max-h-[75%]">
                        <View className="p-5">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg">
                                    Select Members
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMembersModal(false);
                                        setMemberSearchQuery('');
                                    }}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Search */}
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
                                <Icon name="magnify" size={18} color="#9ca3af" />
                                <TextInput
                                    value={memberSearchQuery}
                                    onChangeText={setMemberSearchQuery}
                                    placeholder="Search members..."
                                    placeholderTextColor="#9ca3af"
                                    className="flex-1 ml-2 text-sm text-gray-900 py-0"
                                    autoFocus
                                />
                            </View>

                            {/* Members List */}
                            <ScrollView style={{ maxHeight: 300 }}>
                                {filteredMembersList.length === 0 ? (
                                    <Text className="text-gray-400 text-sm text-center py-6">
                                        No members found
                                    </Text>
                                ) : (
                                    filteredMembersList.map((member) => {
                                        const isSelected = (formData.involvedMembers || []).includes(member._id);
                                        return (
                                            <TouchableOpacity
                                                key={member._id}
                                                onPress={() => handleToggleMember(member._id)}
                                                activeOpacity={0.7}
                                                className={`flex-row items-center p-3.5 rounded-xl mb-1.5 ${isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-100'
                                                    }`}>
                                                <View
                                                    className={`w-6 h-6 rounded-md justify-center items-center mr-3 ${isSelected
                                                        ? 'bg-blue-600'
                                                        : 'border-2 border-gray-300'
                                                        }`}>
                                                    {isSelected && (
                                                        <Icon name="check" size={14} color="#fff" />
                                                    )}
                                                </View>
                                                <View className="flex-1">
                                                    <Text className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                        {member.name || 'Unnamed'}
                                                    </Text>
                                                    {member.email && (
                                                        <Text className="text-gray-400 text-xs mt-0.5">
                                                            {member.email}
                                                        </Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </ScrollView>

                            {/* Done Button */}
                            <TouchableOpacity
                                onPress={() => {
                                    setShowMembersModal(false);
                                    setMemberSearchQuery('');
                                }}
                                activeOpacity={0.8}
                                className="mt-3">
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    className="rounded-xl py-3 items-center justify-center">
                                    <Text className="text-white font-bold text-sm">
                                        Done ({(formData.involvedMembers || []).length} selected)
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FILTER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <ScrollView className="p-5">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg">
                                    Filter Incidents
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Severity Filter */}
                            <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">
                                Severity
                            </Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                <TouchableOpacity
                                    onPress={() => setFilterSeverity('')}
                                    className={`px-3 py-2 rounded-lg border ${!filterSeverity ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <Text className={`text-xs font-semibold ${!filterSeverity ? 'text-blue-700' : 'text-gray-600'}`}>
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {SEVERITY_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        onPress={() => setFilterSeverity(opt.value)}
                                        className={`px-3 py-2 rounded-lg border ${filterSeverity === opt.value ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <Text className={`text-xs font-semibold ${filterSeverity === opt.value ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Status Filter */}
                            <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">
                                Status
                            </Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                <TouchableOpacity
                                    onPress={() => setFilterStatus('')}
                                    className={`px-3 py-2 rounded-lg border ${!filterStatus ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <Text className={`text-xs font-semibold ${!filterStatus ? 'text-blue-700' : 'text-gray-600'}`}>
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {STATUS_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        onPress={() => setFilterStatus(opt.value)}
                                        className={`px-3 py-2 rounded-lg border ${filterStatus === opt.value ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <Text className={`text-xs font-semibold ${filterStatus === opt.value ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Type Filter */}
                            <Text className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">
                                Type
                            </Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                <TouchableOpacity
                                    onPress={() => setFilterType('')}
                                    className={`px-3 py-2 rounded-lg border ${!filterType ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <Text className={`text-xs font-semibold ${!filterType ? 'text-blue-700' : 'text-gray-600'}`}>
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {TYPE_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        onPress={() => setFilterType(opt.value)}
                                        className={`px-3 py-2 rounded-lg border ${filterType === opt.value ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <Text className={`text-xs font-semibold ${filterType === opt.value ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row gap-3 mt-2 mb-4">
                                <TouchableOpacity
                                    onPress={() => {
                                        handleClearFilters();
                                        setShowFilterModal(false);
                                    }}
                                    activeOpacity={0.7}
                                    className="flex-1 border border-gray-200 rounded-xl py-3 items-center justify-center">
                                    <Text className="text-gray-600 font-semibold text-sm">Clear All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
                                    activeOpacity={0.8}
                                    className="flex-1">
                                    <LinearGradient
                                        colors={['#1e3a8a', '#3b82f6']}
                                        className="rounded-xl py-3 items-center justify-center">
                                        <Text className="text-white font-bold text-sm">Apply Filters</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── VIEW DETAILS MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showViewModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowViewModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl max-h-[90%]">
                        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-900 font-bold text-lg flex-1 mr-2">
                                    Incident Details
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowViewModal(false)}
                                    className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {selectedIncident && (
                                <>
                                    {/* Title & Status */}
                                    <View className="flex-row items-center flex-wrap mb-3">
                                        <Text className="text-gray-900 font-bold text-base mr-2">
                                            {selectedIncident.title || `${selectedIncident.type} Incident`}
                                        </Text>
                                        <BadgePill
                                            label={selectedIncident.status}
                                            colorConfig={getStatusColor(selectedIncident.status)}
                                        />
                                    </View>

                                    {/* Info Grid */}
                                    <View className="bg-gray-50 rounded-xl p-4 mb-4">
                                        <View className="flex-row mb-3">
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs mb-1">Date & Time</Text>
                                                <Text className="text-gray-900 font-medium text-sm">
                                                    {formatDate(selectedIncident.incidentDate)}{' '}
                                                    {formatTime(selectedIncident.incidentDate)}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs mb-1">Severity</Text>
                                                <BadgePill
                                                    label={selectedIncident.severity}
                                                    colorConfig={getSeverityColor(selectedIncident.severity)}
                                                />
                                            </View>
                                        </View>
                                        <View className="flex-row mb-3">
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs mb-1">Type</Text>
                                                <Text className="text-gray-900 font-medium text-sm capitalize">
                                                    {selectedIncident.type}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs mb-1">Location</Text>
                                                <Text className="text-gray-900 font-medium text-sm">
                                                    {selectedIncident.location || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                        {selectedIncident.reportedBy && (
                                            <View className="mb-1">
                                                <Text className="text-gray-400 text-xs mb-1">Reported By</Text>
                                                <Text className="text-gray-900 font-medium text-sm">
                                                    {selectedIncident.reportedBy.name || selectedIncident.reportedBy.email || 'Unknown'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Involved Members */}
                                    {selectedIncident.involvedMembers && selectedIncident.involvedMembers.length > 0 && (
                                        <View className="mb-4">
                                            <Text className="text-gray-700 font-semibold text-sm mb-2">
                                                Involved Members
                                            </Text>
                                            <View className="flex-row flex-wrap gap-1.5">
                                                {selectedIncident.involvedMembers.map((member, idx) => (
                                                    <View
                                                        key={idx}
                                                        className="bg-gray-100 rounded-full px-3 py-1.5">
                                                        <Text className="text-gray-700 text-xs font-medium">
                                                            {member.name || member.email}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Description */}
                                    <View className="mb-4">
                                        <Text className="text-gray-700 font-semibold text-sm mb-2">
                                            Description
                                        </Text>
                                        <Text className="text-gray-500 text-sm leading-5">
                                            {selectedIncident.description}
                                        </Text>
                                    </View>

                                    {/* Actions Taken */}
                                    {selectedIncident.actionsTaken ? (
                                        <View className="mb-4">
                                            <Text className="text-gray-700 font-semibold text-sm mb-2">
                                                Actions Taken
                                            </Text>
                                            <Text className="text-gray-500 text-sm leading-5">
                                                {selectedIncident.actionsTaken}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Resolved Date */}
                                    {selectedIncident.resolvedDate ? (
                                        <View className="mb-4">
                                            <Text className="text-gray-700 font-semibold text-sm mb-1">
                                                Resolved Date
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                {formatDate(selectedIncident.resolvedDate)}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Timestamps */}
                                    <View className="border-t border-gray-100 pt-3 mb-4">
                                        <Text className="text-gray-400 text-xs">
                                            Created: {formatDate(selectedIncident.createdAt)}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            Updated: {formatDate(selectedIncident.updatedAt)}
                                        </Text>
                                    </View>
                                </>
                            )}

                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={() => setShowViewModal(false)}
                                activeOpacity={0.7}
                                className="border border-gray-200 rounded-xl py-3 items-center justify-center mb-6">
                                <Text className="text-gray-600 font-semibold text-sm">Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RESOLVE MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                title="Resolve Incident">
                {selectedIncident && (
                    <Text className="text-gray-400 text-sm mb-3">
                        Resolving:{' '}
                        <Text className="text-gray-700 font-medium">
                            {selectedIncident.title || `${selectedIncident.type} Incident`}
                        </Text>
                    </Text>
                )}
                <InputField
                    label="Resolution Notes"
                    value={resolveNote}
                    onChangeText={setResolveNote}
                    placeholder="Describe the resolution and final actions taken..."
                    multiline
                    numberOfLines={4}
                />
                <View className="flex-row gap-3 mt-2">
                    <TouchableOpacity
                        onPress={() => setShowResolveModal(false)}
                        disabled={submitting}
                        activeOpacity={0.7}
                        className="flex-1 border border-gray-200 rounded-xl py-3 items-center justify-center">
                        <Text className="text-gray-600 font-semibold text-sm">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmitResolve}
                        disabled={submitting}
                        activeOpacity={0.8}
                        className="flex-1">
                        <LinearGradient
                            colors={submitting ? ['#86efac', '#86efac'] : ['#16a34a', '#22c55e']}
                            className="rounded-xl py-3 flex-row items-center justify-center">
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Icon name="check-circle" size={16} color="#fff" />
                            )}
                            <Text className="text-white font-bold text-sm ml-2">
                                {submitting ? 'Resolving...' : 'Mark Resolved'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </BottomSheetModal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DELETE CONFIRMATION MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Incident">
                <View className="items-center py-4">
                    <View className="w-16 h-16 rounded-full bg-red-50 justify-center items-center mb-3">
                        <Icon name="trash-can-outline" size={32} color="#ef4444" />
                    </View>
                    <Text className="text-gray-500 text-sm text-center mb-1">
                        Are you sure you want to delete this incident report?
                    </Text>
                    <Text className="text-gray-400 text-xs text-center mb-2">
                        This action cannot be undone.
                    </Text>
                    {selectedIncident && (
                        <Text className="text-gray-900 font-semibold text-sm text-center">
                            {selectedIncident.title || `${selectedIncident.type} Incident`}
                        </Text>
                    )}
                </View>
                <View className="flex-row gap-3 mt-2">
                    <TouchableOpacity
                        onPress={() => setShowDeleteConfirm(false)}
                        disabled={submitting}
                        activeOpacity={0.7}
                        className="flex-1 border border-gray-200 rounded-xl py-3 items-center justify-center">
                        <Text className="text-gray-600 font-semibold text-sm">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleConfirmDelete}
                        disabled={submitting}
                        activeOpacity={0.8}
                        className="flex-1 bg-red-500 rounded-xl py-3 flex-row items-center justify-center">
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Icon name="trash-can" size={16} color="#fff" />
                        )}
                        <Text className="text-white font-bold text-sm ml-2">
                            {submitting ? 'Deleting...' : 'Delete'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetModal>
        </View>
    );
};

export default IncidentReportsScreen;