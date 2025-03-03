import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {IoColor1} from '../../../colorCode';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Linking} from 'react-native';

const AboutMeSection = ({profile, loggedInUserId}) => {
  const isOwnProfile = loggedInUserId === profile._id; // Check if it's the logged-in user's profile

  return (
    <View>
      {/* Header Section */}
      <View style={styles.aboutHeader}>
        <Icon name="address-card" size={15} color="#fff" />
        <Text style={styles.aboutTitle}>
          About {isOwnProfile ? 'Me' : profile.firstName}
        </Text>
      </View>

      {/* Bio Section */}
      <Text style={styles.aboutBio}>
        {profile.aboutMe && profile.aboutMe.trim() !== ''
          ? profile.aboutMe
          : 'User has not updated his Bio'}
      </Text>

      {/* LinkedIn Section */}
      {profile.linkedIn ? (
        <TouchableOpacity onPress={() => Linking.openURL(profile.linkedIn)}>
          <Text style={[styles.aboutBio, {color: 'blue'}]}>
            LinkedIn: {profile.linkedIn}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.aboutBio}>
          User has not provided a LinkedIn profile
        </Text>
      )}
    </View>
  );
};

export default AboutMeSection;

const styles = StyleSheet.create({
  aboutHeader: {
    backgroundColor: IoColor1,
    color: '#F8F8FF',
    fontFamily: 'Lexend-Regular',
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  aboutTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#F8F8FF',
  },
  aboutBio: {
    backgroundColor: '#f0eded',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,

    fontFamily: 'Lexend-Regular',
    fontSize: 15,
    color: 'black',
  },
});
