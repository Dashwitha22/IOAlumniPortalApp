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
import Icon from 'react-native-vector-icons/MaterialIcons'; // For approve/delete icons
import {userApiServer} from '../../../config';

const DeclinedNotifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState('');

  const handleAddMember = async (
    notificationId,
    groupId,
    memberId,
    type,
    toDelete,
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
      } else {
        throw new Error('Invalid type provided');
      }

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
        notification => notification.status === true,
      );
      setNotificationList(filteredData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching request:', error);
      setLoading(false);
    }
  };

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
        response.data.filter(notification => notification.status === true),
      );
    } catch (error) {
      console.error('Error searching alumni:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Search Bar */}
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
      ) : notificationList.length ? (
        <View>
          {notificationList.map(notification => (
            <View key={notification._id} style={styles.notificationItem}>
              <Text style={styles.notificationText}>
                {notification.ID ? (
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
                ) : isAdded ? (
                  <Text>
                    {notification.requestedUserName} has been added to{' '}
                    {notification.groupName
                      ? `${notification.groupName} Group`
                      : `${notification.forumName} forum`}
                  </Text>
                ) : (
                  <Text>
                    {notification.requestedUserName} has requested to join{' '}
                    {notification.groupName
                      ? `${notification.groupName} Group`
                      : `${notification.forumName} forum`}
                  </Text>
                )}
              </Text>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    handleAddMember(
                      notification._id,
                      notification.forumId || notification.groupId || '',
                      notification.userId,
                      notification.ID
                        ? 'ID'
                        : notification.forumId
                        ? 'forum'
                        : 'group',
                      false,
                    )
                  }>
                  <Icon name="check" size={24} color="green" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteNotification(notification._id)}>
                  <Icon name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noNotificationsText}>
          No Declined Notifications
        </Text>
      )}

      {/* Image Modal */}
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

export default DeclinedNotifications;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    color: 'black',
  },
  searchButton: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#F8A700',
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
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
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
