import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import {userApiServer} from '../../../config';
import {updateProfile} from '../../../store/actions/authActions';
import axios from 'axios';
import ProfilePage from '../profileComponents/profilePage';
import {IoColor1} from '../../../colorCode';

const MemberCard = ({member}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const checkFollowingStatus = async () => {
      // If profile is null or missing _id, exit the function early
      if (!profile || !profile._id) {
        setLoading(false); // Ensure the loading state is updated
        return;
      }
      try {
        const response = await axios.get(
          `${userApiServer}/alumni/${profile._id}/following/all`,
        );
        const followingDetails = response.data.followingDetails;
        const isUserFollowing = followingDetails.some(
          detail => detail.userId === member._id,
        );
        setIsFollowing(isUserFollowing);
        setLoading(false);
      } catch (error) {
        console.error('Error checking following status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowingStatus();
  }, [member._id, profile]);

  const handleFollowToggle = async () => {
    if (!profile || !profile._id) {
      console.error('Profile ID is missing.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.patch(
        `${userApiServer}/alumni/${member._id}/follow`,
        {
          userId: profile._id,
        },
      );
      if (response.status === 200) {
        const responseData = await response.data;
        const {alumni} = responseData;
        dispatch(updateProfile(alumni));
        setIsFollowing(!isFollowing);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error toggling follow status:', error);
      setLoading(false);
    }
  };

  // Ensure the component returns nothing if profile is missing
  if (!profile) {
    return null;
  }

  // if (!member.followers || !member.following) {
  //   return <ActivityIndicator size="large" color="#0000ff" />;
  // }

  // console.log('Member Object:', member);

  // console.log('Member Followers:', member.followers);
  // console.log('Member Following:', member.following);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={
            member.profilePicture
              ? {uri: member.profilePicture}
              : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')
          }
          style={styles.avatar}
          resizeMode="cover"
        />
        {/* <Image
          source={require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')}
          style={styles.avatar}
        /> */}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProfilePage', {member})}
        style={styles.infoContainer}>
        <Text style={styles.name}>
          {member.userName
            ? member.userName
            : `${member.firstName} ${member.lastName}`}
        </Text>
        <Text style={styles.role}>
          {member.profileLevel === 1
            ? 'ADMIN'
            : member.profileLevel === 2
            ? 'ALUMNI'
            : member.profileLevel === 3
            ? 'STUDENT'
            : 'SUPER ADMIN'}
        </Text>
        {/* <Text style={styles.department}>{member.department}</Text> */}
        {/* Conditional rendering for stats container when profileLevel is 2 or 3 */}
        {/* {(profile.profileLevel === 2 || profile.profileLevel === 3) && ( */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Followers</Text>
            <Text style={styles.statValue}>
              {member.followers ? member.followers.length : '0'}
            </Text>
          </View>
          <View style={[styles.stat, {marginLeft: 10}]}>
            <Text style={styles.statLabel}>Following</Text>
            <Text style={styles.statValue}>
              {member.following ? member.following.length : '0'}
            </Text>
          </View>
        </View>
        {/* )} */}
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
      ) : (
        // Only display the "Message" button if the user's profile level is 0 (Super Admin) or 1 (Admin)
        // (profile.profileLevel === 0 || profile.profileLevel === 1) && (
        <TouchableOpacity
          style={[styles.followButton]}
          onPress={handleFollowToggle}>
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
        // )
      )}
    </View>
  );
};

export default MemberCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontFamily: 'Lexend-Regular',
    marginBottom: 16,
    marginRight: 8,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,

    borderRadius: 75, // Circular Image
  },
  infoContainer: {
    textAlign: 'center',
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  name: {
    paddingTop: 10,
    fontFamily: 'Lexend-Regular',
    fontSize: 15,

    color: '#000000',
  },
  role: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',

    color: 'black',
    marginVertical: 5,
    backgroundColor: '#F8A700',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  department: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#3A3A3A',
    marginVertical: 5,
  },
  statsContainer: {
    paddingTop: 10,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
  },
  stat: {
    alignItems: 'center',
    // marginHorizontal: 10,
  },
  statLabel: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'Lexend-Regular',
  },
  statValue: {
    color: '#000000',
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
  },
  followButton: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
    justifyContent: 'center',
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
    height: 40,
    backgroundColor: IoColor1,
    // marginTop: 10,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Lexend-Bold',
  },
  loader: {
    marginTop: 20,
  },
});
