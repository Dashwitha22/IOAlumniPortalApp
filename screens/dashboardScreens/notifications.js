import React, {useState} from 'react';
import {View, Dimensions, Text, StyleSheet} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import AllNotifications from './notificationComponents/allNotifications';
import DeclinedNotifications from './notificationComponents/declinedNotifications';

const initialLayout = {width: Dimensions.get('window').width};

const Notifications = () => {
  const profile = useSelector(state => state.auth.user);
  const [index, setIndex] = useState(0);

  // If profile is not available, show a loading or fallback screen
  if (!profile) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Tabs navigation configuration
  const [routes] = useState(
    profile.profileLevel === 0 || profile.profileLevel === 1
      ? [
          {key: 'all', title: 'All Notifications'},
          {key: 'decline', title: 'Declined'},
        ]
      : [{key: 'all', title: 'All Notifications'}],
  );

  // Defining the content for each tab
  const renderScene = ({route}) => {
    switch (route.key) {
      case 'all':
        return <AllNotifications />;
      case 'decline':
        return profile &&
          (profile.profileLevel === 0 || profile.profileLevel === 1) ? (
          <DeclinedNotifications />
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                color: 'black',
                fontSize: 15,
                fontFamily: 'Lexend-Regular',
              }}>
              Wrong Route. Please Go Back
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Render the tab bar
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: '#174873'}}
      style={{backgroundColor: 'white'}}
      labelStyle={{
        color: '#174873',
        textTransform: 'none',
        fontSize: 18,
        color: 'black',
      }}
    />
  );

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
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

export default Notifications;

const styles = StyleSheet.create({});
