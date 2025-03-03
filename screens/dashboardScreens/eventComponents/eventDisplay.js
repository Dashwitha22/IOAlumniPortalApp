import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {Avatar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EllipsisVIcon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import {format} from 'date-fns';
import {userApiServer} from '../../../config';

const EventDisplay = ({event, archived}) => {
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {};
  const [newEvent, setNewEvent] = useState(event);
  const [isEditing, setIsEditing] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendees, setAttendees] = useState({
    willAttend: [],
    mightAttend: [],
    willNotAttend: [],
  });

  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [documentUri, setDocumentUri] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  useEffect(() => {
    checkAttendanceStatus();
  }, []);

  const checkAttendanceStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${userApiServer}/events/attendees/${event._id}`,
      );
      if (response.status === 200) {
        setAttendees(response.data);
        determineAttendanceStatus(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error :', error);
      Alert.alert('Error', 'An error occurred.');
    }
  };

  const determineAttendanceStatus = attendees => {
    if (attendees.willAttend.some(user => user.userId === profile._id)) {
      setAttendanceStatus(0);
    } else if (
      attendees.mightAttend.some(user => user.userId === profile._id)
    ) {
      setAttendanceStatus(1);
    } else if (
      attendees.willNotAttend.some(user => user.userId === profile._id)
    ) {
      setAttendanceStatus(2);
    } else {
      setAttendanceStatus(null);
    }
  };

  const handleAttendance = async (attendance, eventId) => {
    setLoading(true);
    try {
      let body = {
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
        attendance,
        groupName: event.title,
      };

      const response = await axios.put(
        `${userApiServer}/events/attendEvent/${eventId}`,
        body,
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Attendance status updated successfully.');
        setNewEvent(response.data.event);
        checkAttendanceStatus();
      } else {
        console.error(
          'Unexpected response status:',
          response.status,
          response.message,
        );
        Alert.alert('Error', 'An unexpected error occured. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Alert.alert('Error', 'An error occurred.');
      setLoading(false);
    }
  };

  const formatCreatedAt = timestamp => {
    const options = {hour: 'numeric', minute: 'numeric', hour12: true};
    const timeString = new Date(timestamp).toLocaleTimeString(
      undefined,
      options,
    );
    const dateString = new Date(timestamp).toLocaleDateString();
    return `${dateString} ${timeString}`;
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDeleteEvent = async () => {
    try {
      const url = `${userApiServer}/events/${event._id}`;
      const requestBody = {groupName: event.title};
      const response = await axios.delete(url, {data: requestBody});

      if (response.status === 200) {
        Alert.alert('Success', 'Event deleted successfully.');
        window.location.reload();
      } else {
        console.error('Failed to delete event');
        Alert.alert('Error', 'Failed to delete event.');
      }
    } catch (error) {
      console.error('Error occurred while deleting event:', error);
    }
  };

  const handleEditEvent = () => {
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleArchiveEvent = () => {
    setShowArchiveModal(true);
  };

  const confirmArchiveEvent = async () => {
    setShowArchiveModal(false);
    setLoading(true);

    try {
      const url = `${userApiServer}/events/${event._id}/archive`;
      const response = await axios.put(url);

      if (response.status === 200) {
        Alert.alert('Success', 'Event archived successfully.');
        window.location.reload();
      } else {
        console.error('Failed to archive event');
        Alert.alert('Error', 'Failed to archive event.');
      }
    } catch (error) {
      console.error('Error occurred while archiving event:', error);
      Alert.alert('Error', 'Failed to archive event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker(false);
    if (field === 'start') {
      setStartDate(selectedDate || startDate);
    } else {
      setEndDate(selectedDate || endDate);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      setDocumentUri(res.uri);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        throw err;
      }
    }
  };

  const handleAddEvent = () => {
    const {title, cName, cNumber, cEmail, location} = newEvent;

    if (!title || !startDate || !endDate || !documentUri) {
      Alert.alert('Error', 'Please provide all required fields.');
      return;
    }

    const formattedStart = format(new Date(startDate), 'yyyy-MM-dd');
    const formattedEnd = format(new Date(endDate), 'yyyy-MM-dd');

    const eventData = {
      userId: profile._id,
      title,
      start: formattedStart,
      end: formattedEnd,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
      picture: documentUri,
      cName,
      cNumber,
      cEmail,
      location,
      department: profile.department,
      createGroup: false, // Handle group creation if necessary
    };

    console.log('Event Data:', eventData);

    fetch(`${userApiServer}/events/createEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Json.stringify(eventData),
    })
      .then(response => response.json())
      .then(createdEvent => {
        console.log('Event created:', createdEvent);
        Alert.alert('Success', 'Event created successfully.');
        setShowEditModal(false);
        setNewEvent({
          title: '',
          cName: '',
          cNumber: '',
          cEmail: '',
          location: '',
        });
      })
      .catch(error => console.error('Error creating event:', error));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.top}>
        <Avatar
          size="medium"
          rounded
          source={
            event.profilePicture
              ? {uri: event.profilePicture}
              : require('../../../assets/images/profilepic.5188743c44340e4474b2.jpg')
          }
        />
        <View style={styles.info}>
          <Text style={styles.userName}>{event.userName}</Text>
          <Text style={styles.createdAt}>
            {formatCreatedAt(event.createdAt)}
          </Text>
        </View>
        {event.userId === profile._id && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleDeleteEvent}>
            <EllipsisVIcon name="trash" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>

      {menuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={handleEditEvent}>
            <Text style={styles.menuItem}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleArchiveEvent}>
            <Text style={styles.menuItem}>
              {archived ? 'Unarchived' : 'Archive'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteEvent}>
            <Text style={styles.menuItem}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Title:</Text> {event.title}
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Start Date:</Text>{' '}
          {formatDate(event.start)}
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>End Date:</Text> {formatDate(event.end)}
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Start Time:</Text> {event.startTime} hrs
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>End Time:</Text> {event.endTime} hrs
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Coordinator Name:</Text> {event.cName}
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Coordinator Number:</Text> {event.cNumber}
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Coordinator Email:</Text> {event.cEmail}
        </Text>
        <Text style={styles.detailsText}>
          <Text style={styles.label}>Location:</Text> {event.location}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {event.userId === profile._id && (
          <TouchableOpacity onPress={() => setShowAttendeesModal(true)}>
            <Text style={styles.seeEventResults}>See event attendees</Text>
          </TouchableOpacity>
        )}
        <View>
          <TouchableOpacity
            style={styles.attendanceOption}
            onPress={() => handleAttendance(0, event._id)}>
            <Text style={styles.attendanceOptionText}>
              I will attend {attendanceStatus === 0 && <Text>✔</Text>}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attendanceOption}
            onPress={() => handleAttendance(1, event._id)}>
            <Text style={styles.attendanceOptionText}>
              I might attend {attendanceStatus === 1 && <Text>✔</Text>}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attendanceOption}
            onPress={() => handleAttendance(2, event._id)}>
            <Text style={styles.attendanceOptionText}>
              I will not attend {attendanceStatus === 2 && <Text>✔</Text>}
            </Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="small" color="#0000ff" />}
        </View>
      </View>

      <Modal
        visible={showAttendeesModal}
        onRequestClose={() => setShowAttendeesModal(false)}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.attendeesModal}>
            <Text style={styles.modalTitle}>Event Attendees</Text>

            <ScrollView>
              <View style={styles.attendeesSection}>
                <Text style={styles.attendeesHeading}>Will Attend</Text>
                <Text style={styles.attendeesCount}>
                  Total: {attendees?.willAttend.length}
                </Text>
                {attendees?.willAttend.map(user => (
                  <View key={user.userId} style={styles.attendeeItem}>
                    <Avatar
                      source={{uri: user.profilePicture}}
                      rounded
                      size="small"
                    />
                    <Text style={styles.attendeeName}>{user.userName}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.attendeesSection}>
                <Text style={styles.attendeesHeading}>Might Attend</Text>
                <Text style={styles.attendeesCount}>
                  Total: {attendees?.mightAttend.length}
                </Text>
                {attendees?.mightAttend.map(user => (
                  <View key={user.userId} style={styles.attendeeItem}>
                    <Avatar
                      source={{uri: user.profilePicture}}
                      rounded
                      size="small"
                    />
                    <Text style={styles.attendeeName}>{user.userName}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.attendeesSection}>
                <Text style={styles.attendeesHeading}>Will Not Attend</Text>
                <Text style={styles.attendeesCount}>
                  Total: {attendees?.willNotAttend.length}
                </Text>
                {attendees?.willNotAttend.map(user => (
                  <View key={user.userId} style={styles.attendeeItem}>
                    <Avatar
                      source={{uri: user.profilePicture}}
                      rounded
                      size="small"
                    />
                    <Text style={styles.attendeeName}>{user.userName}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAttendeesModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Event Edit Modal */}
      <Modal
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        animationType="slide">
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Event' : 'Add Event'}
          </Text>
          <TextInput
            placeholder="Event Title"
            value={newEvent.title}
            onChangeText={text => setNewEvent({...newEvent, title: text})}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.input}>
              {startDate
                ? `start Date: ${formatDate(startDate)}`
                : 'Select Start Date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) =>
                handleDateChange(event, selectedDate, 'start')
              }
            />
          )}
          <TouchableOpacity onPress={handleDocumentPicker}>
            <Text style={styles.input}>Pick a Document</Text>
          </TouchableOpacity>
          {documentUri && (
            <Image
              source={{uri: documentUri}}
              style={{width: 100, height: 100, marginTop: 10}}
            />
          )}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={isEditing ? handleEditEvent : handleAddEvent}>
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Save Changes' : 'Add Event'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowEditModal(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        visible={showArchiveModal}
        onRequestClose={() => setShowArchiveModal(false)}
        animationType="slide">
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Confirm Archive</Text>
          <Text>
            Are you sure you want to {archived ? 'unarchive' : 'archive'} this
            event?
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={confirmArchiveEvent}>
            <Text style={styles.submitButtonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowArchiveModal(false)}>
            <Text style={styles.cancelButtonText}>No</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EventDisplay;

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
    padding: 10,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  info: {
    marginLeft: 10,
  },
  userName: {
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
    color: 'black',
  },
  createdAt: {
    fontSize: 14,
    color: '#004C8A',
    fontFamily: 'Lexend-Regular',
  },
  moreButton: {
    marginLeft: 'auto',
  },
  menuContainer: {
    position: 'absolute',
    right: 10,
    top: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    padding: 10,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailsText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
  },
  label: {
    fontFamily: 'Lexend-Bold',
  },
  optionsContainer: {
    marginTop: 20,
  },
  seeEventResults: {
    textAlign: 'right',
    fontFamily: 'Lexend-Regular',
    color: '#004C8A',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  attendanceOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: ' #ccc',
    borderRadius: 5,
    fontFamily: 'Lexend-Regular',
  },
  attendanceOptionText: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    shadowColor: '#000',
    fontFamily: 'Lexend-Regular',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalTitle: {
    fontFamily: 'Lexend-Regular',
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    color: 'black',
  },
  submitButton: {
    backgroundColor: '#004C8A',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
  cancelButton: {
    backgroundColor: 'grey',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeesModal: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  attendeesSection: {
    marginBottom: 15,
  },
  attendeesHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  attendeesCount: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendeeName: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#004C8A',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
