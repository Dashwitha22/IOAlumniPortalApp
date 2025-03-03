import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {IoColor1} from '../../../colorCode';

const JobPost = ({job, onSelectJob, searchQuery, title, titleS, verified}) => {
  if (!job) {
    console.log('Error: Job data is undefined or null');
    return null; // Return null to avoid rendering if job is undefined
  }

  const getLocationType = () => {
    if (!job.locationType) return ''; // If locationType is null or undefined, return an empty string

    const {onSite, remote, hybrid} = job.locationType;
    let locationText = [];
    if (onSite) locationText.push('Onsite');
    if (remote) locationText.push('Remote');
    if (hybrid) locationText.push('Hybrid');

    // Join the location types with commas, like "Onsite, Remote"
    return locationText.join(', ');
  };

  return (
    <TouchableOpacity style={styles.jobCard} onPress={() => onSelectJob(job)}>
      <Image
        source={{
          uri: job.coverImage
            ? job.coverImage
            : 'https://via.placeholder.com/150',
        }}
        style={styles.jobImage}
      />
      <View style={styles.jobInfo}>
        {/* Job Title and Verified Badge */}
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.verified && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={18}
              color="green"
              style={styles.verifiedIcon}
            />
          )}
        </View>
        <Text style={styles.companyName}>{job.company}</Text>

        <View style={styles.jobMeta}>
          <Icon name="map-marker" size={14} color="#666" />
          <Text style={styles.jobMetaText}>{getLocationType()}</Text>
        </View>
        <View style={styles.jobMeta}>
          <Icon name="briefcase" size={14} color="#666" />
          <Text style={styles.jobMetaText}>{job.category}</Text>
        </View>
        <View style={styles.jobMeta}>
          <Icon name="money" size={14} color="#666" />
          {job.salaryMin === null && job.salaryMax === null ? (
            <Text style={styles.jobMetaText}>Unpaid</Text>
          ) : (
            <Text style={styles.jobMetaText}>
              {job.salaryMin} - {job.salaryMax} {job.currency}
            </Text>
          )}
        </View>

        {/* Employment Type Badge */}
        {job.employmentType && (
          <View style={styles.employmentBadge}>
            <Text style={styles.employmentText}>{job.employmentType}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default JobPost;

const styles = StyleSheet.create({
  jobCard: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 16,
    fontFamily: 'Lexend-Regular',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  jobInfo: {
    flex: 1,
    fontFamily: 'Lexend-Regular',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  verifiedIcon: {
    marginLeft: 5, // Space between title and icon
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
    marginTop: 5,
  },
  jobMetaText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    marginLeft: 5,
  },
  companyName: {
    fontSize: 15,
    // fontFamily: 'Lexend-Regular',
    color: 'black',
    fontFamily: 'Lexend-Bold',
    marginVertical: 5,
  },
  employmentBadge: {
    backgroundColor: IoColor1, // Blue background
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start', // Ensures it does not take full width
    marginTop: 8,
  },
  employmentText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
});
