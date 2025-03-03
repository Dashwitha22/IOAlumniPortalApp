import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import {useDispatch, useSelector} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useRoute, useNavigation} from '@react-navigation/native';
import profilePic from '../../../assets/images/profilepic.5188743c44340e4474b2.jpg';
import {userApiServer} from '../../../config';
import {updateProfile} from '../../../store/actions/authActions';
import SocialMediaPost from './socialMediaPost';

const IndividualGroup = () => {
  const route = useRoute();
  const {item} = route.params; // Access the passed 'item' here
  const [group, setGroup] = useState([]);
  const [groupMembers, setGroupMembers] = useState(null);
  const profile = useSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState({});
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sendMembers, setSendMembers] = useState([]);
  const allMembers = useSelector(state => state.members.members);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  let admin = profile.profileLevel === 0;

  console.log('Individual group item id : ', item._id);

  useEffect(() => {
    getGroup();
  }, []);

  if (!item) {
    return <Text>No group information available</Text>;
  }

  const getGroup = async () => {
    try {
      setPageLoading(true);
      const response = await axios.get(`${userApiServer}/groups/${item._id}`);
      setGroup([response.data]);
      setGroupMembers(response.data.members);
      setSelectedMembers(
        response.data.members.map(member => ({
          userId: member.userId,
          profilePicture: member.profilePicture,
          userName: member.userName,
        })),
      );
      setPageLoading(false);
    } catch (error) {
      console.error('Error fetching group details:', error);
      setPageLoading(false);
    }
  };

  const handleFollowToggle = async (memberId, userName) => {
    setIsLoading(prevLoading => ({...prevLoading, [memberId]: true}));
    try {
      const response = await axios.patch(
        `${userApiServer}/alumni/${memberId}/follow`,
        {
          userId: profile._id,
          requestedUserName: `${profile.firstName} ${profile.lastName}`,
          followedUserName: userName,
        },
      );

      if (response.status === 200) {
        const {alumni} = await response.data;
        dispatch(updateProfile(alumni));
      }

      setIsLoading(prevLoading => ({...prevLoading, [memberId]: false}));
    } catch (error) {
      console.error('Error toggling follow status:', error);
      setIsLoading(prevLoading => ({...prevLoading, [memberId]: false}));
    }
  };

  const isFollowing = memberId => {
    return profile.following.some(follower => follower.userId === memberId);
  };

  const filteredMembers = allMembers.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMemberSelect = (
    memberId,
    profilePicture,
    firstName,
    lastName,
    profileLevel,
  ) => {
    setSelectedMembers(prevSelected => {
      const memberIndex = prevSelected.findIndex(
        member => member.userId === memberId,
      );

      if (memberIndex !== -1) {
        return prevSelected.filter(member => member.userId !== memberId);
      } else {
        return [
          ...prevSelected,
          {
            userId: memberId,
            profilePicture: profilePicture,
            userName: `${firstName} ${lastName}`,
            profileLevel: profileLevel,
          },
        ];
      }
    });

    setSendMembers(prevSelected => {
      const memberIndex = prevSelected.findIndex(
        member => member.userId === memberId,
      );

      if (memberIndex !== -1) {
        return prevSelected.filter(member => member.userId !== memberId);
      } else {
        return [
          ...prevSelected,
          {
            userId: memberId,
            profilePicture: profilePicture,
            userName: `${firstName} ${lastName}`,
            profileLevel: profileLevel,
          },
        ];
      }
    });
  };

  const handleSaveMembers = async () => {
    try {
      setSaving(true);
      await axios.put(`${userApiServer}/groups/members/${group[0]._id}`, {
        members: sendMembers,
      });
      setShowModal(false);
      setSendMembers([]);
      getGroup();
      Alert.alert('Success', 'Group updated successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error updating members:', error);
      Alert.alert('Error', 'Failed to update members.');
      setSaving(false);
    }
  };

  const handleFileChange = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      });
      setSelectedFile(result);
      handleFileUpload(result);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Document picking error:', err);
      }
    }
  };

  const handleFileUpload = async file => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('groupPicture', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      const response = await axios.put(
        `${userApiServer}/groups/${item._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status === 200) {
        getGroup();
        Alert.alert('Success', 'Group picture updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update group picture.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error updating group picture:', error);
      Alert.alert('Error', 'An error occurred while updating the picture.');
      setLoading(false);
    }
  };

  const handleViewAllMembers = () => {
    navigation.navigate('AllMembers', {members: groupMembers});
  };

  return (
    <ScrollView style={{flex: 1}}>
      {pageLoading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        group.map(groupItem => (
          <View
            key={groupItem._id}
            style={{backgroundColor: 'white', borderRadius: 12}}>
            <View style={styles.header}>
              {/* Cover Image */}
              <View>
                <View style={{position: 'relative'}}>
                  <Image
                    source={
                      groupItem?.groupLogo
                        ? {uri: groupItem.groupLogo}
                        : require('../../../assets/images/clicks-logo.png') // Fallback image
                    }
                    style={{width: '100%', height: 200, borderRadius: 12}}
                    resizeMode="cover"
                  />
                </View>

                {/* Profile Image */}
                <View
                  style={{
                    position: 'relative',
                    alignItems: 'center',
                    marginTop: -50,
                  }}>
                  <Image
                    source={
                      groupItem.groupPicture
                        ? {uri: groupItem.groupPicture}
                        : selectedFile?.uri
                        ? {uri: selectedFile.uri}
                        : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')
                    }
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderColor: 'white',
                      borderWidth: 5,
                    }}
                  />
                  {loading && <ActivityIndicator size="large" color="blue" />}
                </View>

                {/* Group Information */}
                <Text
                  style={{
                    fontFamily: 'Lexend-Bold',
                    fontSize: 24,
                    color: 'black',
                    textAlign: 'center',
                    marginVertical: 10,
                  }}>
                  {groupItem.groupName}
                </Text>
                <View style={{padding: 20}}>
                  <View style={{marginVertical: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <FontAwesome name="globe" size={16} color="#7a7a7a" />
                      <Text style={styles.groupText}>
                        {groupItem.groupType}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 5,
                      }}>
                      <MaterialIcons
                        name="local-offer"
                        size={16}
                        color="#7a7a7a"
                      />
                      <Text style={styles.groupText}>{groupItem.category}</Text>
                    </View>
                  </View>

                  {/* Members and Posts Count */}
                  <View
                    style={{
                      marginBottom: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.groupText}>Posts: 0</Text>
                    <Text style={styles.groupText}>
                      Members: {groupItem.members.length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Active Group Members */}
            <View style={styles.activeMembersContainer}>
              <View style={styles.activeMembersHeader}>
                <Text style={styles.activeMembersTitle}>
                  Active Group Members
                </Text>
              </View>

              <ScrollView style={styles.activeMemberContent}>
                {groupItem.members
                  .filter(member => member.userId !== profile._id)
                  .map(member => (
                    <View key={member.userId} style={styles.memberItem}>
                      <Image
                        source={
                          member.profilePicture && member.profilePicture !== ''
                            ? {uri: member.profilePicture}
                            : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg') // Fallback to a local default image
                        }
                        style={styles.memberAvatar}
                      />
                      <Text style={styles.memberName}>{member.userName}</Text>
                    </View>
                  ))}
                {/* View All Members Button */}
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllMembers}>
                  <Text style={styles.viewAllButtonText}>
                    View All Group Members
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Social Media Post Component */}
            <View>
              <SocialMediaPost
                showCreatePost={true}
                groupID={groupItem._id ? groupItem._id : null} // Pass groupID to match the structure in React.js
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default IndividualGroup;

const styles = StyleSheet.create({
  groupText: {
    color: 'black',
    marginLeft: 10,
    fontFamily: 'Lexend-Regular',
  },
  header: {
    backgroundColor: '#FEF7E7',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    fontFamily: 'Lexend-Regular',
  },
  activeMembersContainer: {
    backgroundColor: '#FEF7E7',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#ccc',
    marginTop: 15,
    fontFamily: 'Lexend-Regular',
    marginHorizontal: 20,
  },
  activeMembersHeader: {
    backgroundColor: '#004C8A',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    fontFamily: 'Lexend-Regular',
  },
  activeMemberContent: {
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  activeMembersTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: '#F8F8FF',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  memberAvatar: {
    marginRight: 10,
    height: 50,
    width: 50,
    borderRadius: 75,
  },
  memberName: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    flex: 1,
  },
  viewAllButton: {
    // backgroundColor: '#F8A700', // Orange background
    // padding: 10, // Padding around the button
    // borderRadius: 8, // Rounded corners
    // position:'absolute',
    alignItems: 'flex-start', // Center the text inside the button
    marginTop: 10, // Margin at the top to add space from the content above
  },
  viewAllButtonText: {
    color: '#000', // White text color
    fontSize: 16, // Font size
    fontFamily: 'Lexend-Bold', // Semi-bold font weight
  },
});
