import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useRoute} from '@react-navigation/native';
import WorkExperienceModal from '../../components/workExperienceModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userApiServer} from '../../../config';
import {IoColor1, IoColor2} from '../../../colorCode';

const WorkExperience = () => {
  const route = useRoute();
  const {profile, loggedInUserId} = route.params;
  const [workExperiences, setWorkExperiences] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${userApiServer}/alumni/workExperience/${profile._id}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      const data = await response.json();
      setWorkExperiences(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching work experiences:', error);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <FontAwesome
          name="briefcase"
          size={24}
          color={IoColor1}
          style={styles.icon}
        />
        <Text style={styles.title}>Work Experience</Text>
      </View>
      {loggedInUserId === profile._id && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <FontAwesome
            name="list"
            size={18}
            color={IoColor2}
            style={styles.addIcon}
          />
          <Text style={styles.addButtonText}>Add Work Experience</Text>
        </TouchableOpacity>
      )}
      {loading ? (
        <Text>Loading...</Text>
      ) : workExperiences.length === 0 ? (
        <Text style={{color: '#000'}}>No work experiences added yet.</Text>
      ) : (
        workExperiences.map((experience, index) => (
          <View key={index} style={styles.experienceCard}>
            <Text style={styles.workTitle}>
              {experience.title || 'Work title not updated'}
            </Text>
            <Text style={styles.companyName}>
              {experience.companyName || 'Company name not updated'}
            </Text>
            <Text style={styles.infoText}>
              {experience.startMonth} {experience.startYear} -{' '}
              {experience.currentWork
                ? 'Current'
                : `${experience.endMonth} ${experience.endYear || ''}`}
            </Text>
            <Text style={styles.infoText}>
              {experience.location} - {experience.locationType}
            </Text>
          </View>
        ))
      )}
      <WorkExperienceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        profile={profile}
        fetchWorkExperiences={fetchWorkExperiences}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: '#fff', flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  icon: {marginRight: 10},
  title: {fontSize: 24, fontWeight: 'bold', color: '#000'},
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: IoColor2,
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 7,
  },
  addButtonText: {color: '#000', textAlign: 'center', fontSize: 16},
  addIcon: {
    marginRight: 8,
  },
  experienceCard: {
    backgroundColor: '#f0eded',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  workTitle: {fontSize: 16, fontWeight: 'bold', color: '#000'},
  companyName: {fontSize: 14, color: '#004C8A', marginBottom: 10},
  infoText: {fontSize: 14, color: '#000', marginBottom: 5},
});

export default WorkExperience;
