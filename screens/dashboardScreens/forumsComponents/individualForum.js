import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import CommentSection from './commentSection';
import {useNavigation} from '@react-navigation/native';
import {userApiServer} from '../../../config';
import EllipsisVIcon from 'react-native-vector-icons/FontAwesome5';
import {IoColor1} from '../../../colorCode';
import RenderHtml from 'react-native-render-html';
import CheckBox from '@react-native-community/checkbox';

const IndividualForum = ({forum, onBack}) => {
  const [forumData, setForumData] = useState(forum);
  const [members, setMembers] = useState([]);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatus, setRequestStatus] = useState('Join Forum');
  const [notificationList, setNotificationList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const profile = useSelector(state => state.auth.user);
  // const allMembers = useSelector(state => state.members.members);
  // console.log('allMembers : ', allMembers);

  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const res = await axios.get(`${userApiServer}/alumni/all`); // or your actual endpoint
        setAllMembers(res.data); // store in local state
      } catch (error) {
        console.error('Error fetching all users:', error);
      }
    }

    fetchAllUsers();
  }, []);

  // console.log('allMembers : ', allMembers);

  const navigation = useNavigation();

  const {width} = useWindowDimensions();

  let admin = profile.profileLevel === 0;

  const getRequest = async () => {
    try {
      const response = await axios.get(`${userApiServer}/groups/requests/req`);
      setNotificationList(response.data);
    } catch (error) {
      console.error('Error fetching request:', error);
    }
  };

  useEffect(() => {
    getRequest();
  }, []);

  useEffect(() => {
    const matchingNotification = notificationList.find(
      notification =>
        notification.forumId === forum._id &&
        notification.userId === profile._id,
    );
    if (matchingNotification) {
      setRequestStatus('Requested');
    } else {
      setRequestStatus('Request to Join');
    }
  }, [forum._id, notificationList, profile._id]);

  useEffect(() => {
    setForumData(forum);
  }, [forum]);

  const refreshComments = async () => {
    try {
      const response = await axios.get(`${userApiServer}/forums/${forum._id}`);
      setForumData(response.data);
    } catch (error) {
      console.error('Error fetching forum data:', error);
    }
  };

  const getForumMembers = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/forums/${forum._id}/members`,
      );
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching forum members:', error);
    }
  };

  const getBlockedMembers = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/forums/${forum._id}/blockedUserIds`,
      );
      setBlockedUserIds(response.data.blockedUserIds);
    } catch (error) {
      console.error('Error fetching blocked members:', error);
    }
  };

  useEffect(() => {
    getForumMembers();
    getBlockedMembers();
  }, []);

  useEffect(() => {
    refreshComments();
  }, [forum._id]);

  const handleDeletePost = async () => {
    try {
      await axios.delete(`${userApiServer}/forums/${forum._id}`);
      Alert.alert('Success', 'Deleted successfully!');
      onBack();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleJoinForum = async () => {
    const requestedUserName = `${profile.firstName} ${profile.lastName}`;
    const body = {
      ownerId: forum.userId,
      forumId: forum._id,
      userId: profile._id,
      forumName: forum.title,
      requestedUserName,
    };
    setRequestStatus('Loading...');
    try {
      const response = await axios.post(
        `${userApiServer}/forums/createRequest`,
        body,
      );
      if (response.data.requested === true) setRequestStatus('Requested');
      else setRequestStatus('Request');
    } catch (error) {
      console.error('Error creating request:', error);
      setRequestStatus('Join Forum');
    }
  };

  const filterReportedComments = comments => {
    const filteredComments =
      comments?.filter(comment => !comment.reported) || [];
    return filteredComments.map(comment => ({
      ...comment,
      comments: filterReportedComments(comment.comments),
    }));
  };

  const reportToSuperAdmin = async (commentId, comment, forumName) => {
    try {
      const body = {
        userId: profile._id,
        comment,
        commentId,
        ownerId: '64c4ed2ede6421691b5239dc',
        requestedUserName: profile.firstName + profile.lastName,
        forumName,
      };
      await axios.post(
        `${userApiServer}/forums/${forum._id}/reportToSuperAdmin`,
        body,
      );
      getBlockedMembers();
    } catch (error) {
      console.error('Error while reporting:', error);
    }
  };

  const formatDate = isoDate => {
    if (!isoDate) return ''; // Handle undefined or null dates
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', {month: 'long'});
    const year = date.getFullYear();

    const daySuffix = day => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${daySuffix(day)} ${month} ${year}`;
  };

  const filteredMembers = allMembers.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMemberSelect = memberId => {
    setSelectedMembers(prevSelected =>
      prevSelected.includes(memberId)
        ? prevSelected.filter(id => id !== memberId)
        : [...prevSelected, memberId],
    );
  };

  const handleSaveMembers = async () => {
    try {
      await axios.put(`${userApiServer}/forums/members/${forum._id}`, {
        userId: selectedMembers,
      });
      setShowModal(false);
      getForumMembers();
      Alert.alert('Success', 'Members updated successfully!');
    } catch (error) {
      console.error('Error updating members:', error);
      Alert.alert('Error', 'Failed to update members.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.forumPostContainer}>
          {forumData && (
            <>
              {(forumData.userId === profile._id || admin) && (
                <View style={styles.manageMembers}>
                  <TouchableOpacity onPress={() => setShowModal(true)}>
                    <Text style={styles.manageMembersBtn}>
                      Manage forum members
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CreateForum', {
                        forumId: forumData._id,
                      })
                    }>
                    <Text style={styles.manageMembersBtn}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.forumPost}>
                <View style={styles.userInfo}>
                  <Image
                    source={
                      forumData.profilePicture
                        ? {uri: forumData.profilePicture}
                        : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')
                    }
                    style={styles.avatar}
                  />
                  <Text style={styles.username}>{forumData.userName}</Text>
                </View>
                <Text style={styles.postDate}>
                  Posted on {formatDate(forumData.createdAt)}
                </Text>
                <Text style={styles.postTitle}>{forumData.title}</Text>
                {/* Render HTML description */}
                <RenderHtml
                  contentWidth={width}
                  source={{html: forumData.description}}
                  baseStyle={styles.postDescription}
                />
                {forumData.picture && (
                  <Image
                    source={
                      forumData.picture
                        ? {uri: forumData.picture}
                        : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')
                    }
                    style={styles.forumImage}
                  />
                )}
                {(forumData.userId === profile._id || admin) &&
                  forumData.type === 'Private' && (
                    <TouchableOpacity
                      style={styles.postActions}
                      onPress={handleDeletePost}>
                      <EllipsisVIcon name="trash" size={20} color={IoColor1} />
                    </TouchableOpacity>
                  )}
                <TouchableOpacity style={styles.replyAction}>
                  <Text>Reply</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {forumData &&
        (forumData.type === 'Public' ||
          forumData.comment === true ||
          admin ||
          forumData.userId === profile._id ||
          members.includes(profile._id)) ? (
          <View style={styles.commentSection}>
            {blockedUserIds.some(
              item => item.userId === profile._id && !item.sent,
            ) ? (
              <Text>
                You have been blocked for the comment:{' '}
                <Text style={styles.boldText}>
                  {
                    blockedUserIds.find(item => item.userId === profile._id)
                      .content
                  }
                </Text>
                . Click{' '}
                <Text
                  style={styles.reportLink}
                  onPress={() =>
                    reportToSuperAdmin(
                      blockedUserIds.find(item => item.userId === profile._id)
                        .commentId,
                      blockedUserIds.find(item => item.userId === profile._id)
                        .content,
                      forum.title,
                    )
                  }>
                  here
                </Text>{' '}
                to report to Super Admin.
              </Text>
            ) : blockedUserIds.some(
                item => item.userId === profile._id && item.sent === true,
              ) ? (
              <Text>
                Reported to super admin. Please wait while it is being verified.
              </Text>
            ) : (
              <CommentSection
                comments={
                  forumData.comments
                    ? filterReportedComments(forumData.comments)
                    : null
                }
                entityId={forumData._id}
                entityType="forums"
                onCommentSubmit={refreshComments}
                onDeleteComment={refreshComments}
              />
            )}
          </View>
        ) : (
          <View style={styles.joinForumContainer}>
            <TouchableOpacity
              style={styles.joinForumButton}
              onPress={handleJoinForum}>
              <Text style={styles.joinForumButtonText}>{requestStatus}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Text style={styles.modalTitle}>Manage Members</Text>
                  <Text style={styles.modalSubtitle}>Add/Remove Members</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search people"
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />

              {/* Scrollable List of Members */}
              <ScrollView style={styles.membersList}>
                {filteredMembers.map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <Image
                      source={
                        member.profilePicture
                          ? {uri: member.profilePicture}
                          : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')
                      }
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <Text style={styles.dataText}>{member.firstName}</Text>
                      <Text style={styles.memberRole}>
                        {member.profileLevel === 0
                          ? 'Super Admin'
                          : member.profileLevel === 1
                          ? 'Admin'
                          : member.profileLevel === 2
                          ? 'Alumni'
                          : 'Student'}
                      </Text>
                    </View>

                    {/* 2) Use the CheckBox component */}
                    <CheckBox
                      style={styles.checkbox}
                      value={members.includes(member._id)}
                      onValueChange={() => handleMemberSelect(member._id)}
                      tintColors={{true: '#00796b', false: '#ccc'}}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMembers}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  forumPostContainer: {
    width: '100%',
  },
  manageMembers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  manageMembersBtn: {
    color: '#00796b',
    textDecorationLine: 'underline',
  },
  forumPost: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  username: {
    fontWeight: 'bold',
    color: 'black',
  },
  postDate: {
    color: '#666',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
  },
  postDescription: {
    marginBottom: 8,
    color: 'black',
  },
  forumImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  postActions: {
    marginBottom: 8,
  },
  replyAction: {
    marginBottom: 8,
  },
  commentSection: {
    width: '100%',
    paddingHorizontal: 16,
  },
  boldText: {
    fontWeight: 'bold',
    color: 'black',
  },
  reportLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  joinForumContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  joinForumButton: {
    width: '50%',
    backgroundColor: 'greenyellow',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinForumButtonText: {
    color: '#000',
  },
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Modal Container
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  modalSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  // Search Input
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    color: 'black',
  },
  // Members List
  membersList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  memberInfo: {
    flex: 1,
  },
  dataText: {
    color: 'black',
    fontWeight: '500',
  },
  memberRole: {
    color: '#666',
    fontSize: 12,
  },
  checkbox: {
    marginLeft: 8,
  },
  // Save Button
  saveButton: {
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default IndividualForum;
