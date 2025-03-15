import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome'; // Using FontAwesome for approve/disapprove icons
import {userApiServer} from '../../../config';
import {IoColor1} from '../../../colorCode';

const AllNotifications = ({sendNotificationCount}) => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const isAdmin = profile.profileLevel === 0;
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState('');

  const handleAddLink = async (notificationId, link, department) => {
    console.log('Notification Link:', link);
    setLoading(true);
    try {
      const response = await axios.post(`${userApiServer}/images/addLink`, {
        notificationId,
        link,
        userId: profile._id,
        department,
      });
      if (response.status === 200) {
        console.log('Link added successfully');
        setIsAdded(true);
      } else {
        console.error('Failed to add the link');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error adding link:', error);
      setLoading(false);
    }
  };

  const handleAddMember = async (
    notificationId,
    groupId,
    memberId,
    type,
    toDelete,
    requestedUserName,
  ) => {
    setLoading(true);
    try {
      let url = '';
      if (type === 'forum') {
        url = `${userApiServer}/forums/members/${groupId}`;
      } else if (type === 'group') {
        url = `${userApiServer}/groups/members/${groupId}`;
      } else if (type === 'ID') {
        url = `${userApiServer}/alumni/alumni/validateId`;
      } else if (type === 'Job') {
        url = `${userApiServer}/jobs/${groupId}`;
      } else {
        throw new Error('Invalid type provided');
      }

      if (type === 'Job') {
        const response = await axios.put(url, {
          approved: toDelete,
          notificationId: notificationId,
        });

        if (response.status === 200) {
          setIsAdded(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else if (type === 'group') {
        const response = await axios.put(url, {
          members: {
            userId: memberId,
            profilePicture: profile.profilePicture,
            userName: requestedUserName,
          },
          notificationId: notificationId,
          toDelete,
        });

        if (response.status === 200) {
          setIsAdded(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
        const response = await axios.put(url, {
          userId: memberId,
          notificationId: notificationId,
          toDelete,
        });

        if (response.status === 200) {
          setIsAdded(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error adding/removing user from the group:', error);
      setLoading(false);
    }
  };

  const handleDeleteNotification = async notificationId => {
    try {
      await axios.delete(`${userApiServer}/alumni/alumni/deleteNotification`, {
        data: {notificationId},
      });
      getRequest();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${userApiServer}/groups/requests/req`);
      const filteredData = response.data.filter(
        notification => notification.status === false,
      );
      setNotificationList(filteredData);
      console.log('Filtered Data Length:', filteredData.length); // Debugging
      // sendNotificationCount(filteredData.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching request:', error);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   console.log('Notification List:', notificationList);
  //   console.log('Notification Count:', sendNotificationCount);
  // }, [notificationList, sendNotificationCount]);

  useEffect(() => {
    getRequest();
  }, [isAdded]);

  const handleImageClick = image => {
    setSelectedImage(image);
    setShowImagesModal(true);
  };

  const handleAlumniSearch = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/search/search/notifications?keyword=${user}`,
      );
      setNotificationList(
        response.data.filter(notification => notification.status === false),
      );
    } catch (error) {
      console.error('Error searching alumni:', error);
    }
  };

  const handleComment = async (
    commentId,
    forumId,
    userId,
    notificationId,
    deleteComment,
  ) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${userApiServer}/forums/${forumId}/removeBlock`,
        {
          commentId,
          userId,
          notificationId,
          deleteComment,
        },
      );
      getRequest();
      setLoading(false);
    } catch (error) {
      console.error('Error removing comment block:', error);
      setLoading(false);
    }
  };

  const filteredNotifications = isAdmin
    ? notificationList
    : notificationList.filter(
        notification => notification.ownerId === profile._id,
      );

  console.log('NotificationList : ', filteredNotifications.length);

  useEffect(() => {
    sendNotificationCount(filteredNotifications.length);
  }, [filteredNotifications, sendNotificationCount]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for name"
          placeholderTextColor="black"
          value={user}
          onChangeText={text => setUser(text)}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleAlumniSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredNotifications.length ? (
        <View>
          {filteredNotifications.map(notification => (
            <View key={notification._id} style={styles.notificationItem}>
              <Text style={styles.notificationText}>
                {notification.link ? (
                  <Text>
                    <Text style={styles.linkText}>
                      {notification.requestedUserName}
                    </Text>{' '}
                    has requested to add{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => Linking.openURL(notification.link)}>
                      {notification.link}
                    </Text>{' '}
                    to the photo gallery.
                  </Text>
                ) : notification.ID ? (
                  <Text>
                    <Text style={styles.linkText}>
                      {notification.requestedUserName}
                    </Text>{' '}
                    has requested to validate. Click{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => handleImageClick(notification.ID)}>
                      here
                    </Text>{' '}
                    to view the identity.
                  </Text>
                ) : notification.businessVerification ? (
                  <Text>
                    <Text style={styles.linkText}>
                      {notification.requestedUserName}
                    </Text>{' '}
                    has requested to validate for Business Connect. Click{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(
                          `${userApiServer}/uploads/${notification.businessVerification}`,
                        )
                      }>
                      here
                    </Text>{' '}
                    to view the document.
                  </Text>
                ) : notification.job !== undefined ? (
                  <Text>
                    <Text style={styles.linkText}>
                      {notification.requestedUserName}
                    </Text>{' '}
                    has requested to post a Job/Internship. Click{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() =>
                        Linking.openURL(`/jobs/${notification.jobId}/Jobs`)
                      }>
                      here
                    </Text>{' '}
                    to view the Job/Internship.
                  </Text>
                ) : notification.commentId ? (
                  <Text>
                    <Text style={styles.linkText}>
                      {notification.requestedUserName}
                    </Text>{' '}
                    has requested to unblock him/her from{' '}
                    {notification.forumName} forum. The comment is:{' '}
                    {notification.comment}.
                  </Text>
                ) : (
                  <Text>
                    <Text style={styles.linkText}>
                      {notification.requestedUserName}
                    </Text>{' '}
                    has requested to join{' '}
                    {notification.groupName
                      ? `${notification.groupName} Group`
                      : `${notification.forumName} forum`}
                    .
                  </Text>
                )}
              </Text>

              <View style={styles.actionsContainer}>
                {notification.link ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      handleAddLink(
                        notification._id,
                        notification.link,
                        notification.department,
                      )
                    }>
                    <Text style={styles.actionButtonText}>Accept Link</Text>
                  </TouchableOpacity>
                ) : notification.commentId ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      handleComment(
                        notification.commentId,
                        notification.forumId,
                        notification.userId,
                        notification._id,
                        false,
                      )
                    }>
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      handleAddMember(
                        notification._id,
                        notification.forumId ||
                          notification.groupId ||
                          notification.jobId ||
                          '',
                        notification.userId,
                        notification.job !== undefined
                          ? 'Job'
                          : notification.ID
                          ? 'ID'
                          : notification.forumId
                          ? 'forum'
                          : 'group',
                        false,
                        notification.requestedUserName,
                      )
                    }>
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => {
                    if (notification.ID) {
                      handleAddMember(
                        notification._id,
                        '',
                        notification.userId,
                        'ID',
                        true,
                      );
                    } else if (notification.job !== undefined) {
                      handleAddMember(
                        notification._id,
                        notification.jobId,
                        notification.userId,
                        'Job',
                        true,
                      );
                    } else if (notification.commentId) {
                      handleComment(
                        notification.commentId,
                        notification.forumId,
                        notification.userId,
                        notification._id,
                        true,
                      );
                    } else {
                      handleDeleteNotification(notification._id);
                    }
                  }}>
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noNotificationsText}>No Notifications</Text>
      )}

      <Modal
        visible={showImagesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagesModal(false)}>
        <View style={styles.modalContainer}>
          {selectedImage && (
            <Image source={{uri: selectedImage}} style={styles.modalImage} />
          )}
          <Button title="Close" onPress={() => setShowImagesModal(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AllNotifications;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  searchInput: {
    width: '70%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    color: 'black',
  },
  searchButton: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: IoColor1,
    justifyContent: 'center',
    padding: 10,
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
  },
  notificationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  notificationText: {
    color: 'black',
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  rejectButton: {
    backgroundColor: 'red',
  },
  actionButtonText: {
    color: 'white',
  },
  noNotificationsText: {
    color: 'black',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
});
