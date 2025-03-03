import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Button,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {Picker} from '@react-native-picker/picker';
import ImagePicker from 'react-native-image-crop-picker';
import CheckBox from '@react-native-community/checkbox';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import {publishJob} from '../../store/actions/jobActions';
import {useSelector} from 'react-redux';
import {readFile} from 'react-native-fs';
import {IoColor1} from '../../colorCode';

const CreateJobModal = ({modalVisible, setModalVisible}) => {
  const [jobType, setJobType] = useState('Full-time');
  const [category, setCategory] = useState('Other');
  const [coverImage, setCoverImage] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [imageName, setImageName] = useState(''); // This will store the file name

  const [currency, setCurrency] = useState('INR');
  const [frequency, setFrequency] = useState('per day');
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [type, setType] = useState(''); // '' indicates no selection
  const [isPaid, setIsPaid] = useState(false);
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [description, setDescription] = useState('');
  const [locationType, setLocationType] = useState(false);
  const [attachments, setAttachments] = useState([]); // Attachments array
  const [questions, setQuestions] = useState(['']); // Initially one empty question
  const [hiringFor, setHiringFor] = useState('My Company'); // NEW: Tracks hiring radio selection
  const [companyName, setCompanyName] = useState(''); // Company Name Field
  const [verified, setVerified] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector(state => state.auth.user);
  const userId = user ? user._id : null; // Add null check here
  const profile = user ? user : {}; // Add null check here

  const toggleQuestionInput = () => {
    setIsQuestionVisible(!isQuestionVisible);
    if (!isQuestionVisible && questions.length === 0) {
      // Ensure there's always one empty input when toggling visible
      setQuestions(['']);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, '']); // Add another empty question
  };

  const removeQuestion = index => {
    setQuestions(prevQuestions => prevQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (text, index) => {
    const newQuestions = [...questions];
    newQuestions[index] = text;
    setQuestions(newQuestions);
  };

  // Function to handle cover image selection
  const handleCoverImageChange = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(async image => {
        try {
          const base64Image = await readFile(image.path, 'base64');
          setCoverImage(`data:${image.mime};base64,${base64Image}`);
          setImageName(image.filename || image.path.split('/').pop()); // Set the cover image file name
        } catch (error) {
          console.log('Error converting image to Base64:', error);
          Alert.alert('Error', 'Failed to process the cover image.');
        }
      })
      .catch(error => {
        console.log('ImagePicker Error:', error);
        Alert.alert('Error', 'Failed to select a cover image.');
      });
  };

  // const toggleQuestionInput = () => {
  //   setIsQuestionVisible(!isQuestionVisible);
  // };

  const showPaidUnpaidCheckboxes = () => {
    return (type === 'Job' && jobType === 'Volunteer') || type === 'Internship';
  };

  // Function to handle attachments selection
  const handleAttachmentsChange = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      if (results.length > 5) {
        Alert.alert('Error', 'You can only select up to 5 files.');
        return;
      }

      const processedAttachments = await Promise.all(
        results.map(async file => {
          const base64Data = await readFile(file.uri, 'base64');
          return `data:${file.type};base64,${base64Data}`;
        }),
      );

      setAttachments(prev => [...prev, ...processedAttachments]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('DocumentPicker Error:', err);
        Alert.alert('Error', 'Failed to pick files.');
      }
    }
  };

  const resetFields = () => {
    setJobType('Full-time');
    setCategory('Other');
    setCoverImage(null);
    setTitle('');
    setLocation('');
    setImageName('');
    setCurrency('INR');
    setFrequency('per day');
    setIsQuestionVisible(false);
    setType('');
    setIsPaid(false);
    setMinSalary('');
    setMaxSalary('');
    setDescription('');
    setLocationType(false);
    setAttachments([]);
    setQuestions(['']);
    setHiringFor('My Company'); // Reset to default
    setCompanyName(''); // Reset company name
  };

  const handleCompanySelection = value => {
    if (value === 'My Company') {
      setHiringFor('My Company');
      setVerified(true);
      setCompanyName(profile.workingAt || '');
    } else if (value === 'Other Company') {
      setHiringFor('Other Company');
      setVerified(false);
      setCompanyName('');
    }
  };

  const handlePublish = async () => {
    // Validate necessary fields first
    if (!type || (type !== 'Job' && type !== 'Internship')) {
      Alert.alert(
        'Validation Error',
        'Please select either Job or Internship.',
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please fill in the Title field.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please fill in the Location field.');
      return;
    }

    if (hiringFor === 'Other Company' && !companyName.trim()) {
      Alert.alert('Validation Error', 'Please fill in the Company Name field.');
      return;
    }

    if (!coverImage) {
      Alert.alert('Validation Error', 'Please upload a Cover Image.');
      return;
    }

    if (attachments.length === 0) {
      Alert.alert('Validation Error', 'Please upload at least one attachment.');
      return;
    }

    setIsLoading(true);

    const formData = {
      title: title,
      userId: userId,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture || '', // String
      employmentType: jobType,
      type: type,
      category: category,
      currency: currency,
      duration: frequency,
      salaryMin: minSalary ? parseFloat(minSalary) : 0, //Number
      salaryMax: maxSalary ? parseFloat(maxSalary) : 0, //Number,
      location: location,
      questions: questions,
      description: description,
      coverImage,
      attachments, // Attachments as array of strings
      locationType: {
        onSite: locationType === 'Onsite',
        remote: locationType === 'Remote',
        hybrid: locationType === 'Hybrid',
      },
      company: hiringFor === 'My Company' ? profile.workingAt : companyName, // Include only if "Other Company" is selected
      verified,
    };

    console.log('Form data : ', formData);

    publishJob(
      formData,
      data => {
        Alert.alert('Success', 'Data saved successfully');
        setIsLoading(false);
        resetFields(); // Reset all fields after successful publish
        setModalVisible(false);
      },
      error => {
        console.error('Failed to save data', error);
        Alert.alert('Error', 'Failed to save data');
        setIsLoading(false);
      },
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalText}>Create a Job/Internship post</Text>
            <Text style={styles.label}>
              Title <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter job/internship title"
              placeholderTextColor="#666"
              value={title}
              onChangeText={text => setTitle(text)}
            />
            <Text style={styles.label}>
              Location <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter location"
              placeholderTextColor="#666"
              value={location}
              onChangeText={text => setLocation(text)}
            />
            {/* "I am Hiring For" Radio Buttons */}
            <Text style={styles.label}>
              I am hiring for: <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleCompanySelection('My Company')}>
                <CheckBox
                  value={hiringFor === 'My Company'}
                  onValueChange={() => handleCompanySelection('My Company')}
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}}
                />
                <Text style={styles.radioText}>My Company</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleCompanySelection('Other Company')}>
                <CheckBox
                  value={hiringFor === 'Other Company'}
                  onValueChange={() => handleCompanySelection('Other Company')}
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}}
                />
                <Text style={styles.radioText}>Other Company</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor:
                    hiringFor === 'Other Company' ? 'white' : '#e0e0e0',
                }, // Gray if disabled
              ]}
              placeholder="Enter Company Name"
              placeholderTextColor="#666"
              value={companyName}
              onChangeText={text => setCompanyName(text)}
              editable={hiringFor === 'Other Company'}
            />
            <Text style={styles.label}>Salary Range</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.modalInput1]}
                placeholder="Minimum"
                placeholderTextColor="#666"
                editable={isPaid !== 'Unpaid'}
                value={minSalary}
                onChangeText={text => setMinSalary(text)}
              />
              <Picker
                selectedValue={currency}
                style={styles.pickerHalf}
                onValueChange={itemValue => setCurrency(itemValue)}
                dropdownIconColor="white">
                <Picker.Item label="INR" value="INR" />
                <Picker.Item label="USD" value="USD" />
                <Picker.Item label="JPY" value="JPY" />
                <Picker.Item label="EUR" value="EUR" />
                <Picker.Item label="GBP" value="GBP" />
              </Picker>
            </View>
            <Text style={{color: 'black', marginBottom: 5}}>To</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.modalInput1]}
                placeholder="Maximum"
                placeholderTextColor="#666"
                editable={isPaid !== 'Unpaid'}
                value={maxSalary}
                onChangeText={text => setMaxSalary(text)}
              />
              <Picker
                selectedValue={frequency}
                style={styles.pickerHalf}
                onValueChange={itemValue => setFrequency(itemValue)}
                dropdownIconColor="white">
                <Picker.Item label="per day" value="per day" />
                <Picker.Item label="per hour" value="per hour" />
                <Picker.Item label="per week" value="per week" />
                <Picker.Item label="per month" value="per month" />
                <Picker.Item label="per year" value="per year" />
              </Picker>
            </View>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={type === 'Job'}
                onValueChange={newValue => {
                  if (newValue) {
                    setType('Job');
                    setJobType('Full-time');
                  } else {
                    setType('');
                  }
                }}
                style={styles.checkbox}
                tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
              />
              <Text style={{color: 'black'}}>Job</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={type === 'Internship'}
                onValueChange={newValue => {
                  if (newValue) {
                    setType('Internship');
                    setJobType('Internship');
                  } else {
                    setType('');
                  }
                }}
                style={styles.checkbox}
                tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
              />
              <Text style={{color: 'black'}}>Internship</Text>
            </View>
            <Text style={styles.label}>Employment Type</Text>
            <Picker
              selectedValue={jobType}
              style={styles.pickerStyle}
              onValueChange={(itemValue, itemIndex) => setJobType(itemValue)}
              dropdownIconColor="white"
              enabled={type !== 'Internship'}>
              <Picker.Item label="Full-time" value="Full-time" />
              <Picker.Item label="Part-time" value="Part-time" />
              <Picker.Item label="Internship" value="Internship" />
              <Picker.Item label="Volunteer" value="Volunteer" />
              <Picker.Item label="Contract" value="Contract" />
            </Picker>
            {showPaidUnpaidCheckboxes() && (
              <>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={isPaid === 'Paid'}
                    onValueChange={newValue => {
                      if (newValue) {
                        setIsPaid('Paid');
                      } else {
                        setIsPaid('');
                      }
                    }}
                    style={styles.checkbox}
                    tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
                  />
                  <Text style={{color: 'black'}}>Paid</Text>
                </View>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={isPaid === 'Unpaid'}
                    onValueChange={newValue => {
                      setIsPaid(newValue ? 'Unpaid' : '');
                      if (newValue) {
                        setMinSalary(''); // Reset minimum salary
                        setMaxSalary(''); // Reset maximum salary
                      }
                    }}
                    style={styles.checkbox}
                    tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
                  />
                  <Text style={{color: 'black'}}>Unpaid</Text>
                </View>
              </>
            )}

            <Text style={styles.label}>Category</Text>
            <Picker
              selectedValue={category}
              style={styles.pickerStyle}
              onValueChange={(itemValue, itemIndex) => setCategory(itemValue)}
              dropdownIconColor="white">
              <Picker.Item label="Other" value="Other" />
              <Picker.Item label="Admin & Office" value="Software" />
              <Picker.Item label="Art & Design" value="Art & Design" />
              <Picker.Item label="Business Operations" value="Sales" />
              <Picker.Item label="Cleaning & Facilities" value="Sales" />
              <Picker.Item label="Community & Social Services" value="Sales" />
            </Picker>
            <Text style={styles.label}>Location Type</Text>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={locationType === 'Onsite'}
                onValueChange={newValue => {
                  if (newValue) {
                    setLocationType('Onsite');
                  } else {
                    setLocationType('');
                  }
                }}
                style={styles.checkbox}
                tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
              />
              <Text style={{color: 'black'}}>On-site</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={locationType === 'Remote'}
                onValueChange={newValue => {
                  if (newValue) {
                    setLocationType('Remote');
                  } else {
                    setLocationType('');
                  }
                }}
                style={styles.checkbox}
                tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
              />
              <Text style={{color: 'black'}}>Remote</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={locationType === 'Hybrid'}
                onValueChange={newValue => {
                  if (newValue) {
                    setLocationType('Hybrid');
                  } else {
                    setLocationType('');
                  }
                }}
                style={styles.checkbox}
                tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}} // for Android
              />
              <Text style={{color: 'black'}}>Hybrid</Text>
            </View>
            <View style={styles.questionContainer}>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  marginBottom: 10,
                }}>
                <TouchableOpacity
                  style={[styles.questionButton]}
                  onPress={toggleQuestionInput}>
                  <Text style={styles.textStyle}>Add Questions</Text>
                </TouchableOpacity>
              </View>

              {isQuestionVisible &&
                questions.map((question, index) => (
                  <View key={index} style={styles.questions}>
                    <TextInput
                      style={[styles.modalInput, {height: 100}]}
                      placeholder="Enter question"
                      placeholderTextColor="#666"
                      multiline
                      value={question}
                      onChangeText={text => updateQuestion(text, index)}
                    />
                    {index === questions.length - 1 && (
                      <TouchableOpacity
                        onPress={addQuestion}
                        style={styles.addButton}>
                        <Icon name="plus" size={20} color={IoColor1} />
                      </TouchableOpacity>
                    )}
                    {questions.length > 1 && ( // Only show the minus if there's more than one question
                      <TouchableOpacity
                        onPress={() => removeQuestion(index)}
                        style={styles.iconButton}>
                        <Icon name="minus" size={20} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.modalInput, {height: 70}]}
              placeholder="Enter Job Description"
              placeholderTextColor="#666"
              multiline
              value={description}
              onChangeText={text => setDescription(text)}
            />
            <Text style={styles.label}>
              Add Cover image <Text style={styles.asterisk}>*</Text>
            </Text>
            <Button
              title="Choose File"
              onPress={handleCoverImageChange}
              color={IoColor1}
              style={{marginBottom: 10}}
            />
            {imageName && (
              <Text style={styles.fileName}>{imageName}</Text> // Display the file name
            )}
            <Text style={styles.label}>
              Add Attachments <Text style={styles.asterisk}>*</Text>
            </Text>
            <Button
              title="Pick Files"
              onPress={handleAttachmentsChange}
              color={IoColor1}
            />
            <Text style={{marginBottom: 10, color: 'black'}}>
              Files selected: {attachments.length}
            </Text>
            {/* Show file names or any additional details */}
            {attachments.map((file, index) => (
              <Text key={index} style={{color: 'black'}}>
                {file.name}
              </Text>
            ))}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                marginBottom: 40,
              }}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={handlePublish}>
                <Text style={styles.textStyle}>Publish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CreateJobModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    margin: 15,
    width: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontFamily: 'Lexend-Regular',
    marginBottom: 5,
    color: 'black',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerHalf: {
    flex: 1, // Make picker flex to fill remaining space in the row
    fontSize: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc', // Adjust border color to better blend with the design
    borderRadius: 15,
    backgroundColor: IoColor1, // Blue background
    color: 'white', // This sets the text color
  },
  modalInput: {
    marginBottom: 10,
    width: 220,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    color: 'black',
  },
  modalInput1: {
    marginBottom: 10,
    flex: 1, // Give flex property to take available space
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 5, // Add margin to separate from picker
    color: 'black',
  },
  pickerStyle: {
    width: '70%',
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc', // Adjust border color to better blend with the design
    borderRadius: 15,
    backgroundColor: IoColor1, // Blue background
    color: 'white', // This sets the text color
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: IoColor1,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
  },
  fileName: {
    marginTop: 8,
    marginBottom: 15,
    color: 'grey', // Choose a suitable color
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  questionButton: {
    borderRadius: 20,
    padding: 5,
    backgroundColor: '#ffc0cb',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  checkbox: {
    alignSelf: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    top: 30,
    marginLeft: 10,
  },
  radioContainer: {
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    marginLeft: 5,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  asterisk: {
    color: 'red', // Highlight the asterisk in red
  },
});
