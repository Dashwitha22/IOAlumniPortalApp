import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {IoColor1} from '../../../colorCode';

const EducationSection = ({profile}) => {
  return (
    <View>
      {/* Header Section */}
      <View style={styles.educationHeader}>
        <Icon name="school" size={15} color="#fff" />
        <Text style={styles.educationTitle}>Education</Text>
      </View>
      {/* Education details Section */}
      <Text style={styles.educationDetails}>
        {profile.profileLevel === 2
          ? `Graduated Year : ${profile.graduatingYear}`
          : profile.profileLevel === 3
          ? `Class : ${profile.class}`
          : 'User has not updated his Education details'}
      </Text>
    </View>
  );
};

export default EducationSection;

const styles = StyleSheet.create({
  educationHeader: {
    backgroundColor: IoColor1,
    color: '#F8F8FF',
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    padding: 10,
    flexDirection: 'row',
    fontFamily: 'Lexend-Regular',
    alignItems: 'center',
    gap: 15,
    marginTop: 10,
  },
  educationTitle: {
    fontFamily: 'Inter',
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#F8F8FF',
  },
  educationDetails: {
    backgroundColor: '#f0eded',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,

    fontFamily: 'Lexend-Regular',
    fontSize: 15,
    color: 'black',
  },
});
