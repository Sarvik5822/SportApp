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
import SectionHeader from '../../components/SectionHeader';
import {
    MOCK_HEALTH_RECORDS,
    MOCK_WAIVER_DATA,
    DOCUMENT_TYPES,
} from '../../data/healthSafety';

// ─── Component ───
const HealthSafetyScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [healthRecords, setHealthRecords] = useState([]);
    const [waiverData, setWaiverData] = useState(null);

    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
    const [uploadForm, setUploadForm] = useState({
        type: '',
        description: '',
        documentUrl: '',
        expiryDate: '',
    });
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    // Waiver modal state
    const [showWaiverModal, setShowWaiverModal] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);

    // Document viewer modal state
    const [showDocViewer, setShowDocViewer] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);

    // Fetch data (mock)
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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ─── Upload Handlers ───
    const handleUpload = async () => {
        if (!uploadForm.type) {
            Alert.alert('Error', 'Please select document type');
            return;
        }
        if (!uploadForm.description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }
        if (uploadMode === 'url' && !uploadForm.documentUrl.trim()) {
            Alert.alert('Error', 'Please enter a document URL');
            return;
        }
        if (uploadMode === 'file') {
            Alert.alert('Info', 'File picker would open here in production. Using URL mode for demo.');
            return;
        }

        try {
            setUploading(true);
            await new Promise(resolve => setTimeout(resolve, 1200));

            const newRecord = {
                _id: `hr${Date.now()}`,
                type: uploadForm.type,
                description: uploadForm.description,
                status: 'pending',
                documentUrl: uploadForm.documentUrl || '',
                fileName: uploadForm.documentUrl
                    ? uploadForm.documentUrl.split('/').pop()
                    : 'uploaded_document',
                expiryDate: uploadForm.expiryDate || null,
                createdAt: new Date().toISOString(),
            };

            setHealthRecords(prev => [newRecord, ...prev]);
            Alert.alert('Success', 'Health record uploaded successfully!');
            setShowUploadModal(false);
            resetUploadForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to upload record');
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setUploadForm({ type: '', description: '', documentUrl: '', expiryDate: '' });
        setUploadMode('file');
    };

    // ─── Waiver Handler ───
    const handleAcknowledgeWaiver = async () => {
        try {
            setAcknowledging(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setWaiverData({
                hasAcknowledged: true,
                waivers: [
                    {
                        waiverId: 'standard-waiver-v2',
                        signature: 'acknowledged',
                        acknowledgedAt: new Date().toISOString(),
                    },
                ],
            });
            Alert.alert('Success', 'Liability waiver signed successfully!');
            setShowWaiverModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to sign waiver');
        } finally {
            setAcknowledging(false);
        }
    };

    // ─── Helpers ───
    const getStatusConfig = status => {
        switch (status) {
            case 'approved':
            case 'valid':
                return { label: 'Valid', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'check-circle', iconColor: '#059669' };
            case 'pending':
                return { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'clock-outline', iconColor: '#f59e0b' };
            case 'rejected':
                return { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle', iconColor: '#ef4444' };
            case 'expired':
                return { label: 'Expired', bg: 'bg-red-100', text: 'text-red-700', icon: 'alert-circle', iconColor: '#ef4444' };
            default:
                return { label: status, bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help-circle', iconColor: '#6b7280' };
        }
    };

    const getDocTypeLabel = type => {
        const found = DOCUMENT_TYPES.find(d => d.value === type);
        return found ? found.label : type?.replace(/_/g, ' ') || 'Document';
    };

    const getDocTypeIcon = type => {
        const found = DOCUMENT_TYPES.find(d => d.value === type);
        return found ? found.icon : 'file-document';
    };

    const hasSignedWaiver =
        waiverData?.hasAcknowledged ||
        (waiverData?.waivers && waiverData.waivers.length > 0);
    const latestWaiver =
        waiverData?.waivers?.[waiverData.waivers.length - 1];

    // ─── Loading State ───
    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
                <Text className="text-gray-500 mt-3">Loading health data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#059669']}
                />
            }>
            {/* ─── Header ─── */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                className="px-6 pt-12 pb-8 rounded-b-[30px]">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <DrawerMenuButton />
                        <View className="ml-3">
                            <Text className="text-white/80 text-sm">Manage your</Text>
                            <Text className="text-white font-bold text-2xl">
                                Health & Safety
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        className="w-10 h-10 bg-white/20 rounded-full justify-center items-center">
                        <Icon name="refresh" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Summary Card */}
                <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <View className="w-14 h-14 bg-white/20 rounded-full justify-center items-center">
                        <Icon name="shield-check" size={28} color="#fbbf24" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-semibold">
                            {healthRecords.length} Document{healthRecords.length !== 1 ? 's' : ''} on File
                        </Text>
                        <Text className="text-white/70 text-sm">
                            {hasSignedWaiver
                                ? 'Waiver signed ✅'
                                : 'Waiver pending ⚠️'}
                        </Text>
                    </View>
                    <View
                        className={`px-3 py-1 rounded-full ${hasSignedWaiver ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}>
                        <Text className="text-white font-bold text-xs">
                            {hasSignedWaiver ? 'Complete' : 'Action Needed'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ─── Medical Documents Section ─── */}
            <View className="mt-4">
                <View className="flex-row justify-between items-center px-4 py-3">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-lg bg-blue-100 justify-center items-center mr-2">
                            <Icon name="file-document-multiple" size={18} color="#3b82f6" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">Medical Documents</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowUploadModal(true)}
                        activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#059669', '#10b981']}
                            className="rounded-xl px-4 py-2 flex-row items-center">
                            <Icon name="plus" size={18} color="#fff" />
                            <Text className="text-white font-semibold text-sm ml-1">Upload</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View className="px-4">
                    {healthRecords.length === 0 ? (
                        <View
                            className="bg-white rounded-2xl p-8 items-center"
                            style={{ elevation: 3 }}>
                            <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
                                <Icon name="file-document-outline" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-500 font-medium text-base">
                                No health records uploaded yet
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1 text-center">
                                Upload your medical certificates and fitness assessments
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowUploadModal(true)}
                                activeOpacity={0.8}
                                className="mt-4">
                                <LinearGradient
                                    colors={['#059669', '#10b981']}
                                    className="rounded-xl px-6 py-3 flex-row items-center">
                                    <Icon name="upload" size={18} color="#fff" />
                                    <Text className="text-white font-bold ml-2">
                                        Upload First Document
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        healthRecords.map(doc => {
                            const statusConfig = getStatusConfig(doc.status);
                            return (
                                <View
                                    key={doc._id}
                                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                                    style={{ elevation: 2 }}>
                                    <View className="flex-row items-start">
                                        {/* Icon */}
                                        <View className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center">
                                            <Icon
                                                name={getDocTypeIcon(doc.type)}
                                                size={24}
                                                color="#3b82f6"
                                            />
                                        </View>

                                        {/* Content */}
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-gray-900 font-semibold text-base flex-1 mr-2">
                                                    {getDocTypeLabel(doc.type)}
                                                </Text>
                                                <View
                                                    className={`${statusConfig.bg} px-2.5 py-1 rounded-full flex-row items-center`}>
                                                    <Icon
                                                        name={statusConfig.icon}
                                                        size={12}
                                                        color={statusConfig.iconColor}
                                                    />
                                                    <Text
                                                        className={`${statusConfig.text} text-xs font-semibold ml-1`}>
                                                        {statusConfig.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text
                                                className="text-gray-500 text-sm mt-1"
                                                numberOfLines={2}>
                                                {doc.description}
                                            </Text>

                                            {doc.fileName && (
                                                <View className="flex-row items-center mt-1.5">
                                                    <Icon name="paperclip" size={12} color="#3b82f6" />
                                                    <Text className="text-blue-600 text-xs ml-1" numberOfLines={1}>
                                                        {doc.fileName}
                                                    </Text>
                                                </View>
                                            )}

                                            <View className="flex-row items-center mt-1.5 flex-wrap">
                                                <View className="flex-row items-center mr-4">
                                                    <Icon name="calendar" size={12} color="#9ca3af" />
                                                    <Text className="text-gray-400 text-xs ml-1">
                                                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                {doc.expiryDate && (
                                                    <View className="flex-row items-center">
                                                        <Icon name="calendar-clock" size={12} color="#9ca3af" />
                                                        <Text className="text-gray-400 text-xs ml-1">
                                                            Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    {doc.documentUrl && (
                                        <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setViewingDoc(doc);
                                                    setShowDocViewer(true);
                                                }}
                                                className="flex-1 flex-row items-center justify-center py-2 mr-2 bg-blue-50 rounded-xl">
                                                <Icon name="eye" size={16} color="#3b82f6" />
                                                <Text className="text-blue-600 font-semibold text-sm ml-1.5">
                                                    View
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Linking.openURL(doc.documentUrl).catch(() =>
                                                        Alert.alert('Error', 'Cannot open this document'),
                                                    );
                                                }}
                                                className="flex-1 flex-row items-center justify-center py-2 bg-gray-50 rounded-xl">
                                                <Icon name="open-in-new" size={16} color="#6b7280" />
                                                <Text className="text-gray-600 font-semibold text-sm ml-1.5">
                                                    Open
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </View>

            {/* ─── Liability Waiver Section ─── */}
            <View className="mt-4">
                <SectionHeader
                    title="Liability Waiver"
                    icon="shield-check"
                    showSeeAll={false}
                />
                <View className="px-4">
                    {/* Explanation Box */}
                    <View
                        className="bg-blue-50 rounded-2xl p-4 mb-3 border border-blue-200"
                        style={{ elevation: 1 }}>
                        <View className="flex-row items-start">
                            <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center">
                                <Icon name="information" size={22} color="#3b82f6" />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-blue-900 font-bold text-sm mb-1.5">
                                    What is a Liability Waiver?
                                </Text>
                                <Text className="text-blue-800 text-xs leading-5">
                                    A Liability Waiver is a legal document where you acknowledge
                                    that sports and fitness activities involve certain risks. By
                                    signing, you confirm:
                                </Text>
                                <View className="mt-2 space-y-1">
                                    {[
                                        'You are voluntarily participating in activities',
                                        'Physical activities carry a risk of injury',
                                        'The club will not be held responsible for injuries',
                                        'You are physically fit to participate',
                                    ].map((item, index) => (
                                        <View key={index} className="flex-row items-start mb-1">
                                            <Icon
                                                name="circle-small"
                                                size={16}
                                                color="#3b82f6"
                                                style={{ marginTop: 1 }}
                                            />
                                            <Text className="text-blue-800 text-xs flex-1 ml-0.5">
                                                {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <Text className="text-blue-600 text-xs italic mt-2">
                                    This is standard practice followed by most sports clubs and gyms.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Waiver Status Card */}
                    <View
                        className={`bg-white rounded-2xl p-5 border-2 ${hasSignedWaiver ? 'border-emerald-500' : 'border-amber-500'
                            }`}
                        style={{ elevation: 4 }}>
                        {hasSignedWaiver ? (
                            <View>
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-emerald-100 rounded-full justify-center items-center">
                                        <Icon name="check-decagram" size={32} color="#059669" />
                                    </View>
                                    <View className="ml-4 flex-1">
                                        <Text className="text-emerald-800 font-bold text-lg">
                                            Waiver Signed ✅
                                        </Text>
                                        {latestWaiver && (
                                            <Text className="text-emerald-600 text-sm mt-0.5">
                                                Acknowledged on{' '}
                                                {new Date(
                                                    latestWaiver.acknowledgedAt,
                                                ).toLocaleDateString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowWaiverModal(true)}
                                    className="mt-4 border border-emerald-300 rounded-xl py-3 items-center flex-row justify-center">
                                    <Icon name="eye" size={18} color="#059669" />
                                    <Text className="text-emerald-700 font-semibold ml-2">
                                        View Waiver Details
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-amber-100 rounded-full justify-center items-center">
                                        <Icon name="alert-circle" size={32} color="#f59e0b" />
                                    </View>
                                    <View className="ml-4 flex-1">
                                        <Text className="text-amber-800 font-bold text-lg">
                                            Action Required
                                        </Text>
                                        <Text className="text-amber-600 text-sm mt-0.5">
                                            Please review and sign the liability waiver to continue
                                            using our facilities
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowWaiverModal(true)}
                                    activeOpacity={0.8}
                                    className="mt-4">
                                    <LinearGradient
                                        colors={['#f59e0b', '#d97706']}
                                        className="rounded-xl py-3.5 items-center flex-row justify-center">
                                        <Icon name="file-sign" size={20} color="#fff" />
                                        <Text className="text-white font-bold ml-2">
                                            Review & Sign Waiver
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* ─── Safety Tips Section ─── */}
            <View className="mt-4">
                <SectionHeader
                    title="Safety Tips"
                    icon="lightbulb-on"
                    showSeeAll={false}
                />
                <View className="px-4">
                    {[
                        {
                            icon: 'water',
                            title: 'Stay Hydrated',
                            desc: 'Drink water before, during, and after exercise',
                            color: '#3b82f6',
                            bg: 'bg-blue-100',
                        },
                        {
                            icon: 'run',
                            title: 'Warm Up Properly',
                            desc: 'Always warm up for 5-10 minutes before intense activity',
                            color: '#f59e0b',
                            bg: 'bg-yellow-100',
                        },
                        {
                            icon: 'shield-alert',
                            title: 'Use Protective Gear',
                            desc: 'Wear appropriate safety equipment for your sport',
                            color: '#ef4444',
                            bg: 'bg-red-100',
                        },
                        {
                            icon: 'hospital-box',
                            title: 'Report Injuries',
                            desc: 'Inform staff immediately if you get injured',
                            color: '#059669',
                            bg: 'bg-emerald-100',
                        },
                    ].map((tip, index) => (
                        <View
                            key={index}
                            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
                            style={{ elevation: 2 }}>
                            <View
                                className={`w-12 h-12 ${tip.bg} rounded-full justify-center items-center`}>
                                <Icon name={tip.icon} size={24} color={tip.color} />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-gray-900 font-semibold">{tip.title}</Text>
                                <Text className="text-gray-500 text-sm mt-0.5">{tip.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── UPLOAD DOCUMENT MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showUploadModal}
                transparent
                animationType="slide"
                onRequestClose={() => !uploading && setShowUploadModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <Icon name="file-upload" size={22} color="#059669" />
                                <Text className="text-gray-900 font-bold text-xl ml-2">
                                    Upload Document
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!uploading) {
                                        setShowUploadModal(false);
                                        resetUploadForm();
                                    }
                                }}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-4">
                            Upload your medical certificate or fitness assessment
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Document Type Selector */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Document Type *
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowTypeSelector(!showTypeSelector)}
                                className="bg-gray-100 rounded-xl p-4 mb-1 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Icon
                                        name={
                                            uploadForm.type
                                                ? getDocTypeIcon(uploadForm.type)
                                                : 'file-question'
                                        }
                                        size={20}
                                        color={uploadForm.type ? '#059669' : '#9ca3af'}
                                    />
                                    <Text
                                        className={`ml-2 text-base ${uploadForm.type
                                                ? 'text-gray-900 font-medium'
                                                : 'text-gray-400'
                                            }`}>
                                        {uploadForm.type
                                            ? getDocTypeLabel(uploadForm.type)
                                            : 'Select type...'}
                                    </Text>
                                </View>
                                <Icon
                                    name={showTypeSelector ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>

                            {/* Type Options */}
                            {showTypeSelector && (
                                <View className="bg-white border border-gray-200 rounded-xl mb-3 overflow-hidden">
                                    {DOCUMENT_TYPES.map((docType, index) => (
                                        <TouchableOpacity
                                            key={docType.value}
                                            onPress={() => {
                                                setUploadForm(prev => ({
                                                    ...prev,
                                                    type: docType.value,
                                                }));
                                                setShowTypeSelector(false);
                                            }}
                                            className={`flex-row items-center p-3.5 ${index < DOCUMENT_TYPES.length - 1
                                                    ? 'border-b border-gray-100'
                                                    : ''
                                                } ${uploadForm.type === docType.value
                                                    ? 'bg-emerald-50'
                                                    : ''
                                                }`}>
                                            <Icon
                                                name={docType.icon}
                                                size={20}
                                                color={
                                                    uploadForm.type === docType.value
                                                        ? '#059669'
                                                        : '#6b7280'
                                                }
                                            />
                                            <Text
                                                className={`ml-3 text-base ${uploadForm.type === docType.value
                                                        ? 'text-emerald-700 font-semibold'
                                                        : 'text-gray-700'
                                                    }`}>
                                                {docType.label}
                                            </Text>
                                            {uploadForm.type === docType.value && (
                                                <Icon
                                                    name="check"
                                                    size={18}
                                                    color="#059669"
                                                    style={{ marginLeft: 'auto' }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {!showTypeSelector && <View className="h-2" />}

                            {/* Description */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Description *
                            </Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl p-4 text-gray-900 mb-4"
                                placeholder="Describe this document..."
                                placeholderTextColor="#9ca3af"
                                value={uploadForm.description}
                                onChangeText={text =>
                                    setUploadForm(prev => ({ ...prev, description: text }))
                                }
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            {/* Upload Mode Toggle */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Upload Method
                            </Text>
                            <View className="flex-row gap-2 mb-4">
                                <TouchableOpacity
                                    onPress={() => setUploadMode('file')}
                                    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border-2 ${uploadMode === 'file'
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-200 bg-white'
                                        }`}>
                                    <Icon
                                        name="cellphone"
                                        size={18}
                                        color={uploadMode === 'file' ? '#059669' : '#6b7280'}
                                    />
                                    <Text
                                        className={`ml-2 font-semibold text-sm ${uploadMode === 'file'
                                                ? 'text-emerald-700'
                                                : 'text-gray-600'
                                            }`}>
                                        From Device
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setUploadMode('url')}
                                    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border-2 ${uploadMode === 'url'
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-gray-200 bg-white'
                                        }`}>
                                    <Icon
                                        name="link-variant"
                                        size={18}
                                        color={uploadMode === 'url' ? '#059669' : '#6b7280'}
                                    />
                                    <Text
                                        className={`ml-2 font-semibold text-sm ${uploadMode === 'url'
                                                ? 'text-emerald-700'
                                                : 'text-gray-600'
                                            }`}>
                                        Paste URL
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* File Upload Info */}
                            {uploadMode === 'file' && (
                                <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-dashed border-gray-300">
                                    <View className="items-center">
                                        <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-3">
                                            <Icon name="cloud-upload" size={32} color="#9ca3af" />
                                        </View>
                                        <Text className="text-gray-500 text-sm text-center">
                                            File picker will be available in production build
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-1 text-center">
                                            Supported: PDF, Images (JPG, PNG), Word docs • Max 5MB
                                        </Text>
                                        <Text className="text-blue-500 text-xs mt-2 font-medium">
                                            Use "Paste URL" mode for demo
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* URL Input */}
                            {uploadMode === 'url' && (
                                <View className="mb-4">
                                    <Text className="text-gray-700 font-medium text-sm mb-2">
                                        Document URL *
                                    </Text>
                                    <TextInput
                                        className="bg-gray-100 rounded-xl p-4 text-gray-900"
                                        placeholder="https://... (link to your document)"
                                        placeholderTextColor="#9ca3af"
                                        value={uploadForm.documentUrl}
                                        onChangeText={text =>
                                            setUploadForm(prev => ({
                                                ...prev,
                                                documentUrl: text,
                                            }))
                                        }
                                        autoCapitalize="none"
                                        keyboardType="url"
                                    />
                                    <Text className="text-gray-400 text-xs mt-1">
                                        Provide a link (e.g., Google Drive, Dropbox)
                                    </Text>
                                </View>
                            )}

                            {/* Expiry Date */}
                            <Text className="text-gray-700 font-medium text-sm mb-2">
                                Expiry Date (Optional)
                            </Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl p-4 text-gray-900 mb-4"
                                placeholder="YYYY-MM-DD (e.g., 2027-03-15)"
                                placeholderTextColor="#9ca3af"
                                value={uploadForm.expiryDate}
                                onChangeText={text =>
                                    setUploadForm(prev => ({ ...prev, expiryDate: text }))
                                }
                                keyboardType="numbers-and-punctuation"
                            />
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowUploadModal(false);
                                    resetUploadForm();
                                }}
                                disabled={uploading}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpload}
                                disabled={uploading}
                                activeOpacity={0.8}
                                className="flex-1">
                                <LinearGradient
                                    colors={
                                        uploading
                                            ? ['#d1d5db', '#d1d5db']
                                            : ['#059669', '#10b981']
                                    }
                                    className="rounded-xl py-4 items-center flex-row justify-center">
                                    {uploading ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                    ) : (
                                        <Icon
                                            name="upload"
                                            size={18}
                                            color="#fff"
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    <Text className="text-white font-bold">
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── DOCUMENT VIEWER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showDocViewer}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowDocViewer(false);
                    setViewingDoc(null);
                }}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center flex-1 mr-2">
                                <Icon name="file-eye" size={22} color="#3b82f6" />
                                <Text
                                    className="text-gray-900 font-bold text-xl ml-2"
                                    numberOfLines={1}>
                                    {viewingDoc
                                        ? getDocTypeLabel(viewingDoc.type)
                                        : 'Document'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDocViewer(false);
                                    setViewingDoc(null);
                                }}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {viewingDoc && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Document Info */}
                                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <View className="flex-row items-center mb-3">
                                        <View className="w-12 h-12 bg-blue-100 rounded-full justify-center items-center">
                                            <Icon
                                                name={getDocTypeIcon(viewingDoc.type)}
                                                size={24}
                                                color="#3b82f6"
                                            />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="text-gray-900 font-semibold text-base">
                                                {getDocTypeLabel(viewingDoc.type)}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <View
                                                    className={`${getStatusConfig(viewingDoc.status).bg
                                                        } px-2 py-0.5 rounded-full flex-row items-center`}>
                                                    <Icon
                                                        name={
                                                            getStatusConfig(viewingDoc.status).icon
                                                        }
                                                        size={12}
                                                        color={
                                                            getStatusConfig(viewingDoc.status)
                                                                .iconColor
                                                        }
                                                    />
                                                    <Text
                                                        className={`${getStatusConfig(viewingDoc.status).text
                                                            } text-xs font-semibold ml-1`}>
                                                        {getStatusConfig(viewingDoc.status).label}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Details */}
                                    {[
                                        {
                                            label: 'Description',
                                            value: viewingDoc.description,
                                            icon: 'text',
                                        },
                                        {
                                            label: 'File Name',
                                            value: viewingDoc.fileName,
                                            icon: 'paperclip',
                                        },
                                        {
                                            label: 'Uploaded',
                                            value: new Date(
                                                viewingDoc.createdAt,
                                            ).toLocaleDateString(),
                                            icon: 'calendar',
                                        },
                                        {
                                            label: 'Expires',
                                            value: viewingDoc.expiryDate
                                                ? new Date(
                                                    viewingDoc.expiryDate,
                                                ).toLocaleDateString()
                                                : 'No expiry',
                                            icon: 'calendar-clock',
                                        },
                                    ].map((item, index) => (
                                        <View
                                            key={index}
                                            className={`flex-row items-start py-2.5 ${index < 3 ? 'border-b border-gray-200' : ''
                                                }`}>
                                            <Icon
                                                name={item.icon}
                                                size={16}
                                                color="#6b7280"
                                                style={{ marginTop: 2 }}
                                            />
                                            <View className="ml-2 flex-1">
                                                <Text className="text-gray-400 text-xs">
                                                    {item.label}
                                                </Text>
                                                <Text className="text-gray-900 text-sm font-medium mt-0.5">
                                                    {item.value || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (viewingDoc.documentUrl) {
                                                Linking.openURL(viewingDoc.documentUrl).catch(
                                                    () =>
                                                        Alert.alert(
                                                            'Error',
                                                            'Cannot open this document',
                                                        ),
                                                );
                                            }
                                        }}
                                        className="flex-1 bg-blue-50 rounded-xl py-3.5 flex-row items-center justify-center">
                                        <Icon name="download" size={18} color="#3b82f6" />
                                        <Text className="text-blue-600 font-bold ml-2">
                                            Download
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (viewingDoc.documentUrl) {
                                                Linking.openURL(viewingDoc.documentUrl).catch(
                                                    () =>
                                                        Alert.alert(
                                                            'Error',
                                                            'Cannot open this document',
                                                        ),
                                                );
                                            }
                                        }}
                                        className="flex-1 bg-gray-50 rounded-xl py-3.5 flex-row items-center justify-center">
                                        <Icon name="open-in-new" size={18} color="#6b7280" />
                                        <Text className="text-gray-700 font-bold ml-2">
                                            Open in Browser
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowDocViewer(false);
                                setViewingDoc(null);
                            }}
                            className="mt-4 border border-gray-300 rounded-xl py-3.5 items-center">
                            <Text className="text-gray-700 font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── WAIVER MODAL ─── */}
            {/* ═══════════════════════════════════════════════ */}
            <Modal
                visible={showWaiverModal}
                transparent
                animationType="slide"
                onRequestClose={() => !acknowledging && setShowWaiverModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View
                        className="bg-white rounded-t-3xl p-6"
                        style={{ maxHeight: '85%' }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <Icon name="shield-check" size={22} color="#059669" />
                                <Text className="text-gray-900 font-bold text-xl ml-2">
                                    Liability Waiver
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() =>
                                    !acknowledging && setShowWaiverModal(false)
                                }>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-4">
                            Please read carefully and sign to acknowledge
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Waiver Content */}
                            <View className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                                <Text className="text-gray-900 font-bold text-base mb-3">
                                    ASSUMPTION OF RISK AND WAIVER OF LIABILITY
                                </Text>
                                <Text className="text-gray-700 text-sm leading-6 mb-3">
                                    I acknowledge that participation in sports and fitness
                                    activities involves inherent risks, including but not limited
                                    to physical injury, illness, or property damage. I voluntarily
                                    assume all such risks associated with my participation.
                                </Text>
                                <Text className="text-gray-700 text-sm leading-6 mb-3">
                                    I hereby release, waive, and discharge the facility, its
                                    owners, employees, and agents from any and all liability for
                                    injuries or damages that may occur during my use of the
                                    facilities or participation in activities.
                                </Text>
                                <Text className="text-gray-700 text-sm leading-6 mb-3">
                                    I certify that I am in good physical condition and have no
                                    medical conditions that would prevent safe participation in
                                    physical activities. I agree to follow all facility rules and
                                    safety guidelines.
                                </Text>
                                <Text className="text-gray-400 text-xs italic">
                                    Version 2.0 • Last Updated: January 1, 2026
                                </Text>
                            </View>

                            {/* Simple Explanation */}
                            <View className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
                                <View className="flex-row items-center mb-2">
                                    <Icon name="information" size={18} color="#059669" />
                                    <Text className="text-emerald-800 font-bold text-sm ml-2">
                                        Simple Explanation:
                                    </Text>
                                </View>
                                <Text className="text-emerald-700 text-sm leading-5">
                                    The document above states that you understand sports and gym
                                    activities may involve risks. You are participating voluntarily
                                    and agree not to hold the facility responsible for injuries.
                                    You confirm that you are healthy and will follow all facility
                                    rules.
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowWaiverModal(false)}
                                disabled={acknowledging}
                                className="flex-1 border border-gray-300 rounded-xl py-4 items-center">
                                <Text className="text-gray-700 font-semibold">
                                    {hasSignedWaiver ? 'Close' : 'Cancel'}
                                </Text>
                            </TouchableOpacity>
                            {!hasSignedWaiver && (
                                <TouchableOpacity
                                    onPress={handleAcknowledgeWaiver}
                                    disabled={acknowledging}
                                    activeOpacity={0.8}
                                    className="flex-1">
                                    <LinearGradient
                                        colors={
                                            acknowledging
                                                ? ['#d1d5db', '#d1d5db']
                                                : ['#059669', '#10b981']
                                        }
                                        className="rounded-xl py-4 items-center flex-row justify-center">
                                        {acknowledging ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#fff"
                                                style={{ marginRight: 8 }}
                                            />
                                        ) : (
                                            <Icon
                                                name="check-decagram"
                                                size={18}
                                                color="#fff"
                                                style={{ marginRight: 8 }}
                                            />
                                        )}
                                        <Text className="text-white font-bold">
                                            {acknowledging ? 'Signing...' : 'I Agree & Sign'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default HealthSafetyScreen;