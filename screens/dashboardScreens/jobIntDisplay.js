import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useSelector} from 'react-redux';
import TrashIcon from 'react-native-vector-icons/FontAwesome5';
import EllipsisVIcon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import {userApiServer} from '../../config';
import DocumentPicker from 'react-native-document-picker'; // Import Document Picker
import CandidatesModal from '../components/candidatesModal';
import {IoColor1} from '../../colorCode';

const JobIntDisplay = ({
  picture,
  jobId,
  job,
  jobTitle,
  location,
  salaryMin,
  salaryMax,
  currency,
  locationType,
  category,
  description,
  handleDeleteJob,
  formatTimestamp,
}) => {
  const coverImage = require('../../assets/images/cultural-1.jpg'); // Adjust the path as needed

  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here
  const username = user ? user.firstName : ''; // Access user data from auth state

  const [showOptions, setShowOptions] = useState(false);
  const [starLoading, setStarLoading] = useState(false);
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isApplied, setIsApplied] = useState(false);

  const fetchAppliedUserIds = async () => {
    try {
      // console.log(`${userApiServer}/internships/appliedCandidates/${job._id}`);
      const response = await axios.get(
        `${userApiServer}/Jobs/appliedCandidates/${job._id}`,
      );
      // console.log('response.data', response.data);
      // console.log('Applied candidates response:', response.data); // Debugging
      const data = response.data;
      // console.log('fetchAppliedUserIds', data);

      // Extract user IDs from appliedCandidates array

      const userIds = data.appliedCandidates.map(candidate => candidate.userId);
      setAppliedCandidates(userIds);
      console.log(userIds);
      setAppliedCandidatesDetails(data.appliedCandidates);
    } catch (error) {
      console.error('Error fetching applied candidates:', error);
    }
  };

  useEffect(() => {
    setIsApplied(appliedCandidates.includes(profile._id));
  }, [appliedCandidates]);

  const toggleOptions = () => {
    setShowOptions(prevState => !prevState);
  };

  const handleApply = async () => {
    setApplyLoading(true);
    const apiUrl = `${userApiServer}/jobs/apply/${job._id}`;
    console.log('URL', `${userApiServer}/jobs/apply/${job._id}`);
    const formData = new FormData();
    formData.append('userId', profile._id);
    formData.append('name', name);
    if (resume) {
      formData.append('resume', {
        uri: resume.uri,
        type: resume.type,
        name: resume.name,
      });
    }

    answers.forEach((ans, index) => {
      formData.append(`answers[${index}][question]`, ans.question);
      formData.append(`answers[${index}][answer]`, ans.answer);
    });

    // console.log('Form data :', formData);
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      fetchAppliedUserIds();
      // Log the response to verify success
      // console.log('Success Response:', response.data);

      Alert.alert('Success', 'Applied successfully');
      setApplyLoading(false);
      setModalVisible(false);
    } catch (error) {
      console.error(
        'Error applying for the job:',
        error.response ? error.response.data : error.message,
      );
      Alert.alert('Error', 'Error applying for the job');
      setApplyLoading(false);
    }
  };

  const handleStarred = jobId => {
    setStarLoading(true);
    axios
      .put(`${userApiServer}/Jobs/${jobId}`, {
        starred: true,
        userId: profile._id,
      })
      .then(response => {
        // Fetch the updated job details to reflect the new starred status
        fetchDonationPost();
        setStarLoading(false);
      })
      .catch(error => {
        console.error(
          'Error starring the job:',
          error.response ? error.response.data : error.message,
        );
        Alert.alert('Error', 'Error starring the job');
        setStarLoading(false);
      });
  };

  useEffect(() => {
    fetchAppliedUserIds();
  }, []);
  // Document picker for selecting resume
  const handleResumePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setResume(res[0]); // Set the first selected file
      setResumeName(res[0].name);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Cancelled', 'Resume upload cancelled.');
      } else {
        Alert.alert('Error', 'Unknown error: ' + JSON.stringify(err));
      }
    }
  };

  const handleAnswerChange = (index, text) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = text;
    setAnswers(newAnswers);
  };

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

  // Decide whether to display "Star" or "Starred"
  const starButtonText = job.starred?.includes(profile._id)
    ? 'Starred'
    : 'Star';

  return (
    <View key={jobId} style={styles.cardContainer}>
      <View style={styles.postHeader}>
        <Image
          style={styles.postAvatar}
          source={{
            uri: job.profilePicture
              ? job.profilePicture
              : 'https://via.placeholder.com/150',
          }}
        />
        <View style={{flex: 1}}>
          <Text style={styles.postUsername}>{job.userName}</Text>
          <Text style={styles.postTimestamp}>
            {formatTimestamp(job.createdAt)}
          </Text>
        </View>
        {job.userId === profile._id && (
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={toggleOptions}>
            <EllipsisVIcon name="ellipsis-v" size={20} color="black" solid />
          </TouchableOpacity>
        )}
        {showOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => handleEditPost(post._id)}
              style={styles.optionButton}>
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => handleArchivePost(post._id)}
              style={styles.optionButton}>
              <Text style={styles.optionText}>Archive</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => handleDeleteJob(post._id)}
              style={styles.optionButton}>
              <Text style={styles.optionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={picture ? {uri: picture} : coverImage}
          style={styles.image}
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{jobTitle}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detail}>
          <FontAwesome name="map-marker" size={16} color="black" />
          <Text style={styles.detailText}>{location}</Text>
        </View>
        <View style={styles.detail}>
          <FontAwesome5 name="briefcase" size={16} color="#ff4500" />
          <Text style={styles.detailText}>{getLocationType()}</Text>
        </View>
        <View style={styles.detail}>
          <FontAwesome name="tag" size={16} color="black" />
          <Text style={styles.detailText}>{category}</Text>
        </View>
      </View>
      {job.userId === profile._id ? (
        <TouchableOpacity onPress={() => setCandidateModalVisible(true)}>
          <Text style={styles.candidatesButton}>
            View Interested Candidates ({appliedCandidates.length})
          </Text>
        </TouchableOpacity>
      ) : isApplied ? (
        <Text style={styles.appliedButton}>Applied</Text>
      ) : profile.profileLevel === 0 || profile.profileLevel === 1 ? null : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => handleStarred(jobs._id)}>
            <Text style={styles.starButtonText}>
              {starLoading ? 'Loading...' : starButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.salaryContainer}>
        <View style={styles.salaryDetail}>
          <Text style={styles.salaryLabel}>Minimum</Text>
          <Text style={styles.salaryValue}>
            {salaryMin}
            {currency}
          </Text>
        </View>
        <View style={styles.salaryDetail}>
          <Text style={styles.salaryLabel}>Maximum</Text>
          <Text style={styles.salaryValue}>
            {salaryMax}
            {currency}
          </Text>
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>Job Description</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply for {job.title}</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="gray"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleResumePick}>
              <Text style={styles.uploadButtonText}>
                {resumeName ? resumeName : 'Upload Resume (PDF)'}
              </Text>
            </TouchableOpacity>

            {questions.map((question, index) => (
              <View key={index}>
                <Text>{question}</Text>
                <TextInput
                  placeholder="Answer"
                  value={answers[index]?.answer}
                  onChangeText={text => handleAnswerChange(index, text)}
                  style={styles.input}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.submitButton} onPress={handleApply}>
              <Text style={styles.submitButtonText}>
                {applyLoading ? 'Applying...' : 'Submit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CandidatesModal
        visible={candidateModalVisible}
        onClose={() => setCandidateModalVisible(false)}
        jobId={job._id}
        title="Jobs"
      />
    </View>
  );
};

export default JobIntDisplay;

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUsername: {
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  postTimestamp: {
    fontSize: 14,
    color: '#004C8A',
    fontFamily: 'Lexend-Regular',
  },
  imageContainer: {
    marginTop: 10,
    height: 200,
    borderRadius: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  candidatesButtonContainer: {
    marginVertical: 10,
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  salaryDetail: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  salaryLabel: {
    fontSize: 12,
    fontFamily: 'Lexend-Bold',
    color: 'black',
  },
  salaryValue: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  descriptionContainer: {
    marginVertical: 10,
  },
  descriptionLabel: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    color: 'black',
  },
  descriptionText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  optionsButton: {
    padding: 5,
    position: 'relative',
  },
  optionsContainer: {
    position: 'absolute',
    top: 25, // Adjust according to your layout
    right: 0, // Aligns with the icon on the right side
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4}, // Increased height for a more pronounced shadow
    shadowOpacity: 0.3, // Adjusted for more visibility
    shadowRadius: 5, // Increased radius for a softer shadow
    elevation: 5, // Adds elevation on Android for shadow effect
    zIndex: 1000, // Ensure it appears above other elements
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  candidatesButton: {
    backgroundColor: IoColor1,
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 5,
  },
  appliedButton: {
    backgroundColor: '#a3e3ff',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 10,
    color: 'white',
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  applyButton: {
    backgroundColor: '#174873',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
    marginBottom: 20,
    color: 'black',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  submitButton: {
    backgroundColor: '#174873',
    padding: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  closeButtonText: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  uploadButton: {
    backgroundColor: '#174873',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
});
