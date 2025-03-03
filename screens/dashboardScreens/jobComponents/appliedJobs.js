import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import JobPost from './jobPost';
import {userApiServer} from '../../../config';

const AppliedJobs = ({searchQuery, handleSelectJob}) => {
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        if (!profile._id) {
          console.log('Profile ID is missing');
          return;
        }
        // console.log('Fetching applied jobs for:', profile._id);

        console.log(
          'Response:',
          `${userApiServer}/jobs/${profile._id}/appliedJobs`,
        );

        const response = await axios.get(
          `${userApiServer}/jobs/${profile._id}/appliedJobs`,
        );

        setAppliedInternships(response.data);
        setLoading(false);
      } catch (error) {
        // console.error('Error fetching applied jobs:', error);
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  const filteredJobs = appliedInternships.filter(job => {
    const {title, category} = searchQuery;
    const lowerCaseJobTitle = title ? title.toLowerCase() : '';
    const lowerCaseCategory = category ? category.toLowerCase() : '';

    const jobTitleMatch = lowerCaseJobTitle
      ? job.title.toLowerCase().includes(lowerCaseJobTitle)
      : true;

    const categoryMatch = lowerCaseCategory
      ? job.category.toLowerCase().includes(lowerCaseCategory)
      : true;

    return jobTitleMatch && categoryMatch;
  });

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredJobs.length === 0 ? (
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            marginTop: 20,
            fontSize: 20,
            fontFamily: 'Lexend-Regular',
          }}>
          No applied internships found.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredJobs.map(job => (
            <View key={job._id} style={styles.jobPostContainer}>
              <JobPost
                job={job}
                onSelectJob={handleSelectJob}
                title="Jobs"
                titleS="job"
                appliedCandidates={job.appliedCandidates}
                verified={job.verified}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default AppliedJobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    justifyContent: 'center',
  },
  jobPostContainer: {
    marginBottom: 20,
  },
});
