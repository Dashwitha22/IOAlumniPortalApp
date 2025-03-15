import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons for the notification icon
import AllNotifications from './notificationComponents/allNotifications';
import DeclinedNotifications from './notificationComponents/declinedNotifications';

const initialLayout = {width: Dimensions.get('window').width};

const NotificationsPage = () => {
  const profile = useSelector(state => state.auth.user);
  const [index, setIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // Update notification count from child component
  const updateNotificationCount = count => {
    setNotificationCount(count);
  };

  // Define tabs based on user profile level
  const [routes] = useState(
    profile.profileLevel === 0 || profile.profileLevel === 1
      ? [
          {key: 'all', title: 'All Notifications'},
          {key: 'declined', title: 'Declined'},
        ]
      : [{key: 'all', title: 'All Notifications'}],
  );

  // Render the content for each tab
  const renderScene = SceneMap({
    all: () => (
      <AllNotifications sendNotificationCount={updateNotificationCount} />
    ),
    declined: () =>
      profile && (profile.profileLevel === 0 || profile.profileLevel === 1) ? (
        <DeclinedNotifications />
      ) : (
        <View style={styles.wrongRouteContainer}>
          <Text style={styles.wrongRouteText}>Wrong Route. Please Go Back</Text>
        </View>
      ),
  });

  // Custom tab bar with notification count
  const renderTabBar = props => {
    const isAllNotificationsActive = index === 0;

    return (
      <TabBar
        {...props}
        indicatorStyle={{backgroundColor: '#174873'}}
        style={{backgroundColor: 'white'}}
        renderLabel={({route, focused}) => {
          if (route.key === 'all') {
            return (
              <View style={styles.tabLabelContainer}>
                <Text style={[styles.tabText, focused && styles.activeTabText]}>
                  {route.title}
                </Text>
                <View
                  style={[
                    styles.notificationCount,
                    {backgroundColor: focused ? 'black' : 'gray'},
                  ]}>
                  <Text style={styles.notificationCountText}>
                    {notificationCount}
                  </Text>
                </View>
              </View>
            );
          }
          return (
            <Text style={[styles.tabText, focused && styles.activeTabText]}>
              {route.title}
            </Text>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Page Title */}
      <View style={styles.pageTitleContainer}>
        <Icon name="notifications" size={24} color="#174873" />
        <Text style={styles.pageTitle}>Notifications</Text>
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

export default NotificationsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  pageTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#174873',
    marginLeft: 10,
  },
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#174873',
  },
  notificationCount: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  notificationCountText: {
    color: 'white',
    fontSize: 12,
  },
  wrongRouteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrongRouteText: {
    color: 'black',
    fontSize: 15,
  },
});
