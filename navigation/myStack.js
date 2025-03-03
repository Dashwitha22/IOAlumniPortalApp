import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Splashscreen from '../screens/splashscreen';
import Dashboard from '../screens/dashboard';
import Register from '../screens/register';
import ProfilePage from '../screens/dashboardScreens/profileComponents/profilePage';
import ChatScreen from '../screens/components/chatScreen';
import CreateForum from '../screens/dashboardScreens/forumsComponents/createForum';
import NewsDetail from '../screens/dashboardScreens/newsComponents/newsDetail';
import IndividualGroup from '../screens/dashboardScreens/groupsComponents/individualGroup';
import ProfileSettings from '../screens/dashboardScreens/profileComponents/profileSettings';
import WorkExperience from '../screens/dashboardScreens/profileComponents/workExperience';
import ForgotPassword from '../screens/forgotPassword';
import login from '../screens/login';
import AllMembers from '../screens/dashboardScreens/groupsComponents/allMembers';
import ResetPasswordOtp from '../screens/resetPasswordOtp';
import ResetPassword from '../screens/resetPassword';
import BusinessConnectDetails from '../screens/dashboardScreens/businessConnectComponents/businessConnectDetails';
import NewMessageScreen from '../screens/components/newMessageScreen';
import MessageScreen from '../screens/components/messageScreen';

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="SplashScreen"
        component={Splashscreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ResetPasswordOtp"
        component={ResetPasswordOtp}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreateForum"
        component={CreateForum}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetail}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="IndividualGroup"
        component={IndividualGroup}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettings}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="WorkExperience"
        component={WorkExperience}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AllMembers"
        component={AllMembers}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessConnectDetails"
        component={BusinessConnectDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NewMessageScreen"
        component={NewMessageScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MessageScreen"
        component={MessageScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default MyStack;
