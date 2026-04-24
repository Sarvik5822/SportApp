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
            return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', gradient: ['#dc2626', '#ef4444'], icon: 'alert-octagon' };
        case 'high':
            return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca', gradient: ['#ef4444', '#f87171'], icon: 'alert-circle' };
        case 'medium':
            return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', gradient: ['#f59e0b', '#fbbf24'], icon: 'alert' };
        case 'low':
            return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', gradient: ['#22c55e', '#4ade80'], icon: 'information' };
        default:
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', gradient: ['#6b7280', '#9ca3af'], icon: 'help-circle' };
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'open':
            return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', gradient: ['#f59e0b', '#d97706'], icon: 'clock-outline' };
        case 'investigating':
            return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', gradient: ['#3b82f6', '#60a5fa'], icon: 'magnify' };
        case 'resolved':
            return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', gradient: ['#22c55e', '#16a34a'], icon: 'check-circle' };
        case 'closed':
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', gradient: ['#6b7280', '#9ca3af'], icon: 'lock' };
        default:
            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', gradient: ['#6b7280', '#9ca3af'], icon: 'help-circle' };
    }
};

const getTypeConfig = (type) => {
    switch (type) {
        case 'injury':
            return { icon: 'bandage', color: '#ef4444', gradient: ['#ef4444', '#f97316'], label: 'Injury' };
        case 'equipment':
            return { icon: 'wrench', color: '#3b82f6', gradient: ['#3b82f6', '#06b6d4'], label: 'Equipment' };
        case 'safety':
            return { icon: 'shield-alert', color: '#f59e0b', gradient: ['#f59e0b', '#d97706'], label: 'Safety' };
        case 'behavior':
            return { icon: 'account-alert', color: '#8b5cf6', gradient: ['#8b5cf6', '#6366f1'], label: 'Behavioral' };
        default:
            return { icon: 'alert-circle', color: '#6b7280', gradient: ['#6b7280', '#9ca3af'], label: 'Other' };
    }
};

// ─── Filter Chip Component (matching MembersScreen/SessionsScreen) ───
const FilterChip = ({ label, isSelected, onPress, count }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
            backgroundColor: isSelected ? '#1e3a8a' : '#fff',
            borderWidth: isSelected ? 0 : 1,
            borderColor: '#e5e7eb',
            flexDirection: 'row',
            alignItems: 'center',
            elevation: isSelected ? 3 : 1,
            shadowColor: isSelected ? '#1e3a8a' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.3 : 0.05,
            shadowRadius: 4,
        }}>
        <Text
            style={{
                fontSize: 13,
                fontWeight: '600',
                color: isSelected ? '#fff' : '#6b7280',
                textTransform: 'capitalize',
            }}>
            {label}
        </Text>
        {count !== undefined && count > 0 && (
            <View
                style={{
                    marginLeft: 6,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    minWidth: 20,
                    alignItems: 'center',
                }}>
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: isSelected ? '#fff' : '#9ca3af',
                    }}>
                    {count}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

// ─── Section Card (matching CreateEditSessionScreen) ───
const SectionCard = ({ title, icon, iconColor = '#1e3a8a', children, rightAction }) => (
    <View
        className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm"
        style={{ elevation: 3 }}>
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                <View
                    className="w-9 h-9 rounded-xl justify-center items-center mr-2.5"
                    style={{ backgroundColor: `${iconColor}12` }}>
                    <Icon name={icon} size={18} color={iconColor} />
                </View>
                <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            </View>
            {rightAction}
        </View>
        {children}
    </View>
);

// ─── Field Label (matching CreateEditSessionScreen) ───
const FieldLabel = ({ label, required }) => (
    <View className="flex-row items-center mb-1.5">
        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            {label}
        </Text>
        {required && <Text className="text-red-500 text-xs ml-0.5">*</Text>}
    </View>
);

// ─── Bottom Sheet Modal Wrapper (enhanced) ───
const BottomSheetModal = ({ visible, onClose, title, children }) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl max-h-[85%]">
                <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3" />
                <View className="p-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="w-9 h-9 rounded-xl bg-blue-50 justify-center items-center mr-2.5">
                                <Icon name="format-list-bulleted" size={18} color="#1e3a8a" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg">
                                {title}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-9 h-9 bg-gray-100 rounded-xl justify-center items-center">
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

// ─── Selector Field Component (enhanced) ───
const SelectorField = ({ label, value, placeholder, onPress, required, icon }) => (
    <View className="mb-3">
        <FieldLabel label={label} required={required} />
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5"
            style={{ elevation: 1 }}>
            <View className="flex-row items-center flex-1">
                {icon && (
                    <Icon name={icon} size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                )}
                <Text
                    className={`text-sm flex-1 ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
                    numberOfLines={1}>
                    {value || placeholder}
                </Text>
            </View>
            <Icon name="chevron-down" size={20} color="#9ca3af" />
        </TouchableOpacity>
    </View>
);

// ─── Input Field Component (enhanced) ───
const InputField = ({ label, value, onChangeText, placeholder, required, multiline, numberOfLines }) => (
    <View className="mb-3">
        <FieldLabel label={label} required={required} />
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
            className={`bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 font-medium ${multiline ? 'py-3 min-h-[100px]' : 'py-3.5'
                }`}
            style={{ elevation: 1 }}
        />
    </View>
);

// ═══════════════════════════════════════════════
// ─── INCIDENT CARD (matching SessionCard pattern) ───
// ═══════════════════════════════════════════════
const IncidentCard = ({ incident, onView, onResolve, onDelete }) => {
    const severityColor = getSeverityColor(incident.severity);
    const statusColor = getStatusColor(incident.status);
    const typeConfig = getTypeConfig(incident.type);
    const dateObj = incident.incidentDate ? new Date(incident.incidentDate) : null;
    const canResolve = incident.status !== 'resolved' && incident.status !== 'closed';

    return (
        <View
            className="bg-white rounded-2xl mb-3 mx-4 shadow-sm overflow-hidden"
            style={{ elevation: 4 }}>
            {/* Top Color Accent Bar */}
            <LinearGradient
                colors={typeConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 4 }}
            />

            <View className="p-4">
                {/* Top Row: Type Icon + Info + Date Badge */}
                <View className="flex-row items-start">
                    {/* Type Icon Badge */}
                    <LinearGradient
                        colors={typeConfig.gradient}
                        className="w-14 h-14 rounded-2xl justify-center items-center"
                        style={{ borderRadius: 16 }}>
                        <Icon name={typeConfig.icon} size={24} color="#fff" />
                    </LinearGradient>

                    {/* Title & Badges */}
                    <View className="flex-1 ml-3.5 min-w-0">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-900 font-bold text-base flex-1 mr-2" numberOfLines={1}>
                                {incident.title || `${incident.type} Incident`}
                            </Text>
                        </View>

                        {/* Badges Row */}
                        <View className="flex-row flex-wrap items-center mt-1.5" style={{ gap: 4 }}>
                            {/* Severity Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: severityColor.bg }}>
                                <View
                                    className="w-1.5 h-1.5 rounded-full mr-1"
                                    style={{ backgroundColor: severityColor.text }}
                                />
                                <Text
                                    className="text-[10px] font-bold capitalize"
                                    style={{ color: severityColor.text }}>
                                    {incident.severity}
                                </Text>
                            </View>
                            {/* Status Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: statusColor.bg }}>
                                <View
                                    className="w-1.5 h-1.5 rounded-full mr-1"
                                    style={{ backgroundColor: statusColor.text }}
                                />
                                <Text
                                    className="text-[10px] font-bold capitalize"
                                    style={{ color: statusColor.text }}>
                                    {incident.status}
                                </Text>
                            </View>
                            {/* Type Badge */}
                            <View
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: `${typeConfig.color}12` }}>
                                <Icon name={typeConfig.icon} size={10} color={typeConfig.color} />
                                <Text
                                    className="text-[10px] font-bold ml-1"
                                    style={{ color: typeConfig.color }}>
                                    {typeConfig.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Date Badge */}
                    <View className="items-center ml-2 bg-gray-50 rounded-xl px-3 py-2" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <Text className="text-gray-900 font-bold text-lg leading-tight">
                            {dateObj ? dateObj.getDate() : '--'}
                        </Text>
                        <Text className="text-gray-500 text-[10px] font-semibold uppercase">
                            {dateObj
                                ? dateObj.toLocaleDateString('en-US', { month: 'short' })
                                : ''}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                {incident.description ? (
                    <Text
                        className="text-gray-400 text-xs mt-2.5 ml-0.5 leading-4"
                        numberOfLines={2}>
                        {incident.description}
                    </Text>
                ) : null}

                {/* Details Row */}
                <View className="flex-row flex-wrap mt-3 bg-gray-50 rounded-xl p-3" style={{ gap: 2 }}>
                    {/* Time */}
                    <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                        <View className="flex-row items-center">
                            <Icon name="clock-outline" size={14} color="#3b82f6" />
                            <Text className="text-gray-900 font-bold text-xs ml-1" numberOfLines={1}>
                                {formatTime(incident.incidentDate) || 'N/A'}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Time</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    {/* Location */}
                    <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                        <View className="flex-row items-center">
                            <Icon name="map-marker-outline" size={14} color="#22c55e" />
                            <Text className="text-gray-900 font-bold text-xs ml-1" numberOfLines={1}>
                                {incident.location || 'TBD'}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Location</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    {/* Members */}
                    <View className="flex-1 items-center" style={{ minWidth: '22%' }}>
                        <View className="flex-row items-center">
                            <Icon name="account-group-outline" size={14} color="#8b5cf6" />
                            <Text className="text-gray-900 font-bold text-xs ml-1">
                                {incident.involvedMembers?.length || 0}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] mt-0.5">Involved</Text>
                    </View>
                </View>

                {/* Reported By */}
                {incident.reportedBy ? (
                    <View className="flex-row items-center mt-2.5 bg-blue-50 rounded-lg px-3 py-2" style={{ borderWidth: 1, borderColor: '#dbeafe' }}>
                        <Icon name="account-outline" size={14} color="#1e40af" />
                        <Text className="text-blue-800 text-xs ml-1.5 font-medium">
                            Reported by:{' '}
                            <Text className="font-bold">
                                {incident.reportedBy.name || incident.reportedBy.email}
                            </Text>
                        </Text>
                    </View>
                ) : null}

                {/* Involved Members */}
                {incident.involvedMembers && incident.involvedMembers.length > 0 ? (
                    <View className="flex-row flex-wrap items-center mt-2" style={{ gap: 4 }}>
                        {incident.involvedMembers.map((member, idx) => (
                            <View
                                key={idx}
                                className="flex-row items-center px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: '#f3e8ff', borderWidth: 1, borderColor: '#e9d5ff' }}>
                                <Icon name="account" size={10} color="#7c3aed" />
                                <Text className="text-purple-700 text-[10px] font-bold ml-1">
                                    {member.name || member.email}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Actions Taken Preview */}
                {incident.actionsTaken ? (
                    <View className="flex-row items-start mt-2.5 bg-gray-50 rounded-lg px-3 py-2" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                        <Icon name="note-text-outline" size={12} color="#9ca3af" style={{ marginTop: 2 }} />
                        <Text className="text-gray-400 text-[11px] italic ml-1.5 flex-1" numberOfLines={2}>
                            {incident.actionsTaken}
                        </Text>
                    </View>
                ) : null}

                {/* Resolved Date */}
                {incident.resolvedDate ? (
                    <View className="flex-row items-center mt-2.5">
                        <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full" style={{ borderWidth: 1, borderColor: '#bbf7d0' }}>
                            <Icon name="check-circle" size={12} color="#16a34a" />
                            <Text className="text-green-700 text-xs font-bold ml-1">
                                Resolved {formatDate(incident.resolvedDate)}
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* Action Buttons */}
                <View className="flex-row mt-4" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => onView(incident)}
                        activeOpacity={0.8}
                        className="flex-1">
                        <LinearGradient
                            colors={['#1e3a8a', '#3b82f6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 14,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Icon name="eye-outline" size={16} color="#fff" />
                            <Text className="text-white font-bold text-sm ml-1.5">View</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {canResolve && (
                        <TouchableOpacity
                            onPress={() => onResolve(incident)}
                            activeOpacity={0.8}
                            className="flex-1">
                            <LinearGradient
                                colors={['#059669', '#22c55e']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 14,
                                    paddingVertical: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <Icon name="check-circle-outline" size={16} color="#fff" />
                                <Text className="text-white font-bold text-sm ml-1.5">Resolve</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => onDelete(incident)}
                        activeOpacity={0.8}
                        className="flex-1"
                        style={{
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: '#fecaca',
                            backgroundColor: '#fef2f2',
                            paddingVertical: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Icon name="trash-can-outline" size={16} color="#dc2626" />
                        <Text className="text-red-600 font-bold text-sm ml-1.5">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

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

    const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim() !== '';

    // Stats counts
    const openCount = incidents.filter(s => s.status === 'open').length;
    const investigatingCount = incidents.filter(s => s.status === 'investigating').length;
    const resolvedCount = incidents.filter(s => s.status === 'resolved').length;
    const closedCount = incidents.filter(s => s.status === 'closed').length;

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <LinearGradient
                    colors={['#1e3a8a', '#3b82f6']}
                    style={{ width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Icon name="shield-alert" size={32} color="#fff" />
                </LinearGradient>
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text className="text-gray-500 mt-3 font-medium">Loading incidents...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── HEADER (matching Dashboard/Members/Sessions pattern) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                {/* Top Bar */}
                <View className="flex-row justify-between items-center px-5 mb-5">
                    <DrawerMenuButton />
                    <Text className="text-white font-bold text-xl">Incident Reports</Text>
                    <TouchableOpacity
                        onPress={() => setShowFilterModal(true)}
                        className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                        <Icon
                            name={hasActiveFilters ? 'filter-remove' : 'filter-variant'}
                            size={22}
                            color="#fff"
                        />
                        {activeFilterCount > 0 && (
                            <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                <Text className="text-white text-[8px] font-bold">{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Subtitle */}
                <View className="px-5 mb-4">
                    <Text className="text-white/60 text-sm">
                        Report and track safety incidents • {incidents.length} total
                    </Text>
                </View>

                {/* Stats Bar */}
                <View
                    className="mx-5 bg-white/10 rounded-2xl p-4"
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    <View className="flex-row items-center justify-between">
                        {[
                            { label: 'Total', value: incidents.length, icon: 'file-document-outline', color: '#93c5fd' },
                            { label: 'Open', value: openCount, icon: 'alert-circle-outline', color: '#fbbf24' },
                            { label: 'Investigating', value: investigatingCount, icon: 'magnify', color: '#93c5fd' },
                            { label: 'Resolved', value: resolvedCount, icon: 'check-circle', color: '#86efac' },
                        ].map((stat, idx) => (
                            <React.Fragment key={stat.label}>
                                {idx > 0 && <View className="w-px h-12 bg-white/10" />}
                                <View className="items-center flex-1">
                                    <View
                                        className="w-10 h-10 rounded-xl justify-center items-center mb-1.5"
                                        style={{ backgroundColor: `${stat.color}20` }}>
                                        <Icon name={stat.icon} size={18} color={stat.color} />
                                    </View>
                                    <Text className="text-white font-bold text-sm">{stat.value}</Text>
                                    <Text className="text-white/40 text-[10px] mt-0.5">{stat.label}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </LinearGradient>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── SEARCH BAR (floating overlap like MembersScreen) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 -mt-5">
                <View
                    className="bg-white rounded-2xl shadow-md"
                    style={{ elevation: 4 }}>
                    <View className="flex-row items-center px-4">
                        <Icon name="magnify" size={22} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-3.5 px-2.5 text-gray-900 text-sm"
                            placeholder="Search by title, description..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                                <View className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center">
                                    <Icon name="close" size={14} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── FILTER CHIPS (matching SessionsScreen) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <View className="px-4 pt-4 pb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                        {[
                            { value: '', label: 'All', count: incidents.length },
                            { value: 'open', label: 'Open', count: openCount },
                            { value: 'investigating', label: 'Investigating', count: investigatingCount },
                            { value: 'resolved', label: 'Resolved', count: resolvedCount },
                            { value: 'closed', label: 'Closed', count: closedCount },
                        ].map(tab => (
                            <FilterChip
                                key={tab.value}
                                label={tab.label}
                                count={tab.count}
                                isSelected={filterStatus === tab.value}
                                onPress={() => setFilterStatus(tab.value)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Active Filter Tags */}
            {(filterSeverity || filterType) ? (
                <View className="flex-row flex-wrap items-center px-5 pb-2" style={{ gap: 6 }}>
                    {filterSeverity ? (
                        <TouchableOpacity
                            onPress={() => setFilterSeverity('')}
                            className="flex-row items-center bg-blue-50 rounded-full px-2.5 py-1"
                            style={{ borderWidth: 1, borderColor: '#bfdbfe' }}>
                            <Text className="text-blue-700 text-xs font-medium mr-1">
                                {getSeverityLabel(filterSeverity)}
                            </Text>
                            <Icon name="close" size={12} color="#1d4ed8" />
                        </TouchableOpacity>
                    ) : null}
                    {filterType ? (
                        <TouchableOpacity
                            onPress={() => setFilterType('')}
                            className="flex-row items-center bg-blue-50 rounded-full px-2.5 py-1"
                            style={{ borderWidth: 1, borderColor: '#bfdbfe' }}>
                            <Text className="text-blue-700 text-xs font-medium mr-1">
                                {getTypeLabel(filterType)}
                            </Text>
                            <Icon name="close" size={12} color="#1d4ed8" />
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={handleClearFilters}>
                        <Text className="text-red-500 text-xs font-semibold ml-1">Clear All</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Results Count */}
            {hasActiveFilters && (
                <View className="flex-row items-center justify-between px-5 pb-2">
                    <Text className="text-gray-500 text-sm">
                        Found <Text className="text-gray-900 font-bold">{filteredIncidents.length}</Text> of {incidents.length} incidents
                    </Text>
                    <TouchableOpacity onPress={handleClearFilters} activeOpacity={0.7}>
                        <Text className="text-blue-600 text-xs font-semibold">Reset</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── INCIDENTS LIST ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <FlatList
                data={paginatedIncidents}
                renderItem={({ item }) => (
                    <IncidentCard
                        incident={item}
                        onView={handleViewDetails}
                        onResolve={handleOpenResolve}
                        onDelete={handleOpenDelete}
                    />
                )}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1e3a8a']}
                        tintColor="#1e3a8a"
                    />
                }
                ListFooterComponent={
                    totalPages > 1 ? (
                        <View className="flex-row items-center justify-center mx-4 mb-4 mt-2" style={{ gap: 8 }}>
                            {/* Previous Button */}
                            <TouchableOpacity
                                onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                activeOpacity={0.7}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#1e3a8a',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    elevation: currentPage === 1 ? 0 : 3,
                                }}>
                                <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#d1d5db' : '#fff'} />
                            </TouchableOpacity>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <TouchableOpacity
                                    key={page}
                                    onPress={() => setCurrentPage(page)}
                                    activeOpacity={0.7}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: currentPage === page ? '#1e3a8a' : '#fff',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: currentPage === page ? 0 : 1,
                                        borderColor: '#e5e7eb',
                                        elevation: currentPage === page ? 3 : 1,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '700',
                                            color: currentPage === page ? '#fff' : '#6b7280',
                                        }}>
                                        {page}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {/* Next Button */}
                            <TouchableOpacity
                                onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                activeOpacity={0.7}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#1e3a8a',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    elevation: currentPage === totalPages ? 0 : 3,
                                }}>
                                <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#d1d5db' : '#fff'} />
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View className="items-center mt-16 px-6">
                        <View
                            className="w-24 h-24 rounded-full justify-center items-center mb-4"
                            style={{ backgroundColor: '#f0f4ff' }}>
                            <Icon name="shield-alert-outline" size={48} color="#93c5fd" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">
                            No incidents found
                        </Text>
                        <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                            {hasActiveFilters
                                ? 'Try adjusting your search or filters to find incidents'
                                : 'Tap + to report your first incident'}
                        </Text>
                        {hasActiveFilters && (
                            <TouchableOpacity
                                onPress={handleClearFilters}
                                activeOpacity={0.7}
                                className="mt-5">
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        borderRadius: 14,
                                        paddingHorizontal: 24,
                                        paddingVertical: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="filter-remove" size={16} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">
                                        Clear Filters
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />

            {/* Floating Create Button (matching SessionsScreen) */}
            <TouchableOpacity
                onPress={() => setShowReportModal(true)}
                activeOpacity={0.8}
                className="absolute bottom-6 right-6"
                style={{ elevation: 8 }}>
                <LinearGradient
                    colors={['#dc2626', '#ef4444']}
                    className="w-14 h-14 rounded-full justify-center items-center"
                    style={{
                        borderRadius: 28,
                        shadowColor: '#dc2626',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                    }}>
                    <Icon name="plus" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ─── REPORT NEW INCIDENT MODAL (Enhanced with SectionCards) ─── */}
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
                        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3" />
                        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                            {/* Modal Header */}
                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <LinearGradient
                                        colors={['#dc2626', '#ef4444']}
                                        style={{ width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                        <Icon name="shield-alert" size={20} color="#fff" />
                                    </LinearGradient>
                                    <View>
                                        <Text className="text-gray-900 font-bold text-lg">
                                            Report Incident
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            Fill in the details below
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowReportModal(false);
                                        setFormData(initialFormState);
                                    }}
                                    className="w-9 h-9 bg-gray-100 rounded-xl justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* ─── Basic Info Section ─── */}
                            <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-lg bg-red-50 justify-center items-center mr-2">
                                        <Icon name="file-document-edit-outline" size={16} color="#dc2626" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Basic Information</Text>
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
                                <View className="flex-row" style={{ gap: 12 }}>
                                    <View className="flex-1">
                                        <SelectorField
                                            label="Incident Type"
                                            value={getTypeLabel(formData.type)}
                                            placeholder="Select type"
                                            onPress={() => setShowTypeModal(true)}
                                            required
                                            icon="shape"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <SelectorField
                                            label="Severity"
                                            value={getSeverityLabel(formData.severity)}
                                            placeholder="Select severity"
                                            onPress={() => setShowSeverityModal(true)}
                                            icon="alert-circle-outline"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* ─── Date & Location Section ─── */}
                            <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-lg bg-blue-50 justify-center items-center mr-2">
                                        <Icon name="calendar-clock" size={16} color="#3b82f6" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Date & Location</Text>
                                </View>

                                {/* Date & Time */}
                                <View className="flex-row" style={{ gap: 12 }}>
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
                                    icon="map-marker-outline"
                                />
                                {formData.location === 'other' && (
                                    <InputField
                                        label="Custom Location"
                                        value={formData.customLocation}
                                        onChangeText={(val) => handleFormChange('customLocation', val)}
                                        placeholder="Specify location..."
                                    />
                                )}
                            </View>

                            {/* ─── People Section ─── */}
                            <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-lg bg-purple-50 justify-center items-center mr-2">
                                        <Icon name="account-group" size={16} color="#8b5cf6" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Involved Members</Text>
                                </View>

                                {/* Selected Tags */}
                                {formData.involvedMembers && formData.involvedMembers.length > 0 && (
                                    <View className="flex-row flex-wrap mb-2" style={{ gap: 6 }}>
                                        {formData.involvedMembers.map((memberId) => {
                                            const member = MOCK_MEMBERS_LIST.find((m) => m._id === memberId);
                                            return (
                                                <View
                                                    key={memberId}
                                                    className="flex-row items-center bg-purple-50 rounded-full px-3 py-1.5"
                                                    style={{ borderWidth: 1, borderColor: '#e9d5ff' }}>
                                                    <Icon name="account" size={12} color="#7c3aed" />
                                                    <Text className="text-purple-700 text-xs font-bold mx-1.5">
                                                        {member ? member.name : memberId}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => handleRemoveMember(memberId)}>
                                                        <Icon name="close-circle" size={14} color="#7c3aed" />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => setShowMembersModal(true)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5"
                                    style={{ elevation: 1 }}>
                                    <View className="flex-row items-center">
                                        <Icon name="account-plus-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                                        <Text className="text-gray-400 text-sm">
                                            {formData.involvedMembers?.length
                                                ? `${formData.involvedMembers.length} member(s) selected`
                                                : 'Select involved members'}
                                        </Text>
                                    </View>
                                    <Icon name="chevron-down" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            {/* ─── Description Section ─── */}
                            <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-lg bg-amber-50 justify-center items-center mr-2">
                                        <Icon name="text-box-outline" size={16} color="#f59e0b" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Details</Text>
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
                            </View>

                            {/* Submit Buttons */}
                            <View className="flex-row mb-8" style={{ gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowReportModal(false);
                                        setFormData(initialFormState);
                                    }}
                                    disabled={submitting}
                                    activeOpacity={0.7}
                                    className="flex-1"
                                    style={{
                                        borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: '#e5e7eb',
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff',
                                    }}>
                                    <Icon name="close" size={18} color="#6b7280" />
                                    <Text className="text-gray-600 font-bold text-base ml-2">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSubmitReport}
                                    disabled={submitting}
                                    activeOpacity={0.8}
                                    className="flex-1">
                                    <LinearGradient
                                        colors={submitting ? ['#93c5fd', '#93c5fd'] : ['#1e3a8a', '#3b82f6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            borderRadius: 14,
                                            paddingVertical: 14,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        {submitting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Icon name="send" size={18} color="#fff" />
                                        )}
                                        <Text className="text-white font-bold text-base ml-2">
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
                {TYPE_OPTIONS.map((opt, index) => {
                    const config = getTypeConfig(opt.value);
                    const isActive = formData.type === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => {
                                handleFormChange('type', opt.value);
                                setShowTypeModal(false);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 rounded-xl ${index < TYPE_OPTIONS.length - 1 ? 'mb-2' : ''}`}
                            style={{
                                backgroundColor: isActive ? `${config.color}10` : '#f9fafb',
                                borderWidth: 1,
                                borderColor: isActive ? `${config.color}30` : '#f3f4f6',
                            }}>
                            <LinearGradient
                                colors={isActive ? config.gradient : ['#e5e7eb', '#d1d5db']}
                                style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name={config.icon} size={20} color="#fff" />
                            </LinearGradient>
                            <Text
                                className={`flex-1 ml-3 font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {opt.label}
                            </Text>
                            {isActive && (
                                <Icon name="check-circle" size={22} color={config.color} />
                            )}
                        </TouchableOpacity>
                    );
                })}
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
                    const isActive = formData.severity === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => {
                                handleFormChange('severity', opt.value);
                                setShowSeverityModal(false);
                            }}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-4 rounded-xl ${index < SEVERITY_OPTIONS.length - 1 ? 'mb-2' : ''}`}
                            style={{
                                backgroundColor: isActive ? colorConfig.bg : '#f9fafb',
                                borderWidth: 1,
                                borderColor: isActive ? colorConfig.border : '#f3f4f6',
                            }}>
                            <LinearGradient
                                colors={isActive ? colorConfig.gradient : ['#e5e7eb', '#d1d5db']}
                                style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name={colorConfig.icon} size={20} color="#fff" />
                            </LinearGradient>
                            <Text
                                className={`flex-1 ml-3 font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {opt.label}
                            </Text>
                            {isActive && (
                                <Icon name="check-circle" size={22} color={colorConfig.text} />
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
                    {MOCK_FACILITIES.map((facility, index) => {
                        const isActive = formData.location === facility.name;
                        return (
                            <TouchableOpacity
                                key={facility._id}
                                onPress={() => {
                                    handleFormChange('location', facility.name);
                                    setShowLocationModal(false);
                                }}
                                activeOpacity={0.7}
                                className={`flex-row items-center p-4 rounded-xl ${index < MOCK_FACILITIES.length ? 'mb-2' : ''}`}
                                style={{
                                    backgroundColor: isActive ? '#eff6ff' : '#f9fafb',
                                    borderWidth: 1,
                                    borderColor: isActive ? '#bfdbfe' : '#f3f4f6',
                                }}>
                                <View
                                    className="w-10 h-10 rounded-xl justify-center items-center"
                                    style={{ backgroundColor: isActive ? '#dbeafe' : '#f3f4f6' }}>
                                    <Icon
                                        name="map-marker"
                                        size={20}
                                        color={isActive ? '#2563eb' : '#9ca3af'}
                                    />
                                </View>
                                <Text
                                    className={`flex-1 ml-3 font-bold text-sm ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                                    {facility.name}
                                </Text>
                                {isActive && (
                                    <Icon name="check-circle" size={22} color="#2563eb" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                    {/* Other Option */}
                    <TouchableOpacity
                        onPress={() => {
                            handleFormChange('location', 'other');
                            setShowLocationModal(false);
                        }}
                        activeOpacity={0.7}
                        className="flex-row items-center p-4 rounded-xl"
                        style={{
                            backgroundColor: formData.location === 'other' ? '#eff6ff' : '#f9fafb',
                            borderWidth: 1,
                            borderColor: formData.location === 'other' ? '#bfdbfe' : '#f3f4f6',
                        }}>
                        <View
                            className="w-10 h-10 rounded-xl justify-center items-center"
                            style={{ backgroundColor: formData.location === 'other' ? '#dbeafe' : '#f3f4f6' }}>
                            <Icon
                                name="dots-horizontal"
                                size={20}
                                color={formData.location === 'other' ? '#2563eb' : '#9ca3af'}
                            />
                        </View>
                        <Text
                            className={`flex-1 ml-3 font-bold text-sm ${formData.location === 'other' ? 'text-blue-700' : 'text-gray-600'}`}>
                            Other
                        </Text>
                        {formData.location === 'other' && (
                            <Icon name="check-circle" size={22} color="#2563eb" />
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
                        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3" />
                        <View className="p-5">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-xl bg-purple-50 justify-center items-center mr-2.5">
                                        <Icon name="account-group" size={18} color="#8b5cf6" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Select Members
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowMembersModal(false);
                                        setMemberSearchQuery('');
                                    }}
                                    className="w-9 h-9 bg-gray-100 rounded-xl justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Search */}
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3" style={{ elevation: 1 }}>
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
                                    <View className="items-center py-8">
                                        <Icon name="account-search" size={40} color="#d1d5db" />
                                        <Text className="text-gray-400 text-sm text-center mt-2">
                                            No members found
                                        </Text>
                                    </View>
                                ) : (
                                    filteredMembersList.map((member) => {
                                        const isSelected = (formData.involvedMembers || []).includes(member._id);
                                        return (
                                            <TouchableOpacity
                                                key={member._id}
                                                onPress={() => handleToggleMember(member._id)}
                                                activeOpacity={0.7}
                                                className="flex-row items-center p-3.5 rounded-xl mb-1.5"
                                                style={{
                                                    backgroundColor: isSelected ? '#f3e8ff' : '#f9fafb',
                                                    borderWidth: 1,
                                                    borderColor: isSelected ? '#e9d5ff' : '#f3f4f6',
                                                }}>
                                                <View
                                                    className="w-7 h-7 rounded-lg justify-center items-center mr-3"
                                                    style={{
                                                        backgroundColor: isSelected ? '#8b5cf6' : '#fff',
                                                        borderWidth: isSelected ? 0 : 2,
                                                        borderColor: '#d1d5db',
                                                    }}>
                                                    {isSelected && (
                                                        <Icon name="check" size={14} color="#fff" />
                                                    )}
                                                </View>
                                                <View className="flex-1">
                                                    <Text className={`font-bold text-sm ${isSelected ? 'text-purple-800' : 'text-gray-700'}`}>
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
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    <Icon name="check-circle" size={18} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">
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
            {/* ─── FILTER MODAL (Enhanced) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3" />
                        <ScrollView className="p-5">
                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-xl bg-blue-50 justify-center items-center mr-2.5">
                                        <Icon name="filter-variant" size={18} color="#1e3a8a" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-lg">
                                        Filter Incidents
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
                                    className="w-9 h-9 bg-gray-100 rounded-xl justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {/* Severity Filter */}
                            <View className="mb-4">
                                <View className="flex-row items-center mb-2.5">
                                    <View className="w-7 h-7 rounded-lg bg-red-50 justify-center items-center mr-2">
                                        <Icon name="alert-circle" size={14} color="#ef4444" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Severity</Text>
                                </View>
                                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setFilterSeverity('')}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 12,
                                            backgroundColor: !filterSeverity ? '#1e3a8a' : '#f9fafb',
                                            borderWidth: !filterSeverity ? 0 : 1,
                                            borderColor: '#e5e7eb',
                                        }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            color: !filterSeverity ? '#fff' : '#6b7280',
                                        }}>All</Text>
                                    </TouchableOpacity>
                                    {SEVERITY_OPTIONS.map((opt) => {
                                        const isActive = filterSeverity === opt.value;
                                        const color = getSeverityColor(opt.value);
                                        return (
                                            <TouchableOpacity
                                                key={opt.value}
                                                onPress={() => setFilterSeverity(opt.value)}
                                                style={{
                                                    paddingHorizontal: 14,
                                                    paddingVertical: 8,
                                                    borderRadius: 12,
                                                    backgroundColor: isActive ? color.bg : '#f9fafb',
                                                    borderWidth: 1,
                                                    borderColor: isActive ? color.border : '#e5e7eb',
                                                }}>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontWeight: '700',
                                                    color: isActive ? color.text : '#6b7280',
                                                }}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Status Filter */}
                            <View className="mb-4">
                                <View className="flex-row items-center mb-2.5">
                                    <View className="w-7 h-7 rounded-lg bg-blue-50 justify-center items-center mr-2">
                                        <Icon name="progress-check" size={14} color="#3b82f6" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Status</Text>
                                </View>
                                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setFilterStatus('')}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 12,
                                            backgroundColor: !filterStatus ? '#1e3a8a' : '#f9fafb',
                                            borderWidth: !filterStatus ? 0 : 1,
                                            borderColor: '#e5e7eb',
                                        }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            color: !filterStatus ? '#fff' : '#6b7280',
                                        }}>All</Text>
                                    </TouchableOpacity>
                                    {STATUS_OPTIONS.map((opt) => {
                                        const isActive = filterStatus === opt.value;
                                        const color = getStatusColor(opt.value);
                                        return (
                                            <TouchableOpacity
                                                key={opt.value}
                                                onPress={() => setFilterStatus(opt.value)}
                                                style={{
                                                    paddingHorizontal: 14,
                                                    paddingVertical: 8,
                                                    borderRadius: 12,
                                                    backgroundColor: isActive ? color.bg : '#f9fafb',
                                                    borderWidth: 1,
                                                    borderColor: isActive ? color.border : '#e5e7eb',
                                                }}>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontWeight: '700',
                                                    color: isActive ? color.text : '#6b7280',
                                                }}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Type Filter */}
                            <View className="mb-4">
                                <View className="flex-row items-center mb-2.5">
                                    <View className="w-7 h-7 rounded-lg bg-amber-50 justify-center items-center mr-2">
                                        <Icon name="shape" size={14} color="#f59e0b" />
                                    </View>
                                    <Text className="text-gray-900 font-bold text-sm">Type</Text>
                                </View>
                                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setFilterType('')}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 12,
                                            backgroundColor: !filterType ? '#1e3a8a' : '#f9fafb',
                                            borderWidth: !filterType ? 0 : 1,
                                            borderColor: '#e5e7eb',
                                        }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            color: !filterType ? '#fff' : '#6b7280',
                                        }}>All</Text>
                                    </TouchableOpacity>
                                    {TYPE_OPTIONS.map((opt) => {
                                        const isActive = filterType === opt.value;
                                        const config = getTypeConfig(opt.value);
                                        return (
                                            <TouchableOpacity
                                                key={opt.value}
                                                onPress={() => setFilterType(opt.value)}
                                                style={{
                                                    paddingHorizontal: 14,
                                                    paddingVertical: 8,
                                                    borderRadius: 12,
                                                    backgroundColor: isActive ? `${config.color}10` : '#f9fafb',
                                                    borderWidth: 1,
                                                    borderColor: isActive ? `${config.color}30` : '#e5e7eb',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}>
                                                <Icon name={config.icon} size={12} color={isActive ? config.color : '#9ca3af'} style={{ marginRight: 4 }} />
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontWeight: '700',
                                                    color: isActive ? config.color : '#6b7280',
                                                }}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row mt-2 mb-6" style={{ gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        handleClearFilters();
                                        setShowFilterModal(false);
                                    }}
                                    activeOpacity={0.7}
                                    className="flex-1"
                                    style={{
                                        borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: '#e5e7eb',
                                        paddingVertical: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#fff',
                                    }}>
                                    <Icon name="filter-remove" size={18} color="#6b7280" />
                                    <Text className="text-gray-600 font-bold text-sm ml-2">Clear All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
                                    activeOpacity={0.8}
                                    className="flex-1">
                                    <LinearGradient
                                        colors={['#1e3a8a', '#3b82f6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            borderRadius: 14,
                                            paddingVertical: 14,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <Icon name="check" size={18} color="#fff" />
                                        <Text className="text-white font-bold text-sm ml-2">Apply Filters</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        <View className="h-6" />
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── VIEW DETAILS MODAL (Enhanced) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showViewModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowViewModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl max-h-[90%]">
                        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3" />
                        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View className="flex-row items-center justify-between mb-5">
                                <View className="flex-row items-center flex-1 mr-2">
                                    {selectedIncident && (
                                        <LinearGradient
                                            colors={getTypeConfig(selectedIncident.type).gradient}
                                            style={{ width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                            <Icon name={getTypeConfig(selectedIncident.type).icon} size={20} color="#fff" />
                                        </LinearGradient>
                                    )}
                                    <Text className="text-gray-900 font-bold text-lg flex-1">
                                        Incident Details
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowViewModal(false)}
                                    className="w-9 h-9 bg-gray-100 rounded-xl justify-center items-center">
                                    <Icon name="close" size={18} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            {selectedIncident && (
                                <>
                                    {/* Title & Badges */}
                                    <View className="mb-4">
                                        <Text className="text-gray-900 font-bold text-xl mb-2">
                                            {selectedIncident.title || `${selectedIncident.type} Incident`}
                                        </Text>
                                        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                                            <View
                                                className="flex-row items-center px-3 py-1.5 rounded-full"
                                                style={{ backgroundColor: getStatusColor(selectedIncident.status).bg }}>
                                                <Icon name={getStatusColor(selectedIncident.status).icon} size={12} color={getStatusColor(selectedIncident.status).text} />
                                                <Text className="text-xs font-bold capitalize ml-1" style={{ color: getStatusColor(selectedIncident.status).text }}>
                                                    {selectedIncident.status}
                                                </Text>
                                            </View>
                                            <View
                                                className="flex-row items-center px-3 py-1.5 rounded-full"
                                                style={{ backgroundColor: getSeverityColor(selectedIncident.severity).bg }}>
                                                <Icon name={getSeverityColor(selectedIncident.severity).icon} size={12} color={getSeverityColor(selectedIncident.severity).text} />
                                                <Text className="text-xs font-bold capitalize ml-1" style={{ color: getSeverityColor(selectedIncident.severity).text }}>
                                                    {selectedIncident.severity}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Info Grid */}
                                    <View className="bg-gray-50 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                        <View className="flex-row mb-3.5">
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Icon name="calendar" size={12} color="#3b82f6" />
                                                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider ml-1">Date & Time</Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-sm">
                                                    {formatDate(selectedIncident.incidentDate)}{' '}
                                                    {formatTime(selectedIncident.incidentDate)}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Icon name="shape" size={12} color="#8b5cf6" />
                                                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider ml-1">Type</Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-sm capitalize">
                                                    {selectedIncident.type}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row mb-3.5">
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Icon name="map-marker" size={12} color="#22c55e" />
                                                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider ml-1">Location</Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-sm">
                                                    {selectedIncident.location || 'N/A'}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Icon name="account" size={12} color="#f59e0b" />
                                                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider ml-1">Reported By</Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-sm">
                                                    {selectedIncident.reportedBy?.name || selectedIncident.reportedBy?.email || 'Unknown'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Involved Members */}
                                    {selectedIncident.involvedMembers && selectedIncident.involvedMembers.length > 0 && (
                                        <View className="mb-4">
                                            <View className="flex-row items-center mb-2">
                                                <View className="w-7 h-7 rounded-lg bg-purple-50 justify-center items-center mr-2">
                                                    <Icon name="account-group" size={14} color="#8b5cf6" />
                                                </View>
                                                <Text className="text-gray-900 font-bold text-sm">Involved Members</Text>
                                            </View>
                                            <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                                                {selectedIncident.involvedMembers.map((member, idx) => (
                                                    <View
                                                        key={idx}
                                                        className="flex-row items-center px-3 py-2 rounded-xl"
                                                        style={{ backgroundColor: '#f3e8ff', borderWidth: 1, borderColor: '#e9d5ff' }}>
                                                        <Icon name="account" size={14} color="#7c3aed" />
                                                        <Text className="text-purple-700 text-xs font-bold ml-1.5">
                                                            {member.name || member.email}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Description */}
                                    <View className="mb-4">
                                        <View className="flex-row items-center mb-2">
                                            <View className="w-7 h-7 rounded-lg bg-blue-50 justify-center items-center mr-2">
                                                <Icon name="text-box" size={14} color="#3b82f6" />
                                            </View>
                                            <Text className="text-gray-900 font-bold text-sm">Description</Text>
                                        </View>
                                        <View className="bg-gray-50 rounded-xl p-3.5" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                            <Text className="text-gray-600 text-sm leading-5">
                                                {selectedIncident.description}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Actions Taken */}
                                    {selectedIncident.actionsTaken ? (
                                        <View className="mb-4">
                                            <View className="flex-row items-center mb-2">
                                                <View className="w-7 h-7 rounded-lg bg-green-50 justify-center items-center mr-2">
                                                    <Icon name="check-decagram" size={14} color="#22c55e" />
                                                </View>
                                                <Text className="text-gray-900 font-bold text-sm">Actions Taken</Text>
                                            </View>
                                            <View className="bg-green-50 rounded-xl p-3.5" style={{ borderWidth: 1, borderColor: '#bbf7d0' }}>
                                                <Text className="text-green-800 text-sm leading-5">
                                                    {selectedIncident.actionsTaken}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : null}

                                    {/* Resolved Date */}
                                    {selectedIncident.resolvedDate ? (
                                        <View className="flex-row items-center mb-4 bg-green-50 rounded-xl px-4 py-3" style={{ borderWidth: 1, borderColor: '#bbf7d0' }}>
                                            <Icon name="check-circle" size={18} color="#16a34a" />
                                            <View className="ml-2.5">
                                                <Text className="text-green-800 text-xs font-bold">Resolved</Text>
                                                <Text className="text-green-700 text-sm font-medium">
                                                    {formatDate(selectedIncident.resolvedDate)}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : null}

                                    {/* Timestamps */}
                                    <View className="bg-gray-50 rounded-xl p-3.5 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                        <View className="flex-row items-center mb-1">
                                            <Icon name="clock-outline" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1.5">
                                                Created: {formatDate(selectedIncident.createdAt)}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Icon name="update" size={12} color="#9ca3af" />
                                            <Text className="text-gray-400 text-xs ml-1.5">
                                                Updated: {formatDate(selectedIncident.updatedAt)}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={() => setShowViewModal(false)}
                                activeOpacity={0.7}
                                className="mb-6"
                                style={{
                                    borderRadius: 14,
                                    borderWidth: 1.5,
                                    borderColor: '#e5e7eb',
                                    paddingVertical: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#fff',
                                }}>
                                <Icon name="close" size={18} color="#6b7280" />
                                <Text className="text-gray-600 font-bold text-base ml-2">Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── RESOLVE MODAL (Enhanced) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                title="Resolve Incident">
                {selectedIncident && (
                    <View className="flex-row items-center bg-amber-50 rounded-xl px-3.5 py-3 mb-4" style={{ borderWidth: 1, borderColor: '#fde68a' }}>
                        <Icon name="information-outline" size={16} color="#92400e" />
                        <Text className="text-amber-800 text-xs ml-2 flex-1">
                            Resolving:{' '}
                            <Text className="font-bold">
                                {selectedIncident.title || `${selectedIncident.type} Incident`}
                            </Text>
                        </Text>
                    </View>
                )}
                <InputField
                    label="Resolution Notes"
                    value={resolveNote}
                    onChangeText={setResolveNote}
                    placeholder="Describe the resolution and final actions taken..."
                    multiline
                    numberOfLines={4}
                />
                <View className="flex-row mt-2" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => setShowResolveModal(false)}
                        disabled={submitting}
                        activeOpacity={0.7}
                        className="flex-1"
                        style={{
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: '#e5e7eb',
                            paddingVertical: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                        }}>
                        <Icon name="close" size={18} color="#6b7280" />
                        <Text className="text-gray-600 font-bold text-sm ml-2">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmitResolve}
                        disabled={submitting}
                        activeOpacity={0.8}
                        className="flex-1">
                        <LinearGradient
                            colors={submitting ? ['#86efac', '#86efac'] : ['#059669', '#22c55e']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 14,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Icon name="check-circle" size={18} color="#fff" />
                            )}
                            <Text className="text-white font-bold text-sm ml-2">
                                {submitting ? 'Resolving...' : 'Mark Resolved'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </BottomSheetModal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DELETE CONFIRMATION MODAL (Enhanced) ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <BottomSheetModal
                visible={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Incident">
                <View className="items-center py-4">
                    <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4" style={{ borderWidth: 2, borderColor: '#fecaca' }}>
                        <Icon name="trash-can-outline" size={36} color="#ef4444" />
                    </View>
                    <Text className="text-gray-900 font-bold text-base text-center mb-1">
                        Delete this incident report?
                    </Text>
                    <Text className="text-gray-400 text-xs text-center mb-3 px-4">
                        This action cannot be undone. The incident report will be permanently removed.
                    </Text>
                    {selectedIncident && (
                        <View className="bg-red-50 rounded-xl px-4 py-2.5" style={{ borderWidth: 1, borderColor: '#fecaca' }}>
                            <Text className="text-red-700 font-bold text-sm text-center">
                                {selectedIncident.title || `${selectedIncident.type} Incident`}
                            </Text>
                        </View>
                    )}
                </View>
                <View className="flex-row mt-2" style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => setShowDeleteConfirm(false)}
                        disabled={submitting}
                        activeOpacity={0.7}
                        className="flex-1"
                        style={{
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: '#e5e7eb',
                            paddingVertical: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                        }}>
                        <Icon name="close" size={18} color="#6b7280" />
                        <Text className="text-gray-600 font-bold text-sm ml-2">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleConfirmDelete}
                        disabled={submitting}
                        activeOpacity={0.8}
                        className="flex-1">
                        <LinearGradient
                            colors={submitting ? ['#fca5a5', '#fca5a5'] : ['#dc2626', '#ef4444']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                borderRadius: 14,
                                paddingVertical: 14,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Icon name="trash-can" size={18} color="#fff" />
                            )}
                            <Text className="text-white font-bold text-sm ml-2">
                                {submitting ? 'Deleting...' : 'Delete'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </BottomSheetModal>
        </View>
    );
};

export default IncidentReportsScreen;