import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useFocusEffect,
  useNavigation,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../store/actions/authActions';
import {IoColor1, IoColor2} from '../../colorCode';

const NavigationView = ({
  user,
  navigate,
  navigation,
  currentroute,
  setCurrentRoute,
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const profileuser = useSelector(state => state.auth.user);
  const profile = profileuser ? profileuser : {}; // Add null check here

  const handleLogout = () => {
    // console.log('Navigate function in handleLogout:', navigate);
    dispatch(logout(navigation));
  };

  const handleTabPress = (tabName, screenName) => {
    setActiveTab(tabName); // Set the active tab on press
    setCurrentRoute(tabName);
    navigate(screenName, {screen: screenName});
  };

  useEffect(() => {
    const backAction = () => {
      console.log('Back button was pressed!');
      // You can do more here, like show a custom confirmation dialog, etc.
      setActiveTab('Home');
      // Returning 'true' prevents the default back button behavior
      return false; // If you want to allow the default behavior (going back), set this to 'false'
    };

    // Add event listener for back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    // Cleanup the event listener on component unmount
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setActiveTab(currentroute);
    console.log('currentroute', currentroute);
  }, [currentroute]);

  return (
    <View style={styles.drawerContainer}>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => navigate('ProfilePage', {screen: 'ProfilePage'})}>
        <Image
          style={styles.profilePicture}
          source={
            profile.profilePicture
              ? {uri: profile.profilePicture}
              : require('../../assets/images/girlAvatar.png')
          }
        />
        {user ? (
          <>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'Lexend-Regular',
              }}>
              View Profile
            </Text>
          </>
        ) : (
          <Text style={styles.userName}>Guest</Text>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <ScrollView style={{flexGrow: 1}}>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            (activeTab === 'Dashboard' || activeTab === 'Home') &&
              styles.activeTab,
          ]}
          onPress={() => handleTabPress('Dashboard', 'HomeMain')}>
          <Icon name="dashboard" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Members' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Members', 'Members')}>
          <Icon name="language" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Members</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Groups' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Groups', 'Groups')}>
          <Icon name="groups" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Forums' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Forums', 'Forums')}>
          <Icon name="forum" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Forums</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.drawerItem, activeTab === 'News' && styles.activeTab]}
          onPress={() => handleTabPress('News', 'News')}>
          <Icon name="description" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'BusinessConnect' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('BusinessConnect', 'BusinessConnect')}>
          <Icon
            name="business-center"
            style={[styles.icon, {color: 'white'}]}
          />
          <Text style={styles.drawerItemText}>Business Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Sponsorships' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Sponsorships', 'Sponsorships')}>
          <Icon name="favorite" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Sponsorships</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Events' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Events', 'Events')}>
          <Icon name="event" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Internships' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Internships', 'Internships')}>
          <Icon name="work" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Jobs/Internships</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Archive' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Archive', 'Archive')}>
          <Icon name="pages" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Archive</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'photoGallery' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('photoGallery', 'photoGallery')}>
          <Icon name="photo-library" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Photo Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Guidance' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Guidance', 'Guidance')}>
          <Icon name="article" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Guidance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.drawerItem,
            activeTab === 'Notifications' && styles.activeTab,
          ]}
          onPress={() => handleTabPress('Notifications', 'Notifications')}>
          <Icon name="notifications" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Notifications</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigate('Settings', {screen: 'Settings'})}>
          <Icon name="settings" style={[styles.icon, {color: 'white'}]} />
          <Text style={styles.drawerItemText}>Settings</Text>
        </TouchableOpacity> */}
      </ScrollView>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo-io.png')}
          style={styles.logo}
        />
      </View>
    </View>
  );
};

export default NavigationView;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: IoColor1,
  },
  activeTab: {
    backgroundColor: IoColor2, // Active tab background color
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: 'white',
  },
  logoutButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ff4081',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerItemText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
  icon: {
    fontSize: 25,
    marginRight: 5,
  },
  logoContainer: {
    alignItems: 'center',
    margin: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});
