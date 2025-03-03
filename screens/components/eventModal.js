import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import {userApiServer} from '../../config';
import {useSelector} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import {IoColor1, IoColor2} from '../../colorCode';
import {Picker} from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

const EventModal = ({visible, onClose, fetchEvents, eventToEdit}) => {
  const isEditing = !!eventToEdit;
  const profile = useSelector(state => state.auth?.user || null);

  const [createGroup, setCreateGroup] = useState(false);
  const [event, setEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    cName: '',
    cNumber: '',
    cEmail: '',
    picture: null,
    priceType: 'free',
    amount: '',
    currency: 'INR',
    department: profile ? profile.department : '',
  });

  // ✅ Convert 24-hour time to 12-hour format for UI display
  const convert24to12 = time => {
    if (!time) return new Date();
    let [hours, minutes] = time.split(':').map(Number);
    return new Date(2000, 0, 1, hours, minutes);
  };

  useEffect(() => {
    if (!profile) {
      console.error(
        'Profile data is missing. Ensure Redux state is properly populated.',
      );
      return;
    }

    if (eventToEdit) {
      setEvent({
        title: eventToEdit.title || '',
        start: eventToEdit.start ? new Date(eventToEdit.start) : new Date(),
        end: eventToEdit.end ? new Date(eventToEdit.end) : new Date(),
        startTime: convert24to12(eventToEdit.startTime || '00:00'),
        endTime: convert24to12(eventToEdit.endTime || '00:00'),
        location: eventToEdit.location || '',
        cName: eventToEdit.cName || '',
        cNumber: eventToEdit.cNumber ? String(eventToEdit.cNumber) : '',
        cEmail: eventToEdit.cEmail || '',
        picture: eventToEdit.picture || null,
        priceType: eventToEdit.priceType || 'free',
        amount: eventToEdit.amount || '',
        currency: eventToEdit.currency || 'INR',
        department: profile.department,
        createGroup: eventToEdit.createGroup || false,
      });
    } else {
      // Reset fields when switching to add event mode
      setEvent({
        title: '',
        start: new Date(),
        end: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        location: '',
        cName: '',
        cNumber: '',
        cEmail: '',
        picture: null,
        priceType: 'free',
        amount: '',
        currency: 'INR',
        department: profile.department,
        createGroup: false,
      });
    }
  }, [eventToEdit]);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [imageName, setImageName] = useState(''); // Store selected image name

  // Handle Image Upload using `react-native-image-crop-picker`
  const handleImageChange = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });

      // Extract and set the image name
      const fileName = image.path.split('/').pop();
      setImageName(fileName);

      // ✅ Show local image immediately
      setEvent(prevEvent => ({
        ...prevEvent,
        picture: image.path, // Temporary local image
      }));

      // Prepare FormData
      const formData = new FormData();
      formData.append('image', {
        uri: image.path.startsWith('file://')
          ? image.path
          : `file://${image.path}`,
        type: image.mime,
        name: fileName,
      });

      // Upload Image
      const response = await axios.post(
        `${userApiServer}/uploadImage/singleImage`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      // ✅ Update state with server image URL
      if (response.data) {
        console.log('Server Image URL:', response.data); // Debugging
        setEvent(prevEvent => ({
          ...prevEvent,
          picture: response.data, // Server Image URL
        }));
      } else {
        throw new Error('Failed to upload image');
      }

      Toast.show({type: 'success', text1: 'Image uploaded successfully!'});
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({type: 'error', text1: 'Image upload failed'});
    }
  };

  const formatDate = date => {
    const d = new Date(date);
    return (
      ('0' + (d.getMonth() + 1)).slice(-2) +
      '/' +
      ('0' + d.getDate()).slice(-2) +
      '/' +
      d.getFullYear()
    );
  };

  const formatTime = time => {
    if (!time || time === '00:00') return '12:00 AM'; // Default time

    const d = new Date(time);
    let hours = d.getHours();
    let minutes = d.getMinutes();

    if (isNaN(hours) || isNaN(minutes)) return '12:00 AM'; // If invalid, set default

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutes} ${ampm}`;
  };

  // ✅ Convert 12-hour format back to 24-hour format before saving
  const convert12to24 = date => {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSave = async () => {
    console.log('Profile:', profile._id);
    if (!profile || !profile._id) {
      Alert.alert(
        'Error',
        'User profile data is not available. Please try again.',
      );
      return;
    }

    if (
      !event.title ||
      !event.start ||
      !event.end ||
      !event.cName ||
      !event.location
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const formattedEvent = {
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        startTime: convert12to24(event.startTime),
        endTime: convert12to24(event.endTime),
        location: event.location,
        cName: event.cName,
        cNumber: event.cNumber,
        cEmail: event.cEmail,
        picture: event.picture,
        priceType: event.priceType,
        amount: event.priceType === 'paid' ? event.amount : null,
        currency: event.priceType === 'paid' ? event.currency : '',
        department: profile.department,
        createGroup: createGroup,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (isEditing) {
        response = await axios.put(
          `${userApiServer}/events/${eventToEdit._id}`,
          formattedEvent,
          config,
        );
        console.log('Event updated successfully:', response.data);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        response = await axios.post(
          `${userApiServer}/events/createEvent`,
          formattedEvent,
          config,
        );
        console.log('Event created successfully:', response.data);
        Alert.alert('Success', 'Event created successfully');
      }

      if (response && response.data) {
        fetchEvents(); // ✅ Only fetch events if the API request was successful
        onClose(); // ✅ Only close modal if the API request was successful
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event.');
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Event' : 'Add Event'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#999"
              value={event.title}
              onChangeText={text => setEvent({...event, title: text})}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeBox}
                  onPress={() => setShowStartDatePicker(true)}>
                  <Text style={styles.dateText}>{formatDate(event.start)}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={event.start}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowStartDatePicker(false);
                      if (date) setEvent(prev => ({...prev, start: date}));
                    }}
                  />
                )}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeBox}
                  onPress={() => setShowEndDatePicker(true)}>
                  <Text style={styles.dateText}>{formatDate(event.end)}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={event.end}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowEndDatePicker(false);
                      if (date) setEvent(prev => ({...prev, end: date}));
                    }}
                  />
                )}
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeBox}
                  onPress={() => setShowStartTimePicker(true)}>
                  <Text style={styles.dateText}>
                    <Text style={styles.dateText}>
                      {event.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={
                      event.startTime instanceof Date
                        ? event.startTime
                        : new Date()
                    }
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      setShowStartTimePicker(false);
                      if (date) setEvent(prev => ({...prev, startTime: date}));
                    }}
                  />
                )}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeBox}
                  onPress={() => setShowEndTimePicker(true)}>
                  <Text style={styles.dateText}>
                    {event.endTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={
                      event.endTime instanceof Date ? event.endTime : new Date()
                    }
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      setShowEndTimePicker(false);
                      if (date) setEvent(prev => ({...prev, endTime: date}));
                    }}
                  />
                )}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Event Location"
              placeholderTextColor="#999"
              value={event.location}
              onChangeText={text => setEvent({...event, location: text})}
            />

            <View style={styles.row}>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={event.priceType === 'free'}
                  onValueChange={() =>
                    setEvent({...event, priceType: 'free', amount: ''})
                  }
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}}
                />
                <Text style={styles.labelCheckbox}>Free</Text>
              </View>

              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={event.priceType === 'paid'}
                  onValueChange={() => setEvent({...event, priceType: 'paid'})}
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}}
                />
                <Text style={styles.labelCheckbox}>Paid</Text>
              </View>
            </View>

            {/* Amount & Currency (Only for Paid Event) */}
            {event.priceType === 'paid' && (
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    style={styles.input}
                    placeholder="Amount"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={event.amount ? event.amount.toString() : ''} // ✅ Convert to string
                    onChangeText={text => setEvent({...event, amount: text})}
                  />
                </View>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={event.currency}
                    style={styles.input}
                    dropdownIconColor="black"
                    onValueChange={itemValue =>
                      setEvent({...event, currency: itemValue})
                    }>
                    <Picker.Item label="INR" value="INR" />
                    <Picker.Item label="USD" value="USD" />
                    <Picker.Item label="EUR" value="EUR" />
                    <Picker.Item label="JYN" value="JYN" />
                  </Picker>
                </View>
              </View>
            )}

            {/* Coordinator Fields */}

            <TextInput
              style={styles.input}
              placeholder="Coordinator Name"
              placeholderTextColor="#999"
              value={event.cName}
              onChangeText={text => setEvent({...event, cName: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Coordinator Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={event.cNumber}
              onChangeText={text => setEvent({...event, cNumber: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Coordinator Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={event.cEmail}
              onChangeText={text => setEvent({...event, cEmail: text})}
            />

            <TouchableOpacity
              style={styles.imageUpload}
              onPress={handleImageChange}>
              <Text style={{color: 'white'}}>Choose File</Text>
            </TouchableOpacity>

            {/* Display selected image name */}
            {imageName ? (
              <Text style={styles.imageNameText}>{imageName}</Text>
            ) : null}

            {/* ✅ Hide "Create Group" checkbox if editing an event */}
            {!isEditing && (
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={createGroup}
                  onValueChange={setCreateGroup}
                  tintColors={{true: 'rgb(23, 72, 115)', false: 'gray'}}
                />
                <Text style={styles.labelCheckbox}>
                  Create a group with the same event title name
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Save Changes' : 'Add Event'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EventModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  scrollView: {
    maxHeight: 600, // Makes sure the modal is scrollable
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    color: '#000',
  },
  placeholderTextColor: {
    color: '#999',
  },
  dateText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 5,
  },
  halfWidth: {
    width: '48%',
    marginRight: 10,
  },
  dateTimeBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  labelCheckbox: {
    fontSize: 14,
    color: '#000',
    marginLeft: 5,
  },
  imageUpload: {
    padding: 10,
    backgroundColor: IoColor2,
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 5,
  },
  saveButton: {
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '48%',
    padding: 5,
    justifyContent: 'center',
    height: 50,
  },
  pickerStyle: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
  },
  imageNameText: {
    marginTop: 5,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
