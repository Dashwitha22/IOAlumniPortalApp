import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import groupsPicture from '../../../assets/images/groupsPicture.jpg';
import {useSelector} from 'react-redux';
import {userApiServer} from '../../../config';
import {ActivityIndicator} from 'react-native-paper';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {IoColor1} from '../../../colorCode';
import DocumentPicker from 'react-native-document-picker';

// Helper function to format date
const formatDate = dateString => {
  const date = new Date(dateString); // Handle ISO 8601 format
  const day = date.getDate();
  const month = date.toLocaleDateString('default', {month: 'long'}); // Get full month name
  const year = date.getFullYear();

  // Function to get ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = day => {
    if (day > 3 && day < 21) return 'th'; // Covers 11th - 20th
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

  const OrdinalSuffix = getOrdinalSuffix(day);

  // Return the formatted date with ordinal suffix
  return `${day}${OrdinalSuffix} ${month} ${year}`;
};

const DisplayGroupItem = ({item, setIndex, title}) => {
  const profile = useSelector(state => state.auth.user);
  const [requestStatus, setRequestStatus] = useState('Request to Join');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notificationList, setNotificationList] = useState([]);

  const navigation = useNavigation();

  const checkRequestStatus = async () => {
    try {
      const response = await axios.get(`${userApiServer}/groups/requests/req`, {
        params: {userId: profile._id, groupId: item._id},
      });
      const notifications = response.data;
      setNotificationList(notifications);
    } catch (error) {
      console.error('Error fetching request status:', error);
    }
  };
  useEffect(() => {
    checkRequestStatus();
  }, []);

  useEffect(() => {
    const matchingNotification = notificationList.find(
      notification =>
        notification.groupId === item._id &&
        notification.userId === profile._id,
    );
    if (matchingNotification) {
      setRequestStatus('Requested');
    } else {
      setRequestStatus('Request to Join');
    }
  }, [item._id, notificationList, profile._id]);

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (res && res.length > 0) {
        setSelectedFile({
          name: res[0].name,
          uri: res[0].uri,
          type: res[0].type,
        });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled file upload');
      } else {
        console.error('Error picking file: ', err);
      }
    }
  };

  const handleRequest = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const requestedUserName = `${profile.firstName} ${profile.lastName}`;
      const body = {
        ownerId: item.userId,
        groupId: item._id,
        userId: profile._id,
        groupName: item.groupName,
        requestedUserName,
      };

      // Attach selected file if available
      if (selectedFile) {
        formData.append('businessVerification', {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name,
        });
      }

      for (const key in body) {
        formData.append(key, body[key]);
      }

      const response = await axios.post(
        `${userApiServer}/groups/createRequest`,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response.data.requested === true) {
        setRequestStatus('Requested');
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedFile(null); // Reset the file after submission
    }
  };

  const handleAddMember = async groupId => {
    console.log('handleAddmember');
    try {
      const response = await axios.put(
        `${userApiServer}/groups/members/${groupId}`,
        {
          members: {
            userId: profile._id,
            profilePicture: profile.profilePicture,
            userName: `${profile.firstName} ${profile.lastName}`,
            profileLevel: profile.profileLevel,
          },
        },
      );
      console.log('Response of add member function :', response.data);
      if (response.status === 200) {
        setIndex(1); // Navigate to Joined Groups (index 1 is for Joined Groups)
        //   navigateTo(`/groups/${groupId}`)
        console.log('already navigate');
      } else {
        console.error('Failed to add/remove user to/from the group');
      }
    } catch (error) {
      console.error('Error adding user to the group:', error);
    }
  };

  // Condition to determine whether to make the groupCard TouchableOpacity or View
  const isGroupTouchable =
    profile.profileLevel === 0 ||
    (item.groupType === 'Public' &&
      item.members.some(member => member.userId === profile._id)) ||
    (item.groupType === 'Private' &&
      item.members.some(member => member.userId === profile._id)) === true;

  const GroupContainer = isGroupTouchable ? TouchableOpacity : View;

  return (
    <GroupContainer
      style={styles.groupCard}
      onPress={
        isGroupTouchable
          ? () => navigation.navigate('IndividualGroup', {item})
          : null
      }>
      {/* Group Image */}
      <Image
        source={item.groupPicture ? {uri: item.groupPicture} : groupsPicture}
        style={styles.groupImage}
        resizeMode="cover"
      />

      {/* Group Name and Date */}
      <Text style={styles.groupName}>{item.groupName}</Text>
      <Text style={styles.groupDate}>{formatDate(item.createdAt)}</Text>

      {/* Group Badge */}
      <View
        style={[
          styles.badge,
          item.groupType === 'Public'
            ? styles.publicBadge
            : styles.privateBadge,
        ]}>
        <Text style={styles.badgeText}>{item.groupType}</Text>
      </View>

      {/* Group Members Icon and Count */}
      <View style={styles.membersContainer}>
        <Icon name="groups" size={18} color="#004C8A" />
        <Text style={styles.groupMembers}>{item.members.length} Members</Text>
      </View>

      {/* Join/Request Button */}
      {(item.groupType === 'Public' || item.groupType === 'Private') &&
        !item.members.some(member => member.userId === profile._id) && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              if (item.groupType === 'Public') {
                handleAddMember(item._id);
              } else if (
                profile.department === item.department ||
                item.category === 'Business Connect' ||
                item.department === 'All'
              ) {
                if (requestStatus === 'Requested') {
                  handleRequest();
                } else {
                  setModalVisible(true);
                }
              }
            }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>
                {item.groupType === 'Public' ? 'Join' : requestStatus}
              </Text>
            )}
          </TouchableOpacity>
        )}

      {/* {!item.members.some(member => member.userId === profile._id) && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() =>
            item.groupType === 'Public'
              ? handleAddMember(item._id)
              : handleRequest()
          }>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinButtonText}>
              {item.groupType === 'Public' ? 'Join' : requestStatus}
            </Text>
          )}
        </TouchableOpacity>
      )} */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedFile(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Your Business</Text>
            <Text style={styles.modalDescription}>Upload a document:</Text>

            {/* File Upload Button */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFileUpload}>
              <Text style={styles.uploadButtonText}>
                {selectedFile && selectedFile.name
                  ? selectedFile.name
                  : 'Choose File'}
              </Text>
            </TouchableOpacity>

            {/* Buttons Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleRequest}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedFile(null);
                }}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GroupContainer>
  );
};

export default DisplayGroupItem;

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: '#eeeeee',
    paddingVertical: 5,
    marginVertical: 10,
    marginHorizontal: '1%', // Small margin for spacing between cards
    borderRadius: 5,
    width: '48%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  groupImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#ddd',
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  groupDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
  },
  joinButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: IoColor1,
    borderRadius: 5,
    fontFamily: 'Lexend-Regular',
    width: '90%',
  },
  joinButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupMembers: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
    fontFamily: 'Lexend-Regular',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  publicBadge: {
    backgroundColor: '#4CAF50',
  },
  privateBadge: {
    backgroundColor: '#f44336',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Lexend-Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
  },
  modalContent: {
    width: '80%', // Adjust width as needed
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },

  modalDescription: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  uploadButton: {
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: IoColor1,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
