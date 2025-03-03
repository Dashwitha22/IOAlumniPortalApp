import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  BackHandler,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import CheckCircle from 'react-native-vector-icons/MaterialCommunityIcons';
import {ProgressBar} from 'react-native-paper';
import {userApiServer} from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import AboutMeSection from './aboutMeSection';
import ProfileWorkExperience from './profileWorkExperience';
import EducationSection from './educationSection';
import Home from '../home';
import JoinedGroups from '../groupsComponents/joinedGroups';
import {updateProfile} from '../../../store/actions/authActions';
import {IoColor1} from '../../../colorCode';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';

const ProfilePage = ({route}) => {
  // const {member} = route.params;
  const navigation = useNavigation();

  // Get logged-in user's profile from the store
  const loggedInUser = useSelector(state => state.auth.user);

  // If navigating from MemberCard, use the member's details, otherwise use logged-in user's details
  const [profile, setProfile] = useState(route?.params?.member || loggedInUser);

  console.log('PROFILE :', profile);

  const [workExperiences, setWorkExperiences] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const dispatch = useDispatch();

  const totalProperties = 5; // Number of profile sections to complete
  let completedProperties = 0;

  if (profile && profile.profilePicture) completedProperties++;
  if (profile && profile.firstName) completedProperties++;
  if (profile && profile.workExperience && profile.workExperience.length > 0)
    completedProperties++;
  if (profile && profile.country) completedProperties++;
  if (profile && profile.city) completedProperties++;

  // Calculate completion percentage
  useEffect(() => {
    setCompletionPercentage((completedProperties / totalProperties) * 100);
    fetchWorkExperiences();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // This will run when the screen is focused
      fetchWorkExperiences(); // Fetch the work experiences when the page is focused
      setCompletionPercentage((completedProperties / totalProperties) * 100); // Recalculate profile completion
    }, [profile, completedProperties]), // Add dependencies if needed
  );

  const fetchWorkExperiences = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token', token);

      if (!token) {
        throw new Error('No token found'); // Handle case where token is not found
      }
      const response = await fetch(
        `${userApiServer}/alumni/workExperience/${profile._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token in Authorization header
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch work experiences');
      }
      const data = await response.json();
      setWorkExperiences(data); // Set work experiences in state
    } catch (error) {
      console.error('Error fetching work experiences:', error);
    }
  };

  const findCurrentWorkingAt = () => {
    const currentWorkExperience = workExperiences.find(
      experience => experience.endMonth === 'current',
    );
    if (currentWorkExperience) {
      return currentWorkExperience.companyName;
    } else {
      return 'No current work experience found';
    }
  };

  const renderExpirationDateMessage = () => {
    if (profile.ID && profile.expirationDate) {
      return 'Your account is being validated';
    }

    if (profile.expirationDate !== null) {
      const currentDate = new Date();
      const expirationDate = new Date(profile.expirationDate);
      const timeDiff = expirationDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysDiff > 0) {
        return (
          <Text>
            Your account is not validated and will expire in {daysDiff} days.
          </Text>
        );
      } else if (daysDiff < 0) {
        return 'Your account has expired';
      }
    }
    return null;
  };

  const AboutTab = () => (
    <View style={styles.tabContent}>
      <AboutMeSection profile={profile} loggedInUserId={loggedInUser._id} />
      <ProfileWorkExperience
        profile={profile}
        loggedInUserId={loggedInUser._id}
      />
      <EducationSection profile={profile} />
    </View>
  );
  const [index, setIndex] = useState(0); // Initial tab index

  const PostsTab = () => (
    <View style={styles.postsContent}>
      <Home
        profileUserId={profile._id}
        isProfile={true}
        index={index}
        entityType="posts"
        showCreatePost={true}
        showDeleteButton={true}
        showFloatingMenu={false}
      />
    </View>
  );

  const JoinedGroupsTab = () => <JoinedGroups profile={profile} />;

  // State for the TabView
  const [routes] = useState([
    {key: 'about', title: 'About'},
    {key: 'posts', title: 'Posts'},
    {key: 'groups', title: 'Groups'},
  ]);

  // Mapping keys to corresponding scenes (tabs)
  const renderScene = SceneMap({
    about: AboutTab,
    posts: PostsTab,
    groups: JoinedGroupsTab,
  });

  // TabBar customization
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: '#004C8A'}} // Tab indicator color
      style={{backgroundColor: 'white', marginVertical: 15}} // Tab background color
      activeColor="#004C8A" // Active tab text color
      inactiveColor="gray" // Inactive tab text color
      labelStyle={{fontFamily: 'Lexend-Bold'}} // Font styling for the tab labels
    />
  );

  const handleImageChange = async type => {
    try {
      const image = await ImagePicker.openPicker({
        width: type === 'coverPicture' ? 1200 : 300,
        height: type === 'coverPicture' ? 400 : 300,
        cropping: true,
      });

      // ✅ Show local image immediately
      setProfile(prevProfile => ({
        ...prevProfile,
        [type]: image.path, // Temporary local image update
      }));

      // Prepare FormData for upload
      const formData = new FormData();
      formData.append('image', {
        uri: image.path.startsWith('file://')
          ? image.path
          : `file://${image.path}`,
        type: image.mime,
        name: image.path.split('/').pop(),
      });

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      // Upload Image to Server
      const response = await axios.post(
        `${userApiServer}/uploadImage/singleImage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data) {
        console.log(`✅ ${type} Updated URL:`, response.data);

        // ✅ Update Only Profile Picture or Cover Picture in DB
        const updateResponse = await fetch(
          `${userApiServer}/alumni/${profile._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({[type]: response.data}), // Update only the selected field
          },
        );

        if (updateResponse.ok) {
          const updatedProfile = await updateResponse.json();
          setProfile(updatedProfile); // Update state
          dispatch(updateProfile(updatedProfile)); // Update Redux store if using

          Toast.show({
            type: 'success',
            text1: `${
              type === 'coverPicture' ? 'Cover' : 'Profile'
            } picture updated successfully!`,
          });
        } else {
          throw new Error(`Failed to update ${type} in database`);
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error(`❌ Error updating ${type}:`, error);
      Toast.show({
        type: 'error',
        text1: `${
          type === 'coverPicture' ? 'Cover' : 'Profile'
        } image upload failed`,
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.coverPhotoContainer}>
          <Image
            style={styles.coverPhoto}
            source={
              profile.coverPicture
                ? {uri: profile.coverPicture}
                : require('../../../assets/images/profile_coverImage.webp')
            }
            resizeMode="cover"
          />

          {/* Edit Profile Button Positioned on Cover Image */}
          {loggedInUser._id === profile._id && (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('ProfileSettings')}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          {/* Expiration Date Message Section */}
          <View
            style={{
              position: 'absolute',
              top: '-2%',
              left: '10%',
              right: '10%',
              alignSelf: 'center',
              // transform: [{translateX: -50}, {translateY: -50}],
            }}>
            {renderExpirationDateMessage() && (
              <View
                style={{
                  backgroundColor: 'cornsilk',
                  width: '100%',
                  padding: 10,
                  borderRadius: 5,
                  marginBottom: 10,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: 'orangered',
                    fontSize: 15,
                    fontFamily: 'Lexend-Bold',
                    textAlign: 'center',
                  }}>
                  {renderExpirationDateMessage()}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={() => handleImageChange('coverPicture')}>
            <Icon name="camera" size={15} color="#0073b1" />
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity style={styles.pencilIcon}>
          <Icon name="pencil" size={23} color="#4f4d4d" />
        </TouchableOpacity> */}
        <View style={styles.profilePicContainer}>
          <Image
            source={
              profile.profilePicture
                ? {uri: profile.profilePicture}
                : require('../../../assets/images/girlAvatar.png')
            }
            style={styles.profilePic}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.plusIcon}
            onPress={() => handleImageChange('profilePicture')}>
            <Icon name="pencil" size={18} color="white" />
          </TouchableOpacity>
          {/* <Image
            style={styles.openToWork}
            source={require('../../../assets/images/openToWork.png')}
          /> */}
        </View>

        <View style={styles.headerDetails}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.name}>
              {profile.userName ||
                `${profile.firstName || ''} ${profile.lastName || ''}`.trim()}
            </Text>
            {profile.validated === true ? (
              <CheckCircle
                name="check-decagram"
                size={20}
                color="#51a8f5"
                style={{marginLeft: 5}}
              />
            ) : null}
            <Text style={styles.pronouns}>
              {profile.gender?.toString().toLowerCase() === 'male'
                ? '(He/Him)'
                : '(She/Her)'}
            </Text>
          </View>
          <Text style={styles.title}>
            {profile.profileLevel === 1
              ? 'ADMIN'
              : profile.profileLevel === 2
              ? 'ALUMNI'
              : profile.profileLevel === 3
              ? 'STUDENT'
              : 'SUPER ADMIN'}
          </Text>
          <Text style={styles.aboutUser}>
            Passionate soul, chasing dreams, inspiring others, embracing life's
            adventures joyfully.
          </Text>
        </View>
        {/* Count of groups, followers, following */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('JoinedGroups', {profileId: profile._id})
            }>
            <View>
              <Text style={{color: 'black', fontFamily: 'Lexend-Regular'}}>
                Groups
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  color: '#3A3A3A',
                  fontSize: 16,

                  alignSelf: 'center',
                }}>
                {profile.groupNames ? profile.groupNames.length : '0'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Followers', {profileId: profile._id})
            }>
            <View>
              <Text style={{color: 'black', fontFamily: 'Lexend-Regular'}}>
                Followers
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  color: '#3A3A3A',
                  fontSize: 16,

                  alignSelf: 'center',
                }}>
                {profile.followers ? profile.followers.length : '0'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Following', {profileId: profile._id})
            }>
            <View>
              <Text style={{color: 'black', fontFamily: 'Lexend-Regular'}}>
                Following
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  color: '#3A3A3A',
                  fontSize: 16,

                  alignSelf: 'center',
                }}>
                {profile.following ? profile.following.length : '0'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Profile completion section */}
        {loggedInUser._id === profile._id && (
          <View style={styles.profileCompletionContainer}>
            <View style={styles.profileCompletionHeader}>
              <Icon name="user" size={18} color="white" />
              <Text style={styles.profileCompletionTitle}>
                Profile Completion
              </Text>
            </View>
            <View style={styles.profileCompletionBody}>
              {completionPercentage < 100 && (
                <View style={styles.progressBarContainer}>
                  <Text style={styles.percentageText}>
                    {Math.round(completionPercentage)}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFilled,
                        {width: `${completionPercentage}%`}, // Dynamically setting the filled width
                      ]}
                    />
                    <View
                      style={[
                        styles.progressBarUnfilled,
                        {width: `${100 - completionPercentage}%`}, // Dynamically setting the unfilled width
                      ]}
                    />
                  </View>
                </View>
              )}
              <View style={styles.profileCompletionList}>
                {profile.profilePicture ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'green',
                      marginVertical: 5,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    <Text style={{marginRight: 10}}>
                      <CheckCircle
                        name="check-circle"
                        size={18}
                        color="green"
                      />{' '}
                    </Text>
                    Profile Picture Added
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileSettings')}>
                    <Text style={styles.addProfileText}>
                      <Text style={{marginRight: 10}}>
                        <Icon name="plus-circle" size={18} color="blue" />
                      </Text>{' '}
                      Add your profile picture
                    </Text>
                  </TouchableOpacity>
                )}
                {profile.firstName ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'green',
                      marginVertical: 5,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    <Text style={{marginRight: 10}}>
                      <CheckCircle
                        name="check-circle"
                        size={18}
                        color="green"
                      />{' '}
                    </Text>
                    Name: {profile.firstName}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileSettings')}>
                    <Text style={styles.addProfileText}>
                      <Text style={{marginRight: 10}}>
                        <Icon name="plus-circle" size={18} color="blue" />
                      </Text>{' '}
                      Add your name
                    </Text>
                  </TouchableOpacity>
                )}
                {profile.workExperience && profile.workExperience.length > 0 ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'green',
                      marginVertical: 5,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    <Text style={{marginRight: 10}}>
                      <CheckCircle
                        name="check-circle"
                        size={18}
                        color="green"
                      />{' '}
                    </Text>
                    Workplace: {findCurrentWorkingAt()}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileSettings')}>
                    <Text style={styles.addProfileText}>
                      <Text style={{marginRight: 10}}>
                        <Icon name="plus-circle" size={18} color="blue" />
                      </Text>{' '}
                      Add your workplace
                    </Text>
                  </TouchableOpacity>
                )}
                {profile.country ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'green',
                      marginVertical: 5,
                      fontFamily: 'Lexend-Regular',
                    }}>
                    <Text style={{marginRight: 10}}>
                      <CheckCircle
                        name="check-circle"
                        size={18}
                        color="green"
                      />{' '}
                    </Text>
                    Country: {profile.country}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileSettings')}>
                    <Text style={styles.addProfileText}>
                      <Text style={{marginRight: 10}}>
                        <Icon name="plus-circle" size={18} color="blue" />
                      </Text>{' '}
                      Add your country
                    </Text>
                  </TouchableOpacity>
                )}
                {profile.city ? (
                  <Text style={{color: 'green', fontFamily: 'Lexend-Regular'}}>
                    <Text style={{marginRight: 10}}>
                      <CheckCircle
                        name="check-circle"
                        size={18}
                        color="green"
                      />{' '}
                    </Text>
                    Address: {profile.city}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileSettings')}>
                    <Text style={styles.addProfileText}>
                      <Text style={{marginRight: 10}}>
                        <Icon name="plus-circle" size={18} color="blue" />
                      </Text>{' '}
                      Add your address
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        {/* TabView Section */}
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: Dimensions.get('window').width}} // Set the initial layout width for the TabView
          renderTabBar={renderTabBar} // Custom tab bar
        />
      </View>
    </ScrollView>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
  },
  header: {
    borderBottomWidth: 1,
    fontFamily: 'Lexend-Regular',
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    paddingBottom: 10,
  },
  coverPhotoContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -40,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 15, // Adjust positioning to align on cover image
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5, // Shadow for Android
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#004C8A',
    fontWeight: 'bold',
  },
  pencilIcon: {
    position: 'absolute',
    top: 110,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
  },
  profilePicContainer: {
    position: 'relative',
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'white',
  },
  openToWork: {
    position: 'absolute',
    bottom: 2,
    left: -1,
    width: 90,
    height: 90,
    borderRadius: 15,
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 67,
    backgroundColor: IoColor1,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 20,
    padding: 5,
  },
  headerDetails: {
    alignItems: 'flex-start',
    fontFamily: 'Lexend-Regular',
    marginHorizontal: 10,
    marginTop: 8,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  pronouns: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginLeft: 5,
  },
  title: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  profileCompletionContainer: {
    marginHorizontal: 15,
    marginTop: 60,
    borderRadius: 12,

    backgroundColor: 'white',
    // overflow: 'hidden',
  },
  profileCompletionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IoColor1,
    padding: 10,
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    paddingHorizontal: 16,
    gap: 15,
    width: '100%',
    position: 'absolute',
    top: -35,
    zIndex: 3,
  },
  profileCompletionTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#F8F8FF',
  },
  profileCompletionBody: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#f0eded',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  percentageText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Lexend-Regular',
    marginRight: 10,
  },
  progressBar: {
    flexDirection: 'row',
    height: 10,
    width: '70%',
    borderRadius: 5,
    backgroundColor: 'gray',
  },
  progressBarFilled: {
    backgroundColor: '#4caf50', // Filled part color
    height: '100%',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  progressBarUnfilled: {
    backgroundColor: 'gray', // Unfilled part color
    height: '100%',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  profileCompletionList: {
    padding: 5,
  },
  addProfileText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginVertical: 5,
  },
  aboutUser: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    marginTop: 10,
  },
  tabContent: {
    // flex: 1,
    padding: 16,
    fontFamily: 'Lexend-Regular',
    backgroundColor: 'white',
  },
  postsContent: {
    // padding: 10,
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  experience: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,

    borderBottomColor: '#ddd',
  },
  experienceTitle: {
    fontSize: 20,

    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  experienceRow: {
    flexDirection: 'row',
    marginTop: 10,
    fontFamily: 'Lexend-Regular',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  experienceIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  experienceDetails: {
    flex: 1,
    fontFamily: 'Lexend-Regular',
  },
  experienceRole: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  experienceCompany: {
    fontSize: 14,
    color: 'black',
  },
  experienceDate: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'gray',
  },
  experienceLocation: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'gray',
  },
  experienceDescription: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginVertical: 10,
  },
  experienceSkills: {
    fontSize: 14,
    color: 'black',

    fontFamily: 'Lexend-Bold',
    marginLeft: 5,
  },
  education: {
    padding: 16,
    backgroundColor: 'white',
    marginVertical: 5,
    fontFamily: 'Lexend-Regular',
  },
  educationTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  educationRow: {
    flexDirection: 'row',
    fontFamily: 'Lexend-Regular',
    marginTop: 10,
  },
  educationIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  educationDetails: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  educationInstitution: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  educationDate: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'gray',
  },
  educationGrade: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    marginVertical: 5,
  },
  licenses: {
    padding: 16,
    backgroundColor: 'white',
    fontFamily: 'Lexend-Regular',
    marginVertical: 5,
  },
  licensesTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  licenseRow: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    fontFamily: 'Lexend-Regular',
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  licenseIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  licenseDetails: {
    flex: 1,
  },
  licenseTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  licenseIssuer: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  licenseDate: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: 'gray',
  },
  licenseSkills: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Bold',
    marginLeft: 5,
    marginVertical: 10,
  },
  skills: {
    padding: 16,
    backgroundColor: 'white',
    fontFamily: 'Lexend-Regular',
    marginVertical: 5,
  },
  skillsTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  skillRow: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontFamily: 'Lexend-Regular',
    paddingVertical: 10,
  },
  skillName: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 10,
  },
  skillExperience: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  skillsIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});
