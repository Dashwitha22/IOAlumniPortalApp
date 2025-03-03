import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IoColor1} from '../../../colorCode';

const ProfileWorkExperience = ({profile, loggedInUserId}) => {
  const navigation = useNavigation();

  const currentWork =
    profile.workExperience &&
    profile.workExperience.find(
      exp => exp.endMonth.toLowerCase() === 'current',
    );

  return (
    <View>
      {loggedInUserId === profile._id ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('WorkExperience', {profile, loggedInUserId})
          }
          style={styles.workExperienceLink}>
          <FontAwesome
            name="briefcase"
            size={15}
            color="#F8F8FF"
            style={styles.icon}
          />
          <Text style={styles.linkText}>Work Experience</Text>
          <FontAwesome
            name="chevron-right"
            size={15}
            color="#F8F8FF"
            style={styles.arrowRight}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.currentWorkContainer}>
          <View style={styles.currentWorkHeader}>
            <FontAwesome
              name="briefcase"
              size={15}
              color="#F8F8FF"
              style={styles.icon}
            />
            <Text style={styles.title}>Currently Working As</Text>
          </View>
          <View style={styles.currentWorkDetails}>
            <Text style={styles.workTitle}>
              {currentWork && currentWork.title
                ? currentWork.title
                : 'User has not updated their current work title'}
            </Text>
            <View style={styles.companyDetails}>
              <Text style={styles.companyName}>
                {currentWork && currentWork.companyName
                  ? currentWork.companyName
                  : 'User has not updated their current workplace'}
              </Text>
              <View style={styles.infoRow}>
                {currentWork &&
                  currentWork.startMonth &&
                  currentWork.startYear &&
                  currentWork.endMonth && (
                    <>
                      <MaterialIcons
                        name="schedule"
                        size={15}
                        color="#004C8A"
                      />
                      <Text style={styles.infoText}>
                        {`${currentWork.startMonth} ${currentWork.startYear} - ${currentWork.endMonth}`}
                      </Text>
                    </>
                  )}
              </View>
              <View style={styles.infoRow}>
                {currentWork &&
                  currentWork.location &&
                  currentWork.locationType && (
                    <>
                      <MaterialIcons
                        name="location-on"
                        size={16}
                        color="#004C8A"
                      />
                      <Text style={styles.infoText}>
                        {`${currentWork.location} - ${currentWork.locationType}`}
                      </Text>
                    </>
                  )}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.workExperienceFooter}
            onPress={() =>
              navigation.navigate('WorkExperience', {profile, loggedInUserId})
            }>
            <Text style={styles.footerText}>Work Experience</Text>
            <FontAwesome
              name="chevron-right"
              size={20}
              color="#004C8A"
              style={styles.arrowRight}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProfileWorkExperience;

const styles = StyleSheet.create({
  workExperienceLink: {
    backgroundColor: IoColor1,
    color: '#F8F8FF',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 10,
  },
  currentWorkContainer: {
    backgroundColor: '#f0eded',
    borderRadius: 12,
    marginTop: 10,
  },
  currentWorkHeader: {
    backgroundColor: IoColor1,
    color: '#F8F8FF',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#F8F8FF',
  },
  currentWorkDetails: {
    backgroundColor: '#f0eded',
    padding: 10,
  },
  workTitle: {
    fontFamily: 'Inter',
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: 'black',
    // backgroundColor: '#FEF7E7',
    borderRadius: 12,
    padding: 10,
  },
  companyDetails: {
    padding: 10,
  },
  companyName: {
    color: '#004C8A',
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingLeft: 3,
  },
  infoText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  workExperienceFooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: 'green',
    borderStyle: 'dotted',
    padding: 13,
  },
  footerText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  icon: {
    // marginRight: 10,
  },
  arrowRight: {
    marginLeft: 'auto',
  },
  linkText: {
    color: '#F8F8FF',
    fontSize: 15,
    fontFamily: 'Lexend-Bold',
  },
});
