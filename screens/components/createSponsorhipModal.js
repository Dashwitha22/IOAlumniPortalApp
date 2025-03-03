import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {IoColor1, IoColor2} from '../../colorCode';
import {userApiServer} from '../../config';
import {useSelector} from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateSponsorhipModal = ({
  modalVisible,
  setModalVisible,
  sponsorshipId,
  business,
}) => {
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {};

  const [formData, setFormData] = useState({
    userId: profile._id,
    nameOfOrganiser: `${profile.firstName} ${profile.lastName}`,
    nameOfEvent: '',
    eventDescription: '',
    emailOfOrganiser: '',
    number: '',
    sponsorshipAmount: '',
    useOfFunds: '',
    eventDate: '',
    location: '',
    targetAudience: '',
    expectedAttendees: '',
    sponsorshipBenefits: '',
    additionalInfo: '',
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // To toggle the date picker
  const [selectedDate, setSelectedDate] = useState(new Date()); // To hold the selected date
  const [isEditing, setIsEditing] = useState(false); // Editing state

  // Function to reset all fields
  const resetFields = () => {
    setFormData({
      nameOfOrganiser: `${profile.firstName} ${profile.lastName}`,
      nameOfEvent: '',
      eventDescription: '',
      emailOfOrganiser: '',
      number: '',
      sponsorshipAmount: '',
      useOfFunds: '',
      eventDate: '',
      location: '',
      targetAudience: '',
      expectedAttendees: '',
      sponsorshipBenefits: '',
      additionalInfo: '',
    });
  };

  useEffect(() => {
    if (sponsorshipId) {
      fetchSponsorshipDetails(sponsorshipId);
      setIsEditing(true);
    }
  }, [sponsorshipId]);

  const fetchSponsorshipDetails = async id => {
    try {
      console.log('Fetching sponsorship details for ID:', id);
      const response = await axios.get(`${userApiServer}/sponsorships/${id}`);
      const data = response.data;
      console.log('Fetched sponsorship details:', data);

      setFormData({
        userId: data.userId,
        nameOfOrganiser:
          data.nameOfOrganiser || `${profile.firstName} ${profile.lastName}`,
        nameOfEvent: data.nameOfEvent,
        eventDescription: data.eventDescription,
        emailOfOrganiser: data.emailOfOrganiser,
        number: data.number.toString(),
        sponsorshipAmount: data.sponsorshipAmount.toString(),
        useOfFunds: data.useOfFunds,
        eventDate: data.eventDate,
        location: data.location,
        targetAudience: data.targetAudience,
        expectedAttendees: data.expectedAttendees.toString(),
        sponsorshipBenefits: data.sponsorshipBenefits,
        additionalInfo: data.additionalInfo,
      });
    } catch (error) {
      console.error('Error fetching sponsorship details:', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prevState => ({...prevState, [name]: value}));
  };

  // Function to format date as dd/mm/yyyy
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Close the picker
    if (selectedDate) {
      setShowDatePicker(false); // Close the picker
      setSelectedDate(selectedDate);
      setFormData(prevState => ({
        ...prevState,
        eventDate: formatDate(selectedDate), // Format as dd/mm/yyyy
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('Form Data on Submit:', formData);
    // Validate required fields
    const {
      nameOfOrganiser,
      nameOfEvent,
      eventDescription,
      emailOfOrganiser,
      number,
      sponsorshipAmount,
      useOfFunds,
      eventDate,
      location,
      targetAudience,
      expectedAttendees,
      sponsorshipBenefits,
      additionalInfo,
    } = formData;
    // Validate required fields
    if (
      !formData.nameOfOrganiser ||
      !formData.nameOfEvent ||
      !formData.eventDescription ||
      !formData.emailOfOrganiser ||
      !formData.number ||
      !formData.sponsorshipAmount ||
      !formData.useOfFunds ||
      !formData.eventDate ||
      !formData.location ||
      !formData.targetAudience ||
      !formData.expectedAttendees ||
      !formData.sponsorshipBenefits ||
      !formData.additionalInfo
    ) {
      Alert.alert('Validation Error', 'All fields marked with * are required.');
      return;
    }

    // Prepare the data in the expected format
    const body = {
      userId: profile._id, // Assuming profile is available via Redux
      ...formData,
      number: parseInt(formData.number, 10), // Ensure it's a number
      sponsorshipAmount: parseFloat(formData.sponsorshipAmount), // Ensure it's a float
      expectedAttendees: parseInt(formData.expectedAttendees, 10), // Ensure it's a number
    };

    console.log('Formatted Body for API:', body); // Debugging

    try {
      setLoading(true);

      let response;
      if (isEditing) {
        response = await axios.put(
          `${userApiServer}/sponsorships/${sponsorshipId}`,
          body,
          {
            headers: {'Content-Type': 'application/json'},
          },
        );
        console.log('Edit Response:', response.data);

        if (response.status === 200) {
          Alert.alert('Success', 'Sponsorship updated successfully.');
          fetchSponsorshipDetails(sponsorshipId);
        } else {
          Alert.alert('Error', 'Unexpected response from server.');
        }
      } else {
        response = await axios.post(
          `${userApiServer}/sponsorships/create`,
          body,
          {
            headers: {'Content-Type': 'application/json'},
          },
        );
        console.log('Create Response:', response.data);

        if (response.status === 201) {
          Alert.alert('Success', 'Sponsorship created successfully.');
          resetFields(); //  Only reset when creating a new sponsorship
        } else {
          Alert.alert('Error', 'Failed to create sponsorship.');
        }
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error:', error);

      if (error.response) {
        console.error('Error Response:', error.response.data);
        Alert.alert('Error', error.response.data.message || 'Request failed.');
      } else if (error.request) {
        console.error('Error Request:', error.request);
        Alert.alert('Error', 'Network error. Please check your connection.');
      } else {
        console.error('Error Message:', error.message);
        Alert.alert('Error', error.message || 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <ScrollView contentContainerStyle={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Sponsorship' : 'Create A New Sponsorship'}
          </Text>

          {/* Name of Organiser */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name of Organiser:</Text>
            <TextInput
              style={styles.input}
              value={formData.nameOfOrganiser}
              onChangeText={value => handleChange('nameOfOrganiser', value)}
            />
          </View>

          {/* Name of Event */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name of Event:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Event Name"
              value={formData.nameOfEvent}
              onChangeText={value => handleChange('nameOfEvent', value)}
            />
          </View>

          {/* Event Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Description:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Event Description"
              value={formData.eventDescription}
              onChangeText={value => handleChange('eventDescription', value)}
              multiline
            />
          </View>

          {/* Email of Organiser */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email of Organiser:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Organiser Email"
              value={formData.emailOfOrganiser}
              onChangeText={value => handleChange('emailOfOrganiser', value)}
              keyboardType="email-address"
            />
          </View>

          {/* Contact Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number Of Organiser:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              value={formData.number}
              onChangeText={value => handleChange('number', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Sponsorship Amount */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Total Sponsorship Amount Required (₹):
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={formData.sponsorshipAmount}
              onChangeText={value => handleChange('sponsorshipAmount', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Use of Funds */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              What will you use the sponsorship money for:
            </Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Use of Funds"
              value={formData.useOfFunds}
              onChangeText={value => handleChange('useOfFunds', value)}
              multiline
            />
          </View>

          {/* Event Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Date:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {formData.eventDate ? formData.eventDate : 'dd/mm/yyyy'}{' '}
                {/* Display selected date or placeholder */}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Event Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Location:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Event Location"
              value={formData.location}
              onChangeText={value => handleChange('location', value)}
            />
          </View>

          {/* Target Audience */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Audience:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Target Audience"
              value={formData.targetAudience}
              onChangeText={value => handleChange('targetAudience', value)}
            />
          </View>

          {/* Expected Number of Attendees */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Expected Number of Attendees:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Number of Attendees"
              value={formData.expectedAttendees}
              onChangeText={value => handleChange('expectedAttendees', value)}
              keyboardType="numeric"
            />
          </View>

          {/* Sponsorship Benefits */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sponsorship Benefits Offered:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Benefits"
              value={formData.sponsorshipBenefits}
              onChangeText={value => handleChange('sponsorshipBenefits', value)}
              multiline
            />
          </View>

          {/* Additional Information */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Additional Information:</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter Additional Information"
              value={formData.additionalInfo}
              onChangeText={value => handleChange('additionalInfo', value)}
              multiline
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setModalVisible(false);
                if (!isEditing) resetFields(); // Reset fields on cancel
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : isEditing ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default CreateSponsorhipModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: 'black',
    height: 40,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: 'black',
    height: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: 'black',
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: IoColor2,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: IoColor1,
  },
  submitButton: {
    backgroundColor: IoColor1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileName: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
  },
});
