import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ArchiveJobs = ({job}) => {
  const getLocationType = () => {
    const {onSite, remote, hybrid} = job.locationType;
    let locationText = [];

    if (onSite) locationText.push('Onsite');
    if (remote) locationText.push('Remote');
    if (hybrid) locationText.push('Hybrid');

    // Join the location types with commas, like "Onsite, Remote"
    return locationText.join(', ');
  };

  return (
    <TouchableOpacity style={styles.jobCard}>
      <Image
        source={{
          uri: job.picture ? job.picture : 'https://via.placeholder.com/150',
        }}
      />
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle}>{job.title}</Text>
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
          <Text style={styles.jobMetaText}>
            {job.salaryMin} - {job.salaryMax} {job.currency}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ArchiveJobs;

const styles = StyleSheet.create({
  jobCard: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    fontFamily: 'Lexend-Regular',
  },
  jobImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  jobMeta: {
    flexDirection: 'row',
    fontFamily: 'Lexend-Regular',
    alignItems: 'center',
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
    color: 'black',
    fontFamily: 'Lexend-Bold',
    marginVertical: 5,
  },
});
