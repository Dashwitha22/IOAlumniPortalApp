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

const StarredJobs = ({searchQuery, handleSelectJob}) => {
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here
  const [starredInternships, setStarredInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarredJobs = async () => {
      try {
        const response = await axios.get(
          `${userApiServer}/jobs/starred/${profile._id}`,
        );
        const nonArchivedStarredJobs = response.data.jobs.filter(
          job => !job.archive,
        );
        setStarredInternships(nonArchivedStarredJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching starred jobs:', error);
        setLoading(false);
      }
    };

    fetchStarredJobs();
  }, []);

  const filteredJobs = starredInternships.filter(job => {
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
          No starred internships found.
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
                verified={job.verified}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default StarredJobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    fontFamily: 'Lexend-Regular',
  },
  scrollContainer: {
    justifyContent: 'center',
    fontFamily: 'Lexend-Regular',
  },
  jobPostContainer: {
    marginBottom: 20,
    fontFamily: 'Lexend-Regular',
  },
});
