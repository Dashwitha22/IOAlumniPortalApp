import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  DrawerLayoutAndroid,
  ScrollView,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import Footer from './components/footer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SearchIcon from 'react-native-vector-icons/FontAwesome';
import {createStackNavigator} from '@react-navigation/stack';
import NavigationView from './components/navigationView';
import {useFocusEffect} from '@react-navigation/native';

const Stack = createStackNavigator();

const Dashboard = ({navigation}) => {
  const profileuser = useSelector(state => state.auth.user);
  const user = profileuser ? profileuser : {}; // Add null check here
  const userName = profileuser ? profileuser.firstName : 'Guest'; // Add null check here
  const [currentroute, setCurrentRoute] = useState('Dashboard');
  const drawer = useRef(null); // Create a ref

  useFocusEffect(
    React.useCallback(() => {
      // This block runs when the component is focused
      return () => {
        // This block runs when the component is unfocused
        if (drawer.current) {
          drawer.current.closeDrawer();
        }
      };
    }, []),
  );

  useEffect(() => {
    console.log('current route from dashboard', currentroute);
  });
  const navigateTo = (screen, params) => {
    if (drawer.current) {
      drawer.current.closeDrawer(); // Close drawer before navigating
    }
    navigation.navigate(screen, params); // Navigate
  };

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={280}
      drawerPosition={'left'}
      onDrawerClose={() => console.log('Drawer closed')}
      onDrawerOpen={() => console.log('Drawer opened')}
      renderNavigationView={() => (
        <NavigationView
          user={user}
          navigate={navigateTo}
          navigation={navigation}
          currentroute={currentroute}
          setCurrentRoute={setCurrentRoute}
        />
      )}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={() => drawer.current.openDrawer()}>
            {/* Replace with your own profile picture */}
            <Image
              style={styles.profilePic}
              source={
                user.profilePicture
                  ? {uri: user.profilePicture}
                  : require('../assets/images/girlAvatar.png')
              }
            />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontFamily: 'Lexend-Bold',
              }}>
              Hello, Welcome {userName}!
            </Text>
          </View>
          {/* <View style={styles.searchContainer}>
            <SearchIcon name="search" style={styles.searchicon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#000"
            />
          </View> */}

          <TouchableOpacity
            style={styles.chatIconContainer}
            onPress={() => navigation.navigate('ChatScreen')}>
            <Icon name="comment-dots" size={24} color="gray" solid />
          </TouchableOpacity>
        </View>
        <Footer
          style={{position: 'absolute', bottom: 0, left: 0, right: 0}}
          currentroute={currentroute}
          setCurrentRoute={setCurrentRoute}
        />
      </View>
    </DrawerLayoutAndroid>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  userName: {
    marginTop: 20,
    fontSize: 20,
    color: 'deepskyblue',
    fontFamily: 'Lexend-Regular',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#eee', // Match this with your header background color
    height: 60, // Set the height you need for your header
    zIndex: 1000, // Ensure the header is above other elements
  },
  profilePicContainer: {
    // Adjust as needed for styling
  },
  profilePic: {
    width: 40, // Adjust the size as needed
    height: 40, // Adjust the size as needed
    borderRadius: 20, // Make it round
  },
  searchContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#ECECEC', // Background color for the search input
    borderRadius: 20, // Rounded corners for the search input
    paddingLeft: 30, // Padding inside the search input
    height: 40, // Match the height with the profile picture
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#000000',
    fontFamily: 'Lexend-Regular',
  },
  searchicon: {
    position: 'absolute',
    left: 10,
    fontSize: 15,
    color: '#000000',
  },
  chatIconContainer: {
    justifyContent: 'flex-end',
  },
});
