import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const similarProfilesRecord = [
  {
    id: '1',
    name: 'Shrinkhala Kushwaha',
    title: 'Performance Marketing | Digital Strategy | SEO',
    connection: '2nd',
    image: require('../../../assets/images/dummyPicture.webp'),
  },
  {
    id: '2',
    name: 'Sarang Pani',
    title:
      'Building Innovati | Ensure that you collaborate with the right minds in less than a minute.',
    connection: '2nd',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: '3',
    name: 'Pinaki Prasad Rajkumar',
    title: 'Full stack web developer | React and node.js',
    connection: '2nd',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: '4',
    name: 'Pramod Kumar K N',
    title: 'Software Developer',
    connection: '2nd',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: '5',
    name: 'Sahana Evangeline',
    title: 'Technical Lead & Web Developer',
    connection: '2nd',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  // Add more profiles as needed
];

const SimilarProfiles = () => {
  return (
    <View style={styles.similarProfiles}>
      <Text style={styles.similarProfilesTitle}>Other similar profiles</Text>
      {similarProfilesRecord.map(profile => (
        <View key={profile.id} style={styles.profileRow}>
          <Image source={profile.image} style={styles.profileImage} />
          <View style={styles.profileDetails}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={{color: 'gray', fontSize: 15, marginLeft: 5}}>
                . {profile.connection}
              </Text>
            </View>
            <Text style={styles.profileTitle}>{profile.title}</Text>
            <TouchableOpacity style={styles.connectButton}>
              <Icon name="user-plus" size={16} color="#0073b1" />
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 5,
          alignSelf: 'center',
        }}>
        <Text style={{color: '#5c5350', fontSize: 15, marginRight: 5}}>
          Show all
        </Text>
        <Icon name="arrow-right" size={16} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default SimilarProfiles;

const styles = StyleSheet.create({
  similarProfiles: {
    padding: 16,
    backgroundColor: 'white',
    marginVertical: 5,
  },
  similarProfilesTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  profileTitle: {
    fontSize: 14,
    color: 'gray',
  },
  connectButton: {
    marginVertical: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: '#0073b1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: '#0073b1',
    marginLeft: 5,
  },
});
