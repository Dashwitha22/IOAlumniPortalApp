import React from 'react';
import {View, Text, Image, ScrollView, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import profilePic from '../../../assets/images/profilepic.5188743c44340e4474b2.jpg';

const AllMembers = () => {
  const route = useRoute();
  const {members} = route.params;

  return (
    <ScrollView style={{flex: 1, padding: 10}}>
      <View>
        <Text style={styles.header}>All Group Members</Text>
        {members.map(member => (
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
      </View>
    </ScrollView>
  );
};

export default AllMembers;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Bold',
  },
});
