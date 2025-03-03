import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {userApiServer} from '../../../config';

const DeclinedNotifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  const profile = useSelector(state => state.profile);
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequest();
  }, [isAdded]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : notificationList.length ? (
        <View>
          {notificationList.map(notification => (
            <View
              key={notification._id}
              style={{padding: 10, fontFamily: 'Lexend-Regular'}}>
              <Text style={{color: 'black', fontFamily: 'Lexend-Regular'}}>
                {notification.requestedUserName} was declined.
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{color: 'black', fontFamily: 'Lexend-Regular'}}>
          No Declined Notifications
        </Text>
      )}
    </ScrollView>
  );
};

export default DeclinedNotifications;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    fontFamily: 'Lexend-Regular',
  },
});
