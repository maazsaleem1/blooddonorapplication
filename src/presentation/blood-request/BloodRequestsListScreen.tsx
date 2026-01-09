/**
 * Blood Requests List Screen
 * Displays blood requests with two tabs: Receiving and Sending
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FirestoreService } from '../../data/firebase/firestoreService';
import { AuthService } from '../../data/firebase/authService';
import { useChatController } from '../../controllers/ChatController';
import { BloodRequest } from '../../domain/models/BloodRequest';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { CustomButton } from '../../components/CustomButton';
import { Colors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';

interface BloodRequestsListScreenProps {
    navigation: any;
}

type TabType = 'receiving' | 'sending';

export const BloodRequestsListScreen: React.FC<BloodRequestsListScreenProps> = ({
    navigation,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('receiving');
    const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { getOrCreateChat } = useChatController();
    const [userNamesCache, setUserNamesCache] = useState<Record<string, string>>({});
    const [currentUserBloodGroup, setCurrentUserBloodGroup] = useState<string | null>(null);

    // Clear state when user changes
    useEffect(() => {
        const checkUserChange = async () => {
            const userId = await AuthService.getCurrentUserId();
            if (userId !== currentUserId && currentUserId !== null) {
                // User changed - clear all state
                console.log('🔄 [BloodRequestsListScreen] User changed, clearing state');
                setBloodRequests([]);
                setUserNamesCache({});
                setCurrentUserBloodGroup(null);
            }
        };
        checkUserChange();
    }, [currentUserId]);

    const fetchBloodRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            const requests = await FirestoreService.getBloodRequests();
            setBloodRequests(requests);

            // Fetch names for acceptedBy and sentTo users
            const userIdsToFetch = new Set<string>();
            requests.forEach(req => {
                if (req.acceptedBy) {
                    userIdsToFetch.add(req.acceptedBy);
                }
                if (req.sentTo) {
                    userIdsToFetch.add(req.sentTo);
                }
            });

            console.log('🔍 [BloodRequestsListScreen] Fetching names for users:', Array.from(userIdsToFetch));

            // Fetch user names
            const namesCache: Record<string, string> = { ...userNamesCache }; // Keep existing cache
            for (const userId of userIdsToFetch) {
                if (!namesCache[userId]) { // Only fetch if not already in cache
                    try {
                        const user = await FirestoreService.getUser(userId);
                        if (user) {
                            namesCache[userId] = user.name;
                            console.log(`✅ [BloodRequestsListScreen] Fetched name for ${userId}: ${user.name}`);
                        }
                    } catch (error) {
                        console.error(`❌ [BloodRequestsListScreen] Failed to fetch user ${userId}:`, error);
                    }
                }
            }
            setUserNamesCache(namesCache);
        } catch (error) {
            console.error('Failed to fetch blood requests:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userNamesCache]);

    // Re-initialize when screen comes into focus (handles user login/logout)
    useFocusEffect(
        useCallback(() => {
            const refreshData = async () => {
                try {
                    const userId = await AuthService.getCurrentUserId();
                    setCurrentUserId(userId);

                    // Fetch current user's blood group for filtering broadcast requests
                    if (userId) {
                        try {
                            const user = await FirestoreService.getUser(userId);
                            if (user && user.bloodGroup) {
                                setCurrentUserBloodGroup(user.bloodGroup);
                            }
                        } catch (error) {
                            console.error('Failed to fetch current user blood group:', error);
                        }
                    }

                    await fetchBloodRequests();
                } catch (error) {
                    console.error('Failed to refresh data:', error);
                }
            };
            refreshData();
        }, [fetchBloodRequests])
    );

    // Refetch names when requests change and we have sentTo users
    useEffect(() => {
        const fetchMissingNames = async () => {
            const userIdsToFetch = new Set<string>();
            bloodRequests.forEach(req => {
                if (req.sentTo && !userNamesCache[req.sentTo]) {
                    userIdsToFetch.add(req.sentTo);
                }
                if (req.acceptedBy && !userNamesCache[req.acceptedBy]) {
                    userIdsToFetch.add(req.acceptedBy);
                }
            });

            if (userIdsToFetch.size > 0) {
                const namesCache: Record<string, string> = { ...userNamesCache };
                for (const userId of userIdsToFetch) {
                    try {
                        const user = await FirestoreService.getUser(userId);
                        if (user) {
                            namesCache[userId] = user.name;
                            console.log(`✅ [BloodRequestsListScreen] Fetched missing name for ${userId}: ${user.name}`);
                        }
                    } catch (error) {
                        console.error(`❌ [BloodRequestsListScreen] Failed to fetch user ${userId}:`, error);
                    }
                }
                setUserNamesCache(namesCache);
            }
        };

        if (bloodRequests.length > 0) {
            fetchMissingNames();
        }
    }, [bloodRequests]);


    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBloodRequests();
        setRefreshing(false);
    };

    // Filter requests based on active tab
    const getFilteredRequests = () => {
        if (!currentUserId) return [];

        if (activeTab === 'sending') {
            // Show requests sent by current user
            return bloodRequests.filter((req) => req.requesterId === currentUserId);
        } else {
            // Show requests received by current user:
            // 1. Requests specifically sent TO this user (sentTo === currentUserId)
            // 2. Broadcast requests (no sentTo) where blood group matches current user
            return bloodRequests.filter((req) => {
                // Don't show requests sent by current user
                if (req.requesterId === currentUserId) return false;

                // Show if request was specifically sent to this user
                if (req.sentTo === currentUserId) return true;

                // Show broadcast requests (no sentTo) if blood group matches
                if (!req.sentTo && currentUserBloodGroup && req.bloodGroup === currentUserBloodGroup) {
                    return true;
                }

                return false;
            });
        }
    };

    const handleAccept = async (request: BloodRequest) => {
        if (!currentUserId) return;

        Alert.alert(
            'Accept Request',
            `Do you want to accept the blood request from ${request.requesterName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: async () => {
                        try {
                            await FirestoreService.acceptBloodRequest(request.id, currentUserId);
                            Alert.alert('Success', 'Blood request accepted successfully!');
                            await fetchBloodRequests();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to accept request');
                        }
                    },
                },
            ]
        );
    };

    const handleReject = async (request: BloodRequest) => {
        Alert.alert(
            'Reject Request',
            `Do you want to reject this blood request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FirestoreService.rejectBloodRequest(request.id);
                            Alert.alert('Success', 'Blood request rejected');
                            await fetchBloodRequests();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to reject request');
                        }
                    },
                },
            ]
        );
    };

    const handleMessagePress = async (request: BloodRequest) => {
        if (!currentUserId) return;

        try {
            // Determine the other user ID
            // If in sending tab, message the acceptor (acceptedBy)
            // If in receiving tab, message the requester (requesterId)
            let otherUserId: string | undefined;

            if (activeTab === 'sending') {
                // In sending tab: message the person who accepted (acceptedBy)
                otherUserId = request.acceptedBy;
            } else {
                // In receiving tab: message the person who sent the request (requesterId)
                otherUserId = request.requesterId;
            }

            if (!otherUserId) {
                Alert.alert('Error', 'Cannot determine recipient');
                return;
            }

            console.log('🔍 [BloodRequestsListScreen] Creating chat with user:', otherUserId);
            const chatId = await getOrCreateChat(otherUserId);
            console.log('✅ [BloodRequestsListScreen] Chat created/found:', chatId);
            navigation.navigate('ChatDetail', { chatId, otherUserId });
        } catch (error: any) {
            console.error('❌ [BloodRequestsListScreen] Failed to create chat:', error);
            Alert.alert('Error', error.message || 'Failed to start conversation');
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'Emergency':
                return Colors.error;
            case 'Medium':
                return '#FF9800';
            case 'Low':
                return Colors.success;
            default:
                return Colors.gray400;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return Colors.success;
            case 'Accepted':
                return '#2196F3';
            case 'Cancelled':
                return Colors.gray400;
            default:
                return Colors.primary;
        }
    };

    const getDisplayName = (item: BloodRequest): string => {
        // In sending tab, show acceptor name if accepted, otherwise show sentTo name
        if (activeTab === 'sending') {
            if (item.status === 'Accepted' && item.acceptedBy) {
                return userNamesCache[item.acceptedBy] || 'Unknown User';
            }
            // For pending requests, show the name of the person it was sent to
            if (item.sentTo) {
                const name = userNamesCache[item.sentTo];
                if (name) {
                    return name;
                }
                // If name not in cache yet, try to fetch it
                if (!isLoading) {
                    // Trigger a fetch for this specific user
                    FirestoreService.getUser(item.sentTo).then(user => {
                        if (user) {
                            setUserNamesCache(prev => ({
                                ...prev,
                                [item.sentTo!]: user.name
                            }));
                        }
                    }).catch(err => {
                        console.error(`Failed to fetch user ${item.sentTo}:`, err);
                    });
                }
                return 'Loading...';
            }
            return 'Broadcast Request'; // If no specific recipient
        }
        // In receiving tab, show requester name
        return item.requesterName;
    };

    const renderBloodRequest = ({ item }: { item: BloodRequest }) => {
        const displayName = getDisplayName(item);

        return (
            <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                    <View style={styles.requestHeaderLeft}>
                        <Text style={styles.requesterName}>{displayName}</Text>
                        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
                            <Text style={styles.urgencyText}>{item.urgency}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.requestBody}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Blood Group:</Text>
                        <Text style={styles.infoValue}>{item.bloodGroup}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hospital:</Text>
                        <Text style={styles.infoValue}>{item.hospital}</Text>
                    </View>
                    {item.notes && (
                        <Text style={styles.notes} numberOfLines={2}>
                            {item.notes}
                        </Text>
                    )}
                </View>

                <View style={styles.requestFooter}>
                    <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
                    {activeTab === 'receiving' && item.status === 'Pending' && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleReject(item)}
                            >
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={() => handleAccept(item)}
                            >
                                <Text style={styles.acceptButtonText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {item.status === 'Accepted' && (
                        <View style={styles.messageButtonContainer}>
                            <CustomButton
                                title="Message"
                                onPress={() => handleMessagePress(item)}
                                variant="primary"
                                size="small"
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const filteredRequests = getFilteredRequests();

    if (isLoading && bloodRequests.length === 0) {
        return <Loader fullScreen message="Loading blood requests..." />;
    }

    return (
        <View style={styles.container}>
            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'receiving' && styles.activeTab]}
                    onPress={() => setActiveTab('receiving')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'receiving' && styles.activeTabText,
                        ]}
                    >
                        Receiving Requests
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sending' && styles.activeTab]}
                    onPress={() => setActiveTab('sending')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'sending' && styles.activeTabText,
                        ]}
                    >
                        Sending Requests
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <EmptyState
                    title={
                        activeTab === 'receiving'
                            ? 'No Receiving Requests'
                            : 'No Sending Requests'
                    }
                    message={
                        activeTab === 'receiving'
                            ? 'You have no pending blood requests to accept'
                            : 'You have not sent any blood requests yet'
                    }
                    icon={<Text style={styles.emptyIcon}>🩸</Text>}
                />
            ) : (
                <FlatList
                    data={filteredRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderBloodRequest}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        ...Typography.body1,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    requestCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    requestHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    requesterName: {
        ...Typography.h3,
        color: Colors.textPrimary,
        marginRight: 8,
    },
    urgencyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgencyText: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        ...Typography.caption,
        color: Colors.white,
        fontWeight: '600',
    },
    requestBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        ...Typography.body2,
        color: Colors.textSecondary,
        marginRight: 8,
    },
    infoValue: {
        ...Typography.body2,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    notes: {
        ...Typography.body2,
        color: Colors.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    requestFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.gray200,
        paddingTop: 8,
    },
    timeText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: Colors.gray200,
    },
    rejectButtonText: {
        ...Typography.body2,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    acceptButton: {
        backgroundColor: Colors.primary,
    },
    acceptButtonText: {
        ...Typography.body2,
        color: Colors.white,
        fontWeight: '600',
    },
    emptyIcon: {
        fontSize: 64,
    },
    messageButtonContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
});

