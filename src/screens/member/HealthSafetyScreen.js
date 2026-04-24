import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    RefreshControl,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DrawerMenuButton from '../../components/DrawerMenuButton';
import {
    MOCK_HEALTH_RECORDS,
    MOCK_WAIVER_DATA,
    DOCUMENT_TYPES,
} from '../../data/healthSafety';

// ─── Helper Functions ───
const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

};

const getStatusConfig = status => {
    const map = {
        approved: { label: 'Valid', bg: '#dcfce7', text: '#166534', icon: 'check-circle', iconColor: '#059669', gradient: ['#059669', '#34d399'] },
        valid: { label: 'Valid', bg: '#dcfce7', text: '#166534', icon: 'check-circle', iconColor: '#059669', gradient: ['#059669', '#34d399'] },
        pending: { label: 'Pending', bg: '#fef3c7', text: '#92400e', icon: 'clock-outline', iconColor: '#f59e0b', gradient: ['#d97706', '#f59e0b'] },
        rejected: { label: 'Rejected', bg: '#fee2e2', text: '#991b1b', icon: 'close-circle', iconColor: '#ef4444', gradient: ['#dc2626', '#ef4444'] },
        expired: { label: 'Expired', bg: '#fee2e2', text: '#991b1b', icon: 'alert-circle', iconColor: '#ef4444', gradient: ['#dc2626', '#ef4444'] },
    };
    return map[status] || { label: status, bg: '#f3f4f6', text: '#374151', icon: 'help-circle', iconColor: '#6b7280', gradient: ['#6b7280', '#9ca3af'] };
};

const getDocTypeConfig = type => {
    const found = DOCUMENT_TYPES.find(d => d.value === type);
    if (!found) return { label: type?.replace(/_/g, ' ') || 'Document', icon: 'file-document', gradient: ['#6b7280', '#9ca3af'] };
    const colorMap = {
        medical_certificate: ['#2563eb', '#3b82f6'],
        fitness_assessment: ['#059669', '#10b981'],
        vaccination_record: ['#7c3aed', '#8b5cf6'],
        insurance: ['#dc2626', '#ef4444'],
        doctor_clearance: ['#0891b2', '#06b6d4'],
        blood_test: ['#db2777', '#ec4899'],
        other: ['#6b7280', '#9ca3af'],
    };
    return { label: found.label, icon: found.icon, gradient: colorMap[type] || ['#6b7280', '#9ca3af'] };
};

// ═══════════════════════════════════════════════
// ─── SECTION TITLE COMPONENT ───
// ═══════════════════════════════════════════════
const SectionTitle = ({ title, icon, onViewAll, iconColor = '#059669' }) => (
    <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg justify-center items-center mr-2.5" style={{ backgroundColor: `${iconColor}15` }}>
                <Icon name={icon} size={16} color={iconColor} />
            </View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
        </View>
        {onViewAll && (
            <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-600 font-semibold text-xs">View All</Text>
                <Icon name="chevron-right" size={14} color="#059669" />
            </TouchableOpacity>
        )}
    </View>
);

// ═══════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════
const HealthSafetyScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [healthRecords, setHealthRecords] = useState([]);
    const [waiverData, setWaiverData] = useState(null);

    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState('file');
    const [uploadForm, setUploadForm] = useState({ type: '', description: '', documentUrl: '', expiryDate: '' });
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    // Waiver modal state
    const [showWaiverModal, setShowWaiverModal] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);

    // Document viewer modal state
    const [showDocViewer, setShowDocViewer] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);

    // ─── Fetch ───
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            setHealthRecords(MOCK_HEALTH_RECORDS);
            setWaiverData(MOCK_WAIVER_DATA);
        } catch (error) {
            Alert.alert('Error', 'Failed to load health data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

    // ─── Derived Data ───
    const hasSignedWaiver = waiverData?.hasAcknowledged || (waiverData?.waivers && waiverData.waivers.length > 0);
    const latestWaiver = waiverData?.waivers?.[waiverData.waivers.length - 1];
    const validCount = healthRecords.filter(r => r.status === 'approved' || r.status === 'valid').length;
    const pendingCount = healthRecords.filter(r => r.status === 'pending').length;
    const expiredCount = healthRecords.filter(r => r.status === 'expired').length;

    // ─── Stats Config ───
    const statsConfig = [
        { label: 'Total Docs', value: healthRecords.length.toString(), icon: 'file-document-multiple', gradient: ['#2563eb', '#3b82f6'] },
        { label: 'Valid', value: validCount.toString(), icon: 'check-decagram', gradient: ['#059669', '#34d399'] },
        { label: 'Pending', value: pendingCount.toString(), icon: 'clock-outline', gradient: ['#d97706', '#f59e0b'] },
        { label: 'Expired', value: expiredCount.toString(), icon: 'alert-circle', gradient: ['#dc2626', '#ef4444'] },
    ];

    // ─── Upload Handlers ───
    const handleUpload = async () => {
        if (!uploadForm.type) { Alert.alert('Error', 'Please select document type'); return; }
        if (!uploadForm.description.trim()) { Alert.alert('Error', 'Please enter a description'); return; }
        if (uploadMode === 'url' && !uploadForm.documentUrl.trim()) { Alert.alert('Error', 'Please enter a document URL'); return; }
        if (uploadMode === 'file') { Alert.alert('Info', 'File picker would open here in production. Using URL mode for demo.'); return; }

        try {
            setUploading(true);
            await new Promise(resolve => setTimeout(resolve, 1200));
            const newRecord = {
                _id: `hr${Date.now()}`, type: uploadForm.type, description: uploadForm.description,
                status: 'pending', documentUrl: uploadForm.documentUrl || '',
                fileName: uploadForm.documentUrl ? uploadForm.documentUrl.split('/').pop() : 'uploaded_document',
                expiryDate: uploadForm.expiryDate || null, createdAt: new Date().toISOString(),
            };
            setHealthRecords(prev => [newRecord, ...prev]);
            Alert.alert('Success', 'Health record uploaded successfully!');
            setShowUploadModal(false);
            resetUploadForm();
        } catch (error) { Alert.alert('Error', 'Failed to upload record'); } finally { setUploading(false); }
    };

    const resetUploadForm = () => { setUploadForm({ type: '', description: '', documentUrl: '', expiryDate: '' }); setUploadMode('file'); };

    // ─── Waiver Handler ───
    const handleAcknowledgeWaiver = async () => {
        try {
            setAcknowledging(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setWaiverData({ hasAcknowledged: true, waivers: [{ waiverId: 'standard-waiver-v2', signature: 'acknowledged', acknowledgedAt: new Date().toISOString() }] });
            Alert.alert('Success', 'Liability waiver signed successfully!');
            setShowWaiverModal(false);
        } catch (error) { Alert.alert('Error', 'Failed to sign waiver'); } finally { setAcknowledging(false); }
    };

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <View className="w-16 h-16 rounded-2xl bg-emerald-50 justify-center items-center mb-4">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
                <Text className="text-gray-900 font-bold text-base">Loading Health Data</Text>
                <Text className="text-gray-400 mt-1 text-sm">Fetching your records...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} tintColor="#059669" />}>

                {/* ═══════════════════════════════════════ */}
                {/* ─── HEADER ─── */}
                {/* ═══════════════════════════════════════ */}
                <LinearGradient colors={['#064e3b', '#059669', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                    {/* Top Bar */}
                    <View className="flex-row justify-between items-center px-5 mb-5">
                        <DrawerMenuButton />
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.navigate('Announcements')} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center mr-2">
                                <Icon name="bell-outline" size={22} color="#fff" />
                                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full justify-center items-center">
                                    <Text className="text-white text-[8px] font-bold">1</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onRefresh} className="w-10 h-10 bg-white/15 rounded-full justify-center items-center">
                                <Icon name="refresh" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <View className="px-5 mb-5">
                        <Text className="text-white/60 text-sm font-medium">Manage your</Text>
                        <Text className="text-white font-bold text-2xl mt-0.5">Health & Safety</Text>
                        <Text className="text-white/50 text-xs mt-1">Keep your medical records and waivers up to date</Text>
                    </View>

                    {/* Summary Glass Card */}
                    <View className="mx-5 bg-white/10 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-11 h-11 bg-yellow-400/20 rounded-xl justify-center items-center">
                                    <Icon name="shield-check" size={22} color="#fbbf24" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-sm">
                                        {healthRecords.length} Document{healthRecords.length !== 1 ? 's' : ''} on File
                                    </Text>
                                    <Text className="text-white/50 text-xs mt-0.5">
                                        {hasSignedWaiver ? 'Waiver signed ✅' : 'Waiver pending ⚠️'}
                                    </Text>
                                </View>
                            </View>
                            <View className={`px-4 py-2 rounded-xl flex-row items-center ${hasSignedWaiver ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                                <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
                                <Text className="text-white font-bold text-xs">
                                    {hasSignedWaiver ? 'Complete' : 'Action Needed'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* ═══════════════════════════════════════ */}
                {/* ─── STATS GRID ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 -mt-5">
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                        {statsConfig.map(stat => (
                            <View key={stat.label} style={{ width: '50%', padding: 4 }}>
                                <View className="bg-white rounded-2xl p-4 shadow-md" style={{ elevation: 4 }}>
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</Text>
                                            <Text className="text-gray-900 font-bold text-3xl mt-1">{stat.value}</Text>
                                        </View>
                                        <LinearGradient colors={stat.gradient} className="w-11 h-11 rounded-xl justify-center items-center" style={{ borderRadius: 12 }}>
                                            <Icon name={stat.icon} size={20} color="#fff" />
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── LIABILITY WAIVER PROMINENT CARD ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-5">
                    <TouchableOpacity onPress={() => setShowWaiverModal(true)} activeOpacity={0.85}>
                        <LinearGradient
                            colors={hasSignedWaiver ? ['#064e3b', '#059669'] : ['#7f1d1d', '#dc2626']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 20, padding: 20 }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <Icon name={hasSignedWaiver ? 'shield-check' : 'shield-alert'} size={20} color={hasSignedWaiver ? '#6ee7b7' : '#fca5a5'} />
                                    <Text className="text-white font-bold text-base ml-2">
                                        {hasSignedWaiver ? 'Waiver Signed' : 'Action Required'}
                                    </Text>
                                </View>
                                {hasSignedWaiver && (
                                    <View className="bg-emerald-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                                        <Text className="text-emerald-300 text-xs font-bold">Verified</Text>
                                    </View>
                                )}
                                {!hasSignedWaiver && (
                                    <View className="bg-red-400/20 px-3 py-1.5 rounded-full flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-red-400 mr-1.5 animate-pulse" />
                                        <Text className="text-red-300 text-xs font-bold">Pending</Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 rounded-2xl justify-center items-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                        <Icon name={hasSignedWaiver ? 'check-decagram' : 'file-sign'} size={28} color="#fff" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        {hasSignedWaiver && latestWaiver ? (
                                            <View>
                                                <Text className="text-white font-bold text-sm">All set!</Text>
                                                <Text className="text-white/60 text-xs mt-0.5">Signed on {formatDate(latestWaiver.acknowledgedAt)}</Text>
                                            </View>
                                        ) : (
                                            <View>
                                                <Text className="text-white font-bold text-sm">Review & Sign</Text>
                                                <Text className="text-white/60 text-xs mt-0.5">Required to use facilities</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <LinearGradient
                                    colors={hasSignedWaiver ? ['#34d399', '#6ee7b7'] : ['#ef4444', '#dc2626']}
                                    style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name={hasSignedWaiver ? 'eye' : 'file-sign'} size={16} color="#fff" />
                                    <Text className="text-white font-bold text-xs ml-1.5">{hasSignedWaiver ? 'View' : 'Sign Now'}</Text>
                                </LinearGradient>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── MEDICAL DOCUMENTS SECTION ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle
                        title="Medical Documents"
                        icon="file-document-multiple"
                        iconColor="#2563eb"
                        onViewAll={() => { }}
                    />

                    {healthRecords.length === 0 ? (
                        <View className="bg-white rounded-2xl p-10 items-center shadow-sm" style={{ elevation: 2 }}>
                            <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
                                <Icon name="file-document-outline" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-700 font-bold text-lg">No documents yet</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1.5 max-w-[260px]">Upload your medical certificates and fitness assessments</Text>
                            <TouchableOpacity onPress={() => setShowUploadModal(true)} activeOpacity={0.8} className="mt-5">
                                <LinearGradient colors={['#059669', '#10b981']} className="rounded-xl px-6 py-3.5 flex-row items-center shadow-sm" style={{ elevation: 3 }}>
                                    <Icon name="upload" size={18} color="#fff" />
                                    <Text className="text-white font-bold ml-2">Upload First Document</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            {/* Upload Button Row */}
                            <TouchableOpacity onPress={() => setShowUploadModal(true)} activeOpacity={0.8} className="mb-4">
                                <LinearGradient colors={['#059669', '#10b981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-2xl py-3.5 flex-row items-center justify-center shadow-sm" style={{ elevation: 3 }}>
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text className="text-white font-bold text-sm ml-2">Upload New Document</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Document Cards */}
                            {healthRecords.map(doc => {
                                const statusCfg = getStatusConfig(doc.status);
                                const typeCfg = getDocTypeConfig(doc.type);
                                const isExpired = doc.status === 'expired';
                                const isRejected = doc.status === 'rejected';
                                return (
                                    <View
                                        key={doc._id}
                                        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                                        style={{
                                            elevation: 2,
                                            borderLeftWidth: 4,
                                            borderLeftColor: statusCfg.iconColor,
                                        }}>
                                        <View className="flex-row items-start">
                                            <LinearGradient colors={typeCfg.gradient} className="w-12 h-12 rounded-xl justify-center items-center" style={{ borderRadius: 14 }}>
                                                <Icon name={typeCfg.icon} size={22} color="#fff" />
                                            </LinearGradient>
                                            <View className="flex-1 ml-3">
                                                <View className="flex-row items-center justify-between">
                                                    <Text className="text-gray-900 font-bold text-sm flex-1 mr-2" numberOfLines={1}>{typeCfg.label}</Text>
                                                    <View className="px-2.5 py-1 rounded-full flex-row items-center" style={{ backgroundColor: statusCfg.bg }}>
                                                        <Icon name={statusCfg.icon} size={10} color={statusCfg.iconColor} />
                                                        <Text className="text-[10px] font-bold ml-1" style={{ color: statusCfg.text }}>{statusCfg.label}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-gray-500 text-xs mt-1 leading-4" numberOfLines={2}>{doc.description}</Text>
                                                {doc.fileName && (
                                                    <View className="flex-row items-center mt-1.5">
                                                        <Icon name="paperclip" size={11} color="#3b82f6" />
                                                        <Text className="text-blue-600 text-[11px] ml-1 font-medium" numberOfLines={1}>{doc.fileName}</Text>
                                                    </View>
                                                )}
                                                <View className="flex-row items-center mt-2 flex-wrap gap-x-4">
                                                    <View className="flex-row items-center">
                                                        <Icon name="calendar" size={11} color="#9ca3af" />
                                                        <Text className="text-gray-400 text-[11px] ml-1">{new Date(doc.createdAt).toLocaleDateString()}</Text>
                                                    </View>
                                                    {doc.expiryDate && (
                                                        <View className="flex-row items-center">
                                                            <Icon name="calendar-clock" size={11} color={isExpired ? '#ef4444' : '#9ca3af'} />
                                                            <Text className={`text-[11px] ml-1 ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                                                                Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        {doc.documentUrl && (
                                            <View className="flex-row mt-3 pt-3 border-t border-gray-100" style={{ gap: 8 }}>
                                                <TouchableOpacity
                                                    onPress={() => { setViewingDoc(doc); setShowDocViewer(true); }}
                                                    className="flex-1 flex-row items-center justify-center py-2.5 bg-blue-50 rounded-xl"
                                                    style={{ borderWidth: 1, borderColor: '#dbeafe' }}>
                                                    <Icon name="eye" size={15} color="#2563eb" />
                                                    <Text className="text-blue-700 font-bold text-xs ml-1.5">View</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => Linking.openURL(doc.documentUrl).catch(() => Alert.alert('Error', 'Cannot open this document'))}
                                                    className="flex-1 flex-row items-center justify-center py-2.5 bg-gray-50 rounded-xl"
                                                    style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                                    <Icon name="open-in-new" size={15} color="#6b7280" />
                                                    <Text className="text-gray-700 font-bold text-xs ml-1.5">Open</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── WAIVER INFO SECTION ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle title="About Liability Waiver" icon="information-outline" iconColor="#0891b2" />
                    <View className="bg-white rounded-2xl p-5 shadow-md" style={{ elevation: 3 }}>
                        <View className="flex-row items-start">
                            <View className="w-11 h-11 rounded-xl justify-center items-center" style={{ backgroundColor: '#0891b215' }}>
                                <Icon name="shield-question" size={22} color="#0891b2" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-900 font-bold text-sm mb-2">What is a Liability Waiver?</Text>
                                <Text className="text-gray-500 text-xs leading-5 mb-3">
                                    A legal document acknowledging that sports activities involve certain risks. By signing, you confirm:
                                </Text>
                                {[
                                    { icon: 'hand-wave', text: 'Voluntary participation in activities' },
                                    { icon: 'alert-outline', text: 'Physical activities carry injury risk' },
                                    { icon: 'shield-off-outline', text: 'Club not liable for injuries' },
                                    { icon: 'heart-pulse', text: 'You are physically fit to participate' },
                                ].map((item, i) => (
                                    <View key={i} className="flex-row items-center py-1.5">
                                        <View className="w-6 h-6 rounded-md justify-center items-center" style={{ backgroundColor: '#0891b212' }}>
                                            <Icon name={item.icon} size={13} color="#0891b2" />
                                        </View>
                                        <Text className="text-gray-600 text-xs ml-2.5 font-medium">{item.text}</Text>
                                    </View>
                                ))}
                                <Text className="text-gray-400 text-[10px] italic mt-3 leading-4">
                                    This is standard practice followed by most sports clubs and gyms worldwide.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════ */}
                {/* ─── SAFETY TIPS SECTION ─── */}
                {/* ═══════════════════════════════════════ */}
                <View className="px-4 mt-6">
                    <SectionTitle title="Safety Tips" icon="lightbulb-on" iconColor="#f59e0b" />
                    {[
                        { icon: 'water', title: 'Stay Hydrated', desc: 'Drink water before, during, and after exercise', gradient: ['#2563eb', '#3b82f6'] },
                        { icon: 'run-fast', title: 'Warm Up Properly', desc: 'Always warm up for 5-10 minutes before intense activity', gradient: ['#d97706', '#f59e0b'] },
                        { icon: 'shield-alert', title: 'Use Protective Gear', desc: 'Wear appropriate safety equipment for your sport', gradient: ['#dc2626', '#ef4444'] },
                        { icon: 'hospital-box', title: 'Report Injuries', desc: 'Inform staff immediately if you get injured', gradient: ['#059669', '#10b981'] },
                    ].map((tip, index) => (
                        <View key={index} className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm" style={{ elevation: 2 }}>
                            <LinearGradient colors={tip.gradient} className="w-12 h-12 rounded-xl justify-center items-center" style={{ borderRadius: 14 }}>
                                <Icon name={tip.icon} size={22} color="#fff" />
                            </LinearGradient>
                            <View className="flex-1 ml-3.5">
                                <Text className="text-gray-900 font-bold text-sm">{tip.title}</Text>
                                <Text className="text-gray-500 text-xs mt-0.5 leading-4">{tip.desc}</Text>
                            </View>
                            <Icon name="chevron-right" size={18} color="#d1d5db" />
                        </View>
                    ))}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── UPLOAD DOCUMENT MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showUploadModal} transparent animationType="slide" onRequestClose={() => !uploading && setShowUploadModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-1">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl justify-center items-center">
                                    <Icon name="file-upload" size={22} color="#059669" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold text-lg">Upload Document</Text>
                                    <Text className="text-gray-400 text-xs">Medical certificate or fitness assessment</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => { if (!uploading) { setShowUploadModal(false); resetUploadForm(); } }} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                            {/* Type Selector */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Document Type *</Text>
                            <TouchableOpacity onPress={() => setShowTypeSelector(!showTypeSelector)} className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between mb-1" style={{ borderWidth: 1.5, borderColor: uploadForm.type ? '#059669' : '#e5e7eb' }}>
                                <View className="flex-row items-center">
                                    {uploadForm.type ? (
                                        <LinearGradient colors={getDocTypeConfig(uploadForm.type).gradient} className="w-8 h-8 rounded-lg justify-center items-center" style={{ borderRadius: 8 }}>
                                            <Icon name={getDocTypeConfig(uploadForm.type).icon} size={16} color="#fff" />
                                        </LinearGradient>
                                    ) : (
                                        <View className="w-8 h-8 rounded-lg bg-gray-200 justify-center items-center">
                                            <Icon name="file-question" size={16} color="#9ca3af" />
                                        </View>
                                    )}
                                    <Text className={`ml-2.5 text-sm ${uploadForm.type ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                                        {uploadForm.type ? getDocTypeConfig(uploadForm.type).label : 'Select type...'}
                                    </Text>
                                </View>
                                <Icon name={showTypeSelector ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
                            </TouchableOpacity>

                            {showTypeSelector && (
                                <View className="bg-white border border-gray-200 rounded-2xl mb-3 overflow-hidden shadow-sm" style={{ elevation: 2 }}>
                                    {DOCUMENT_TYPES.map((docType, index) => {
                                        const tc = getDocTypeConfig(docType.value);
                                        const isSelected = uploadForm.type === docType.value;
                                        return (
                                            <TouchableOpacity key={docType.value} onPress={() => { setUploadForm(prev => ({ ...prev, type: docType.value })); setShowTypeSelector(false); }} className={`flex-row items-center p-3.5 ${index < DOCUMENT_TYPES.length - 1 ? 'border-b border-gray-100' : ''} ${isSelected ? 'bg-emerald-50' : ''}`} activeOpacity={0.7}>
                                                <LinearGradient colors={tc.gradient} className="w-8 h-8 rounded-lg justify-center items-center" style={{ borderRadius: 8 }}>
                                                    <Icon name={tc.icon} size={15} color="#fff" />
                                                </LinearGradient>
                                                <Text className={`ml-3 text-sm flex-1 ${isSelected ? 'text-emerald-700 font-bold' : 'text-gray-700 font-medium'}`}>{docType.label}</Text>
                                                {isSelected && <Icon name="check" size={18} color="#059669" />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {!showTypeSelector && <View className="h-2" />}

                            {/* Description */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Description *</Text>
                            <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 text-sm mb-4" placeholder="Describe this document..." placeholderTextColor="#9ca3af" value={uploadForm.description} onChangeText={text => setUploadForm(prev => ({ ...prev, description: text }))} multiline numberOfLines={3} textAlignVertical="top" style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }} />

                            {/* Upload Mode */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Upload Method</Text>
                            <View className="flex-row mb-4" style={{ gap: 8 }}>
                                {[
                                    { key: 'file', icon: 'cellphone', label: 'From Device' },
                                    { key: 'url', icon: 'link-variant', label: 'Paste URL' },
                                ].map(mode => {
                                    const isActive = uploadMode === mode.key;
                                    return (
                                        <TouchableOpacity key={mode.key} onPress={() => setUploadMode(mode.key)} className="flex-1 flex-row items-center justify-center py-3 rounded-2xl" style={{ borderWidth: 2, borderColor: isActive ? '#059669' : '#e5e7eb', backgroundColor: isActive ? '#ecfdf5' : '#fff' }} activeOpacity={0.7}>
                                            <Icon name={mode.icon} size={18} color={isActive ? '#059669' : '#6b7280'} />
                                            <Text className={`ml-2 font-bold text-xs ${isActive ? 'text-emerald-700' : 'text-gray-600'}`}>{mode.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {uploadMode === 'file' && (
                                <View className="bg-gray-50 rounded-2xl p-5 mb-4" style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderStyle: 'dashed' }}>
                                    <View className="items-center">
                                        <View className="w-16 h-16 bg-gray-200 rounded-2xl justify-center items-center mb-3">
                                            <Icon name="cloud-upload" size={32} color="#9ca3af" />
                                        </View>
                                        <Text className="text-gray-500 text-sm text-center font-medium">File picker available in production</Text>
                                        <Text className="text-gray-400 text-[10px] mt-1 text-center">PDF, JPG, PNG, Word • Max 5MB</Text>
                                        <View className="bg-blue-50 px-3 py-1.5 rounded-lg mt-2.5">
                                            <Text className="text-blue-600 text-[10px] font-bold">Use "Paste URL" for demo →</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {uploadMode === 'url' && (
                                <View className="mb-4">
                                    <Text className="text-gray-900 font-bold text-sm mb-2">Document URL *</Text>
                                    <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 text-sm" placeholder="https://... (Google Drive, Dropbox)" placeholderTextColor="#9ca3af" value={uploadForm.documentUrl} onChangeText={text => setUploadForm(prev => ({ ...prev, documentUrl: text }))} autoCapitalize="none" keyboardType="url" style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }} />
                                </View>
                            )}

                            {/* Expiry */}
                            <Text className="text-gray-900 font-bold text-sm mb-2">Expiry Date <Text className="text-gray-400 font-normal">(Optional)</Text></Text>
                            <TextInput className="bg-gray-50 rounded-2xl p-4 text-gray-900 text-sm mb-2" placeholder="YYYY-MM-DD (e.g., 2027-03-15)" placeholderTextColor="#9ca3af" value={uploadForm.expiryDate} onChangeText={text => setUploadForm(prev => ({ ...prev, expiryDate: text }))} keyboardType="numbers-and-punctuation" style={{ borderWidth: 1.5, borderColor: '#e5e7eb' }} />
                        </ScrollView>

                        {/* Footer */}
                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={() => { setShowUploadModal(false); resetUploadForm(); }} disabled={uploading} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center', opacity: uploading ? 0.5 : 1 }}>
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpload} disabled={uploading} activeOpacity={0.8} className="flex-1">
                                <LinearGradient colors={uploading ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']} style={{ borderRadius: 14, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    {uploading ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /> : <Icon name="upload" size={18} color="#fff" style={{ marginRight: 8 }} />}
                                    <Text className="text-white font-bold text-sm">{uploading ? 'Uploading...' : 'Upload'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DOCUMENT VIEWER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showDocViewer} transparent animationType="slide" onRequestClose={() => { setShowDocViewer(false); setViewingDoc(null); }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View className="w-10 h-10 bg-blue-100 rounded-xl justify-center items-center">
                                    <Icon name="file-eye" size={22} color="#2563eb" />
                                </View>
                                <Text className="text-gray-900 font-bold text-lg ml-3" numberOfLines={1}>{viewingDoc ? getDocTypeConfig(viewingDoc.type).label : 'Document'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => { setShowDocViewer(false); setViewingDoc(null); }} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {viewingDoc && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Doc Info Card */}
                                <View className="bg-gray-50 rounded-2xl p-4 mb-5" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                    <View className="flex-row items-center mb-4">
                                        <LinearGradient colors={getDocTypeConfig(viewingDoc.type).gradient} className="w-14 h-14 rounded-2xl justify-center items-center" style={{ borderRadius: 16 }}>
                                            <Icon name={getDocTypeConfig(viewingDoc.type).icon} size={26} color="#fff" />
                                        </LinearGradient>
                                        <View className="ml-3.5 flex-1">
                                            <Text className="text-gray-900 font-bold text-base">{getDocTypeConfig(viewingDoc.type).label}</Text>
                                            <View className="flex-row items-center mt-1.5">
                                                {(() => {
                                                    const s = getStatusConfig(viewingDoc.status); return (
                                                        <View className="px-2.5 py-1 rounded-full flex-row items-center" style={{ backgroundColor: s.bg }}>
                                                            <Icon name={s.icon} size={11} color={s.iconColor} />
                                                            <Text className="text-[10px] font-bold ml-1" style={{ color: s.text }}>{s.label}</Text>
                                                        </View>
                                                    );
                                                })()}
                                            </View>
                                        </View>
                                    </View>

                                    {[
                                        { label: 'Description', value: viewingDoc.description, icon: 'text', color: '#6b7280' },
                                        { label: 'File Name', value: viewingDoc.fileName, icon: 'paperclip', color: '#2563eb' },
                                        { label: 'Uploaded', value: new Date(viewingDoc.createdAt).toLocaleDateString(), icon: 'calendar', color: '#059669' },
                                        { label: 'Expires', value: viewingDoc.expiryDate ? new Date(viewingDoc.expiryDate).toLocaleDateString() : 'No expiry', icon: 'calendar-clock', color: '#d97706' },
                                    ].map((item, i) => (
                                        <View key={i} className={`flex-row items-center py-3 ${i < 3 ? 'border-b border-gray-100' : ''}`}>
                                            <View className="w-9 h-9 rounded-lg justify-center items-center" style={{ backgroundColor: `${item.color}12` }}>
                                                <Icon name={item.icon} size={15} color={item.color} />
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{item.label}</Text>
                                                <Text className="text-gray-900 text-sm font-semibold mt-0.5">{item.value || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Actions */}
                                <View className="flex-row" style={{ gap: 10 }}>
                                    <TouchableOpacity onPress={() => { if (viewingDoc.documentUrl) Linking.openURL(viewingDoc.documentUrl).catch(() => Alert.alert('Error', 'Cannot open')); }} className="flex-1 flex-row items-center justify-center py-3.5 bg-blue-50 rounded-2xl" style={{ borderWidth: 1.5, borderColor: '#dbeafe' }}>
                                        <Icon name="download" size={18} color="#2563eb" />
                                        <Text className="text-blue-700 font-bold text-sm ml-2">Download</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { if (viewingDoc.documentUrl) Linking.openURL(viewingDoc.documentUrl).catch(() => Alert.alert('Error', 'Cannot open')); }} className="flex-1 flex-row items-center justify-center py-3.5 bg-gray-50 rounded-2xl" style={{ borderWidth: 1.5, borderColor: '#f3f4f6' }}>
                                        <Icon name="open-in-new" size={18} color="#6b7280" />
                                        <Text className="text-gray-700 font-bold text-sm ml-2">Open in Browser</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}

                        <TouchableOpacity onPress={() => { setShowDocViewer(false); setViewingDoc(null); }} className="mt-4" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 14, alignItems: 'center' }}>
                            <Text className="text-gray-700 font-bold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── WAIVER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal visible={showWaiverModal} transparent animationType="slide" onRequestClose={() => !acknowledging && setShowWaiverModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-1">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-emerald-100 rounded-xl justify-center items-center">
                                    <Icon name="shield-check" size={22} color="#059669" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold text-lg">Liability Waiver</Text>
                                    <Text className="text-gray-400 text-xs">Read carefully and sign to acknowledge</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => !acknowledging && setShowWaiverModal(false)} className="w-9 h-9 bg-gray-100 rounded-full justify-center items-center">
                                <Icon name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                            {/* Waiver Text */}
                            <View className="bg-gray-50 rounded-2xl p-5 mb-4" style={{ borderWidth: 1, borderColor: '#f3f4f6' }}>
                                <Text className="text-gray-900 font-bold text-base mb-3">ASSUMPTION OF RISK AND WAIVER OF LIABILITY</Text>
                                <Text className="text-gray-600 text-sm leading-6 mb-3">
                                    I acknowledge that participation in sports and fitness activities involves inherent risks, including but not limited to physical injury, illness, or property damage. I voluntarily assume all such risks associated with my participation.
                                </Text>
                                <Text className="text-gray-600 text-sm leading-6 mb-3">
                                    I hereby release, waive, and discharge the facility, its owners, employees, and agents from any and all liability for injuries or damages that may occur during my use of the facilities or participation in activities.
                                </Text>
                                <Text className="text-gray-600 text-sm leading-6 mb-3">
                                    I certify that I am in good physical condition and have no medical conditions that would prevent safe participation in physical activities. I agree to follow all facility rules and safety guidelines.
                                </Text>
                                <View className="flex-row items-center mt-2 pt-2 border-t border-gray-200">
                                    <Icon name="file-document-clock" size={14} color="#9ca3af" />
                                    <Text className="text-gray-400 text-[10px] ml-1.5">Version 2.0 • Last Updated: January 1, 2026</Text>
                                </View>
                            </View>

                            {/* Simple Explanation */}
                            <View className="bg-emerald-50 rounded-2xl p-4 mb-2" style={{ borderWidth: 1.5, borderColor: '#a7f3d0' }}>
                                <View className="flex-row items-center mb-2">
                                    <View className="w-7 h-7 bg-emerald-100 rounded-lg justify-center items-center">
                                        <Icon name="lightbulb-on-outline" size={15} color="#059669" />
                                    </View>
                                    <Text className="text-emerald-800 font-bold text-sm ml-2">Simple Explanation</Text>
                                </View>
                                <Text className="text-emerald-700 text-xs leading-5">
                                    You understand sports/gym activities involve risks. You're participating voluntarily and won't hold the facility responsible for injuries. You confirm you're healthy and will follow all rules.
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View className="flex-row mt-4" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={() => setShowWaiverModal(false)} disabled={acknowledging} className="flex-1" style={{ borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', paddingVertical: 15, alignItems: 'center', opacity: acknowledging ? 0.5 : 1 }}>
                                <Text className="text-gray-700 font-bold">{hasSignedWaiver ? 'Close' : 'Cancel'}</Text>
                            </TouchableOpacity>
                            {!hasSignedWaiver && (
                                <TouchableOpacity onPress={handleAcknowledgeWaiver} disabled={acknowledging} activeOpacity={0.8} className="flex-1">
                                    <LinearGradient colors={acknowledging ? ['#d1d5db', '#d1d5db'] : ['#059669', '#10b981']} style={{ borderRadius: 14, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        {acknowledging ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} /> : <Icon name="check-decagram" size={18} color="#fff" style={{ marginRight: 8 }} />}
                                        <Text className="text-white font-bold text-sm">{acknowledging ? 'Signing...' : 'I Agree & Sign'}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default HealthSafetyScreen;