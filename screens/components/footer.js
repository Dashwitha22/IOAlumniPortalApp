import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Home from '../dashboardScreens/home';
import Members from '../dashboardScreens/members';
import Notifications from '../dashboardScreens/notifications';
import Jobs from '../dashboardScreens/jobs';
import Groups from '../dashboardScreens/groups';
import {createStackNavigator} from '@react-navigation/stack';
import Forums from '../dashboardScreens/forums';
import News from '../dashboardScreens/news';
import BusinessConnect from '../dashboardScreens/businessConnect';
import Sponsorships from '../dashboardScreens/sponsorships';
import Events from '../dashboardScreens/events';
import Settings from '../dashboardScreens/settings';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import ProfilePage from '../dashboardScreens/profileComponents/profilePage';
import Archive from '../dashboardScreens/archive';
import Guidance from '../dashboardScreens/Guidance';
import PhotoGallery from '../dashboardScreens/photoGallery';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Forums"
        component={Forums}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="News"
        component={News}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessConnect"
        component={BusinessConnect}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Sponsorships"
        component={Sponsorships}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Events"
        component={Events}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Archive"
        component={Archive}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="photoGallery"
        component={PhotoGallery}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Guidance"
        component={Guidance}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{headerShown: false}}
      />
      {/* <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{headerShown: false}}
      /> */}
    </Stack.Navigator>
  );
}

function useTabBarVisibility(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
  return ![
    'Forums',
    'News',
    'BusinessConnect',
    'Sponsorships',
    'photoGallery',
    'Guidance',
    'Events',
    'Archive',
    'Settings',
    // 'ProfilePage',
  ].includes(routeName);
}

const Footer = ({currentroute, setCurrentRoute}) => {
  useEffect(() => {
    const backAction = () => {
      console.log('Back button was pressed!');
      // You can do more here, like show a custom confirmation dialog, etc.
      setCurrentRoute('Home');
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
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          // console.log('router.name', route.name);
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'dashboard' : 'dashboard';
          } else if (route.name === 'Members') {
            iconName = focused ? 'language' : 'language';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'groups' : 'groups';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'work' : 'work';
          }

          const isVisible = useTabBarVisibility(route);

          // Adjust the color based on whether the tab is active and the view should show it as active
          const iconColor = focused && isVisible ? 'black' : 'gray';

          return (
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                fontFamily: 'Lexend-Bold',
              }}>
              {focused && isVisible && (
                <View style={styles.activeTabIndicator} />
              )}
              <Icon name={iconName} size={size} color={iconColor} />
            </View>
          );
        },
        tabBarLabelStyle: {
          fontFamily: 'Lexend-Regular', // Apply the custom font here
          fontSize: 11, // You can adjust this size as needed
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          paddingTop: 5,
          paddingBottom: 5,
          fontFamily: 'Lexend-Bold',
        },
        // Adding tabBarOnPress for each tab
        tabBarButton: props => (
          <TouchableOpacity
            {...props}
            onPress={() => {
              console.log(`Tab changed to: ${route.name}`);

              setCurrentRoute(route.name);
              props.onPress(); // Ensure the tab switches as usual
            }}
          />
        ),
      })}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Members" component={Members} />
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Jobs" component={Jobs} />
    </Tab.Navigator>
  );
};

export default Footer;

const styles = StyleSheet.create({
  activeTabIndicator: {
    position: 'absolute',
    top: -5,
    height: 2,
    width: '85%',
    backgroundColor: 'black',
    fontFamily: 'Lexend-Bold',
    borderRadius: 2,
  },
});
