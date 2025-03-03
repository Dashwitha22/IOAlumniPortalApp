import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation, useRoute} from '@react-navigation/native';
import {userApiServer} from '../../../config';
import DocumentPicker from 'react-native-document-picker'; // Import Document Picker
import {IoColor1} from '../../../colorCode';
import CandidatesModal from '../../components/candidatesModal';

const formatDate = dateString => {
  const date = new Date(dateString); // Handle ISO 8601 format
  const day = date.getDate();
  const month = date.toLocaleDateString('default', {month: 'long'}); // Get full month name
  const year = date.getFullYear();

  // Function to get ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = day => {
    if (day > 3 && day < 21) return 'th'; // Covers 11th - 20th
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const OrdinalSuffix = getOrdinalSuffix(day);

  // Return the formatted date with ordinal suffix
  return `${day}${OrdinalSuffix} ${month} ${year}`;
};

const JobDetails = ({job, onBack, title, titleS}) => {
  // const route = useRoute();
  // const {_id, title} = route.params();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starLoading, setStarLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here
  const navigation = useNavigation();
  const [isApplied, setIsApplied] = useState(false);
  const toggleShareOptions = () => setShowShareOptions(!showShareOptions);

  const fetchDonationPost = async () => {
    try {
      console.log(`${userApiServer}/${title}/${job._id}`);
      const response = await axios.get(`${userApiServer}/${title}/${job._id}`);
      // console.log('Individual response : ', response);
      setJobs(response.data);
      setLoading(false);
      setQuestions(response.data.questions || []);
      setAnswers(
        response.data.questions.map(question => ({question, answer: ''})),
      );
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert(
          'Error',
          'Job not found. Please check the job ID and title.',
        );
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
      setLoading(false);
    }
  };

  const fetchAppliedUserIds = async () => {
    try {
      console.log('fetchapplieuserid');
      // console.log(`${userApiServer}/internships/appliedCandidates/${job._id}`);
      const response = await axios.get(
        `${userApiServer}/${title}/appliedCandidates/${job._id}`,
      );
      console.log('response.data', response.data);
      // console.log('Applied candidates response:', response.data); // Debugging
      const data = response.data;
      // console.log('fetchAppliedUserIds', data);

      // Extract user IDs from appliedCandidates array
      const userIds = data.appliedCandidates.map(candidate => candidate.userId);
      setAppliedCandidates(userIds);
      setAppliedCandidatesDetails(data.appliedCandidates);
    } catch (error) {
      console.error('Error fetching applied candidates:', error);
    }
  };
  // console.log('job', job);

  useEffect(() => {
    fetchDonationPost();
    if (title === 'Jobs') {
      fetchAppliedUserIds();
    }
    if (title === 'Internship') {
      fetchAppliedUserIds();
    }
  }, [job._id]);

  useEffect(() => {
    // console.log('profile._id', profile._id);
    console.log('appliedCandidates._id', appliedCandidates);
    if (appliedCandidates.length > 0) {
      setIsApplied(appliedCandidates.includes(profile._id));
    }
  }, [appliedCandidates]);
  // const isApplied = appliedCandidates.includes(profile._id);
  // console.log('profile', profile._id);

  // console.log('isApplied:', isApplied); // Debugging the result

  const handleApply = async () => {
    console.log('Response', 'handle apply');
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

    console.log('Form data :', formData);
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      fetchAppliedUserIds();
      // Log the response to verify success
      console.log('Success Response:', response.data);

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

  const handleStarred = jobId => {
    setStarLoading(true);
    axios
      .put(`${userApiServer}/${title}/${jobId}`, {
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

  const handleOpenPDF = url => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const getLocationType = () => {
    if (!job.locationType) return '';
    const {onSite, remote, hybrid} = job.locationType;
    let locationText = [];

    if (onSite) locationText.push('Onsite');
    if (remote) locationText.push('Remote');
    if (hybrid) locationText.push('Hybrid');

    return locationText.join(', ');
  };

  const handleAnswerChange = (index, text) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = text;
    setAnswers(newAnswers);
  };

  // Decide whether to display "Star" or "Starred"
  const starButtonText = jobs.starred?.includes(profile._id)
    ? 'Starred'
    : 'Star';

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: job.coverImage
                  ? job.coverImage
                  : 'https://via.placeholder.com/150',
              }}
              style={styles.image}
              onError={e =>
                console.log('Image Load Error:', e.nativeEvent.error)
              }
            />
          </View>
          <View style={styles.detailsContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{job.title}</Text>
              <Text style={styles.company}>{job.company}</Text>
              {/* <View>
                <View style={styles.metaRow}>
                  <Icon name="briefcase" size={14} color="#000" />
                  <Text style={styles.metaText}>{job.category}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Icon name="location-arrow" size={14} color="#000" />
                  <Text style={styles.metaText}>{getLocationType()}</Text>
                </View>
              </View> */}
            </View>

            {/* Apply Button and Star Button */}
            {jobs.userId === profile._id ? (
              <TouchableOpacity onPress={() => setCandidateModalVisible(true)}>
                <Text style={styles.candidatesButton}>
                  View Interested Candidates ({appliedCandidates.length})
                </Text>
              </TouchableOpacity>
            ) : isApplied ? (
              <Text style={styles.appliedButton}>Applied</Text>
            ) : profile.profileLevel === 0 ||
              profile.profileLevel === 1 ? null : (
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

            {/* Job Overview Section */}
            <View style={styles.overviewContainer}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewTitle}>Job overview</Text>
              </View>
              <View style={styles.overviewContent}>
                <View style={styles.overviewItem}>
                  <View style={styles.iconView}>
                    <Icon name="calendar" size={16} color="#004C8A" />
                  </View>

                  <View style={{marginHorizontal: 10}}>
                    <Text style={styles.overviewText}>Date Posted</Text>
                    <Text style={styles.overviewValue}>
                      {formatDate(job.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.overviewItem}>
                  <View style={styles.iconView}>
                    <Icon name="calendar-check-o" size={16} color="#004C8A" />
                  </View>

                  <View style={{marginHorizontal: 10}}>
                    <Text style={styles.overviewText}>Apply By</Text>
                    <Text style={styles.overviewValue}>
                      {formatDate(job.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.overviewItem}>
                  <View style={styles.iconView}>
                    <Icon name="map-marker" size={16} color="#004C8A" />
                  </View>

                  <View style={{marginHorizontal: 10}}>
                    <Text style={styles.overviewText}>Location</Text>
                    <Text style={styles.overviewValue}>{job.location}</Text>
                  </View>
                </View>
                <View style={styles.overviewItem}>
                  <View style={styles.iconView}>
                    <Icon name="briefcase" size={16} color="#004C8A" />
                  </View>

                  <View style={{marginHorizontal: 10}}>
                    <Text style={styles.overviewText}>Category</Text>

                    <Text style={styles.overviewValue}>{job.category}</Text>
                  </View>
                </View>
                <View style={styles.overviewItem}>
                  <View style={styles.iconView}>
                    <Icon name="money" size={16} color="#004C8A" />
                  </View>
                  <View style={{marginHorizontal: 10}}>
                    <Text style={styles.overviewText}>Salary</Text>
                    <Text style={styles.overviewValue}>
                      {job.salaryMin} - {job.salaryMax} per hour
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.details}>
              {/* {job.salaryMin === null && job.salaryMax === null ? (
                <Text
                  style={[
                    styles.salaryValue,
                    {textAlign: 'center', fontWeight: '700'},
                  ]}>
                  Unpaid
                </Text>
              ) : (
                <View style={styles.salaryContainer}>
                  <View style={styles.salaryBlock}>
                    <Text style={styles.salaryLabel}>Minimum</Text>
                    <Text style={styles.salaryValue}>{job.salaryMin} INR</Text>
                  </View>
                  <View style={styles.salaryBlock}>
                    <Text style={styles.salaryLabel}>Maximum</Text>
                    <Text style={styles.salaryValue}>{job.salaryMax} INR</Text>
                  </View>
                </View>
              )} */}

              <View style={styles.descriptionContainer}>
                <View style={styles.jobDescriptionView}>
                  <Text style={styles.sectionTitle}>Job Description:</Text>

                  {jobs.attachments?.map((attachment, index) => {
                    if (attachment.endsWith('.pdf')) {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            handleOpenPDF(
                              `${userApiServer}/uploads/${attachment}`,
                            )
                          }
                          style={styles.attachmentLink}>
                          <Text style={styles.linkText}>{attachment}</Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })}

                  <Text
                    style={{
                      color: 'black',
                      alignContent: 'stretch',
                      fontFamily: 'Lexend-Regular',
                    }}>
                    {jobs.description ||
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
                  </Text>
                </View>

                <View style={styles.responsibilitiesView}>
                  <Text style={styles.sectionTitle}>Responsibilities:</Text>

                  <Text
                    style={{
                      color: 'black',
                      alignContent: 'stretch',
                      fontFamily: 'Lexend-Regular',
                    }}>
                    {jobs.responsibilities ||
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
                  </Text>
                </View>

                <View style={styles.qualificationsView}>
                  <Text style={styles.sectionTitle}>Qualifications:</Text>

                  <Text
                    style={{
                      color: 'black',
                      alignContent: 'stretch',
                      fontFamily: 'Lexend-Regular',
                    }}>
                    {jobs.qualifications ||
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
                  </Text>
                </View>

                {/* <Text style={styles.sectionTitle}>Other Details:</Text>
                {jobs.attachments?.map((attachment, index) =>
                  attachment.endsWith('.jpg') ||
                  attachment.endsWith('.jpeg') ||
                  attachment.endsWith('.png') ? (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        setSelectedImage(
                          `${userApiServer}/uploads/${attachment}`,
                        )
                      }>
                      <Text style={styles.linkText}>{attachment}</Text>
                    </TouchableOpacity>
                  ) : null,
                )} */}
              </View>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Back to Jobs</Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Apply for {jobs.title}</Text>
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

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleApply}>
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
        </View>
      )}
      <CandidatesModal
        visible={candidateModalVisible}
        onClose={() => setCandidateModalVisible(false)}
        jobId={job._id}
        title={title}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    fontFamily: 'Lexend-Regular',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 16,
    fontFamily: 'Lexend-Regular',
  },
  header: {
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 10,
  },
  company: {
    marginBottom: 10,
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: 'black',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    fontFamily: 'Lexend-Regular',
  },
  metaText: {
    fontSize: 16,
    color: 'black',
    marginLeft: 5,
    fontFamily: 'Lexend-Regular',
  },
  details: {
    marginBottom: 20,
    // padding: 10,
    // backgroundColor: '#e9ecef',
    borderRadius: 8,
    fontFamily: 'Lexend-Regular',
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    fontFamily: 'Lexend-Regular',
  },
  salaryBlock: {
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
  },
  salaryLabel: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',

    color: 'black',
    marginBottom: 5,
  },
  salaryValue: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  descriptionContainer: {
    marginBottom: 20,
    marginTop: 10,
    fontFamily: 'Lexend-Regular',
  },
  jobDescriptionView: {
    marginBottom: 20,
  },
  responsibilitiesView: {
    marginBottom: 20,
  },
  qualificationsView: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'black',
    marginVertical: 5,
  },
  attachmentLink: {
    marginVertical: 5,
    fontFamily: 'Lexend-Regular',
  },
  linkText: {
    fontSize: 16,
    color: '#0d6efd',
    textDecorationLine: 'underline',
    fontFamily: 'Lexend-Regular',
    marginVertical: 2,
  },
  backButton: {
    backgroundColor: IoColor1,
    padding: 15,
    borderRadius: 8,
    fontFamily: 'Lexend-Regular',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,

    color: '#fff',
    fontFamily: 'Lexend-Regular',
  },
  candidatesButton: {
    backgroundColor: IoColor1,
    color: '#fff',
    padding: 10,
    fontFamily: 'Lexend-Regular',
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 5,
  },
  appliedButton: {
    backgroundColor: '#a3e3ff',
    padding: 10,
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Regular',
  },
  applyButton: {
    backgroundColor: IoColor1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontFamily: 'Lexend-Regular',
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  starButton: {
    backgroundColor: '#ab021b',
    paddingVertical: 10,
    fontFamily: 'Lexend-Regular',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  starButtonText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    fontFamily: 'Lexend-Regular',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Regular',
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    color: 'black',
  },
  submitButton: {
    backgroundColor: IoColor1,
    padding: 10,
    fontFamily: 'Lexend-Regular',
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    fontFamily: 'Lexend-Regular',
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  closeButtonText: {
    color: '#000',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
  overviewContainer: {
    borderWidth: 1,
    borderRadius: 12,
    fontFamily: 'Lexend-Regular',
    borderColor: '#ccc',
    marginVertical: 20,
    // padding: 15,
    backgroundColor: '#eeeeee',
  },
  overviewHeader: {
    backgroundColor: IoColor1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 12,
    fontFamily: 'Lexend-Regular',
    borderTopRightRadius: 12,
  },
  overviewTitle: {
    fontSize: 22,
    fontFamily: 'Lexend-Regular',
    color: '#F8F8FF',
  },
  overviewContent: {
    paddingVertical: 15,
  },
  iconView: {
    width: 20,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  overviewText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: '#000',
  },
  overviewValue: {
    fontSize: 16,
    color: '#000',
  },
  uploadButton: {
    backgroundColor: '#174873',
    padding: 10,
    fontFamily: 'Lexend-Regular',
    borderRadius: 8,
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
});

export default JobDetails;
