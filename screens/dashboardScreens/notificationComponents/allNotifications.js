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
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome'; // Using FontAwesome for approve/disapprove icons
import {userApiServer} from '../../../config';
import {IoColor1} from '../../../colorCode';

const AllNotifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const isAdmin = profile.profileLevel === 0;
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
      } else if (type === 'Job') {
        url = `${userApiServer}/jobs/${groupId}`;
      } else {
        throw new error('Invalid type provided');
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
      setLoading(false);
    }
  };

  const handleDeleteNotification = async notificationId => {
    try {
      await axios.delete(`${userApiServer}/alumni/alumni/deleteNotification`, {
        data: {notificationId},
      });
      getRequest();
    } catch (error) {}
  };

  const getRequest = async (searchUser = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${userApiServer}/groups/requests/req`);
      const filteredData = response.data.filter(
        notification =>
          notification.status === false &&
          notification.requestedUserName
            .toLowerCase()
            .includes(searchUser.toLowerCase()),
      );
      setNotificationList(filteredData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest(user);
  }, [isAdded]);

  const handleImageClick = image => {
    setSelectedImage(image);
    setShowImagesModal(true);
  };

  const filteredNotifications = isAdmin
    ? notificationList
    : notificationList.filter(
        notification => notification.ownerId === profile._id,
      );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 20,
          fontFamily: 'Lexend-Regular',
        }}>
        <TextInput
          placeholder="Search for name"
          placeholderTextColor="black"
          value={user}
          onChangeText={text => setUser(text)}
          style={{
            width: '70%',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            color: 'black',
            fontFamily: 'Lexend-Regular',
          }}
        />
        <TouchableOpacity
          style={{
            borderRadius: 5,
            borderWidth: 1,
            backgroundColor: IoColor1,
            justifyContent: 'center',
            fontFamily: 'Lexend-Regular',
            padding: 10,
          }}
          onPress={() => getRequest(user)}>
          <Text style={{color: 'white', fontFamily: 'Lexend-Regular'}}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredNotifications.length ? (
        <View>
          {filteredNotifications.map(notification => (
            <View
              key={notification._id}
              style={{
                padding: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'Lexend-Regular',
              }}>
              <Text style={{color: 'black', fontFamily: 'Lexend-Regular'}}>
                {notification.requestedUserName} has requested...
              </Text>

              {/* Display image or ID verification link (if available) */}
              {notification.ID && (
                <TouchableOpacity
                  onPress={() => handleImageClick(notification.ID)}>
                  <Text
                    style={{
                      color: 'blue',
                      textDecorationLine: 'underline',
                      fontFamily: 'Lexend-Regular',
                    }}>
                    View ID
                  </Text>
                </TouchableOpacity>
              )}

              {/* Approve Icon */}
              <TouchableOpacity
                onPress={() =>
                  handleAddMember(
                    notification._id,
                    notification.groupId,
                    notification.userId,
                    'group',
                    false,
                  )
                }>
                <Icon name="check" size={30} color="green" />
              </TouchableOpacity>

              {/* Reject Icon */}
              <TouchableOpacity
                onPress={() => handleDeleteNotification(notification._id)}>
                <Icon name="times" size={30} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <Text
          style={{color: 'black', fontSize: 15, fontFamily: 'Lexend-Regular'}}>
          No Notifications
        </Text>
      )}

      {/* Image Modal */}
      <Modal
        visible={showImagesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagesModal(false)}>
        <View style={{backgroundColor: 'white', padding: 20}}>
          {selectedImage && (
            <Image
              source={{uri: selectedImage}}
              style={{width: '100%', height: 200}}
            />
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
    fontFamily: 'Lexend-Regular',
    padding: 10,
  },
});
