import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {FlatList} from 'react-native-gesture-handler';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {userApiServer} from '../../config';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSelector} from 'react-redux';
import {IoColor1, IoColor2} from '../../colorCode';
import CheckBox from '@react-native-community/checkbox';
import EventModal from '../components/eventModal';
import {Linking} from 'react-native';

// Configure the calendar to display the days and months in English
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
LocaleConfig.defaultLocale = 'en';

const Events = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0],
  );
  const [currentMonth, setCurrentMonth] = useState(today);
  const [markedDates, setMarkedDates] = useState({});
  const [viewMode, setViewMode] = useState('Calendar');

  // Sample event data
  const [events, setEvents] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(new Date()); // Fix: Initialize as Date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendees, setAttendees] = useState({
    willAttend: [],
    mightAttend: [],
    willNotAttend: [],
  });

  const profileuser = useSelector(state => state.auth.user);
  const user = profileuser ? profileuser : {}; // Add null check here

  const isAdmin = user.profileLevel === 0 || user.profileLevel === 1;
  const isCreator = selectedEvent?.userId === user?._id;

  const handleAttendance = (status, eventId) => {
    if (selectedEvent.priceType === 'free') {
      setAttendanceStatus(status);
      submitAttendance(status, eventId);
    } else if (selectedEvent.priceType === 'paid') {
      Linking.openURL('https://razorpay.com/payment-link/plink_PA5q7Jm6wJENlt');
    }
  };

  const submitAttendance = async (status, eventId) => {
    try {
      const response = await axios.put(
        `${userApiServer}/events/attendEvent/${eventId}`,
        {
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          profilePicture: user.profilePicture,
          attendance: status,
          groupName: selectedEvent.title,
        },
      );

      if (response.status === 200) {
        Alert.alert('Vote submitted successfully.');
        // Re-fetch the event details to update the UI
        fetchEventDetails(eventId);
        checkAttendanceStatus(eventId); // Refresh the attendees list
      }
    } catch (error) {
      Alert.alert('An unexpected error occurred. Please try again.');
      console.error('Error submitting attendance:', error);
    }
  };

  const fetchEventDetails = async eventId => {
    try {
      const response = await axios.get(`${userApiServer}/events/${eventId}`);
      setSelectedEvent(response.data); // Update event details
      checkAttendanceStatus(eventId); // Re-check attendance
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = () => {
    axios
      .get(`${userApiServer}/events`)
      .then(response => {
        const filteredEvents = response.data.filter(event => {
          return !event.groupId || profile.groupNames.includes(event.groupId);
        });

        const eventsWithDates = filteredEvents.map(event => ({
          ...event,
          startDate: new Date(event.start).toISOString().split('T')[0],
          endDate: new Date(event.end).toISOString().split('T')[0],
        }));

        setEvents(eventsWithDates);
        markDatesOnCalendar(eventsWithDates); // Ensure dates are marked
      })
      .catch(error => console.error('Error fetching events:', error));
  };

  const markDatesOnCalendar = events => {
    let marked = {};
    events.forEach(event => {
      let currentDate = new Date(event.start);
      const endDate = new Date(event.end);
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        marked[dateString] = {marked: true, dotColor: 'blue'};
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    setMarkedDates(marked);
  };

  useEffect(() => {
    if (selectedEvent) {
      checkAttendanceStatus(selectedEvent._id);
    }
  }, [selectedEvent]);

  const checkAttendanceStatus = async eventId => {
    try {
      const response = await axios.get(
        `${userApiServer}/events/attendees/${eventId}`,
      );
      if (
        response.data.willAttend.some(user => user.userId === profileuser._id)
      ) {
        setAttendanceStatus(0);
      } else if (
        response.data.mightAttend.some(user => user.userId === profileuser._id)
      ) {
        setAttendanceStatus(1);
      } else if (
        response.data.willNotAttend.some(
          user => user.userId === profileuser._id,
        )
      ) {
        setAttendanceStatus(2);
      } else {
        setAttendanceStatus(null);
      }

      // ✅ Ensure attendees data is updated in state
      setAttendees(response.data);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      // Handle error (you can show a toast message here if needed)
    }
  };

  const onDayPress = day => {
    // console.log('Selected day:', day.dateString);

    // Find any event that includes the clicked date
    const event = events.find(event => {
      return (
        day.dateString >= event.startDate && day.dateString <= event.endDate
      );
    });

    // console.log('Found event:', event);

    if (event) {
      setSelectedEvent(event);
      checkAttendanceStatus(event._id); // Fetch attendees when an event is selected
      setModalVisible(true);
    } else {
      console.log('No event found for this date');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const handleMonthChange = action => {
    let newDate = new Date(currentMonth);
    if (action === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (action === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (action === 'today') {
      newDate = new Date(); // Reset to today
    }
    setCurrentMonth(newDate);
  };

  const renderCustomHeader = date => (
    <View style={styles.headerContainer}>
      <View style={styles.monthButtons}>
        <TouchableOpacity
          onPress={() => handleMonthChange('today')}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Today</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => handleMonthChange('prev')}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleMonthChange('next')}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Next</Text>
        </TouchableOpacity> */}
      </View>
      <Text style={styles.currentMonth}>
        {LocaleConfig.locales['en'].monthNames[date.getMonth()]}{' '}
        {date.getFullYear()}
      </Text>
    </View>
  );

  const renderEventItem = ({item}) => {
    // Ensure start and end are properly handled as Date objects
    const startTime = item.startTime ? item.startTime : 'N/A';

    return (
      <View style={styles.eventRow}>
        <Text style={styles.eventCell}>
          {new Date(item.start).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          -
          {new Date(item.end).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.eventCell}>{startTime}</Text>
        <Text style={styles.eventCell}>{item.title}</Text>
      </View>
    );
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || reminderDate;
    setShowDatePicker(false); // Close date picker after selection
    setReminderDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || reminderTime;
    setShowTimePicker(false); // Close time picker after selection
    setReminderTime(currentTime);
  };

  const handleReminder = () => {
    console.log('Reminder set for:', reminderDate, reminderTime);
    setReminderModalVisible(false);
  };

  const openReminderModal = () => {
    setReminderModalVisible(true);
  };

  const formatTime = time => {
    return time
      ? time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      : '00:00';
  };

  // const renderAttendees = attendees => {
  //   if (!attendees) return null;

  //   return (
  //     <View style={styles.attendeesContainer}>
  //       <Text style={styles.attendeesTitle}>Attendees</Text>

  //       <View style={styles.attendeeSection}>
  //         <Text style={styles.attendeeStatus}>Will Attend:</Text>
  //         {attendees.willAttend.map(user => (
  //           <View key={user.userId} style={styles.attendeeItemContainer}>
  //             <Image
  //               source={{uri: user.profilePicture}}
  //               style={styles.attendeeAvatar}
  //             />
  //             <Text style={styles.attendeeName}>{user.userName}</Text>
  //           </View>
  //         ))}
  //       </View>

  //       <View style={styles.attendeeSection}>
  //         <Text style={styles.attendeeStatus}>Might Attend:</Text>
  //         {attendees.mightAttend.map(user => (
  //           <View key={user.userId} style={styles.attendeeItemContainer}>
  //             <Image
  //               source={{uri: user.profilePicture}}
  //               style={styles.attendeeAvatar}
  //             />
  //             <Text style={styles.attendeeName}>{user.userName}</Text>
  //           </View>
  //         ))}
  //       </View>

  //       <View style={styles.attendeeSection}>
  //         <Text style={styles.attendeeStatus}>Will Not Attend:</Text>
  //         {attendees.willNotAttend.map(user => (
  //           <View key={user.userId} style={styles.attendeeItemContainer}>
  //             <Image
  //               source={{uri: user.profilePicture}}
  //               style={styles.attendeeAvatar}
  //             />
  //             <Text style={styles.attendeeName}>{user.userName}</Text>
  //           </View>
  //         ))}
  //       </View>
  //     </View>
  //   );
  // };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  const handleEditEvent = () => {
    setEventToEdit(selectedEvent);
    setEventModalVisible(true);
  };

  const handleDeleteEvent = async () => {
    try {
      if (!selectedEvent?._id) return;

      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this event?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                await axios.delete(
                  `${userApiServer}/events/${selectedEvent._id}`,
                );
                Alert.alert('Success', 'Event deleted successfully.');

                setModalVisible(false);
                setSelectedEvent(null);
                fetchEvents(); // Refresh the event list
              } catch (error) {
                console.error('Error deleting event:', error);
                Alert.alert(
                  'Error',
                  'Failed to delete event. Please try again.',
                );
              }
            },
            style: 'destructive',
          },
        ],
      );
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Event Calendar</Text>
      {viewMode === 'Calendar' ? (
        <View>
          <Calendar
            key={currentMonth.toISOString()} // Ensure re-render on month change
            current={currentMonth.toISOString().split('T')[0]}
            onDayPress={onDayPress}
            hideExtraDays={true}
            disableMonthChange={true}
            enableSwipeMonths={true}
            renderHeader={renderCustomHeader}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#f0f0f0',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#00adf5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#00adf5',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              monthTextColor: 'black',
              indicatorColor: 'blue',
              textDayfontFamily: 'Lexend-Regular',
              textMonthfontFamily: 'Lexend-Regular',
              textDayHeaderfontFamily: 'Lexend-Bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 16,
              'stylesheet.calendar.main': {
                container: {
                  paddingLeft: 0,
                  paddingRight: 0,
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  overflow: 'hidden',
                },
                week: {
                  marginTop: 0,
                  marginBottom: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                },
              },
              'stylesheet.day.basic': {
                base: {
                  width: 50,
                  height: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 0.5,
                  borderColor: '#ddd',
                },
                selected: {
                  backgroundColor: '#00adf5',
                  borderRadius: 25,
                },
                today: {
                  backgroundColor: 'rgba(0,173,245,0.3)',
                  borderRadius: 25,
                },
                text: {
                  color: '#2d4150',
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                },
              },
              'stylesheet.calendar.header': {
                dayHeader: {
                  marginTop: 2,
                  marginBottom: 7,
                  width: 32,
                  textAlign: 'center',
                  fontSize: 14,
                  color: '#4d63b2', // Set day header text color
                  fontFamily: 'Lexend-Regular', // Make day header text bold
                },
              },
            }}
          />
        </View>
      ) : (
        <View style={styles.eventsList}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Time</Text>
            <Text style={styles.tableHeaderText}>Event</Text>
          </View>
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
          />
        </View>
      )}

      <View style={styles.viewSelector}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            setViewMode(viewMode === 'Calendar' ? 'List' : 'Calendar')
          }>
          <Text style={styles.viewButtonText}>
            {viewMode === 'Calendar' ? 'All Events' : 'Back to Calendar'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setEventModalVisible(true)}>
        <MaterialCommunityIcons name="calendar-plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeModal}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: IoColor2,
                  padding: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}>
                <Text style={styles.modalTitle}>Event Details</Text>
              </View>
              <View style={{padding: 15}}>
                <Image
                  source={{uri: selectedEvent.picture}}
                  style={styles.modalImage}
                />
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Title:</Text>{' '}
                  {selectedEvent.title}
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Start Date:</Text>{' '}
                  {formatDate(selectedEvent.start)}
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>End Date:</Text>{' '}
                  {formatDate(selectedEvent.end)}
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Start Time:</Text>{' '}
                  {selectedEvent.startTime} hrs
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>End Time:</Text>{' '}
                  {selectedEvent.endTime} hrs
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Location:</Text>{' '}
                  {selectedEvent.location}
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Coordinator:</Text>{' '}
                  {selectedEvent.cName}
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Contact:</Text>{' '}
                  {selectedEvent.cNumber}
                </Text>
                <Text style={styles.eventDetail}>
                  <Text style={styles.eventDetailLabel}>Email:</Text>{' '}
                  {selectedEvent.cEmail}
                </Text>

                <Text style={styles.eventDetail}>
                  {selectedEvent.priceType === 'paid'
                    ? `This is a paid event (${selectedEvent.amount} ${selectedEvent.currency})`
                    : 'This is a free event'}
                </Text>

                {selectedEvent.priceType === 'paid' && (
                  <Text style={styles.eventDetail}>
                    <Text style={styles.boldText}>Price:</Text>{' '}
                    {selectedEvent.amount} {selectedEvent.currency}
                  </Text>
                )}

                <View style={styles.attendanceContainer}>
                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      value={attendanceStatus === 0}
                      onValueChange={() =>
                        handleAttendance(0, selectedEvent._id)
                      }
                      style={styles.checkbox}
                      tintColors={{true: IoColor1, false: 'gray'}}
                    />
                    <Text style={styles.labelCheckbox}>I will attend</Text>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      value={attendanceStatus === 1}
                      onValueChange={() =>
                        handleAttendance(1, selectedEvent._id)
                      }
                      style={styles.checkbox}
                      tintColors={{true: IoColor1, false: 'gray'}}
                    />
                    <Text style={styles.labelCheckbox}>I might attend</Text>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      value={attendanceStatus === 2}
                      onValueChange={() =>
                        handleAttendance(2, selectedEvent._id)
                      }
                      style={styles.checkbox}
                      tintColors={{true: IoColor1, false: 'gray'}}
                    />
                    <Text style={styles.labelCheckbox}>I will not attend</Text>
                  </View>
                </View>

                {(isCreator || profileuser.profileLevel === 0) && (
                  <View style={styles.attendeesContainer}>
                    <Text style={styles.attendeesTitle}>Attendees</Text>
                    <Text style={styles.attendeeStatus}>Will Attend:</Text>
                    {attendees.willAttend.length > 0 ? (
                      attendees.willAttend.map(user => (
                        <View
                          key={user.userId}
                          style={styles.attendeeItemContainer}>
                          <Image
                            source={{uri: user.profilePicture}}
                            style={styles.attendeeAvatar}
                          />
                          <Text style={styles.attendeeName}>
                            {user.userName}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.attendeeName}>None</Text>
                    )}
                    <Text style={styles.attendeeStatus}>Might Attend:</Text>
                    {attendees.mightAttend.length > 0 ? (
                      attendees.mightAttend.map(user => (
                        <View
                          key={user.userId}
                          style={styles.attendeeItemContainer}>
                          <Image
                            source={{uri: user.profilePicture}}
                            style={styles.attendeeAvatar}
                          />
                          <Text style={styles.attendeeName}>
                            {user.userName}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.attendeeName}>None</Text>
                    )}
                    <Text style={styles.attendeeStatus}>Will Not Attend:</Text>
                    {attendees.willNotAttend.length > 0 ? (
                      attendees.willNotAttend.map(user => (
                        <View
                          key={user.userId}
                          style={styles.attendeeItemContainer}>
                          <Image
                            source={{uri: user.profilePicture}}
                            style={styles.attendeeAvatar}
                          />
                          <Text style={styles.attendeeName}>
                            {user.userName}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.attendeeName}>None</Text>
                    )}
                  </View>
                )}

                {(isCreator || profileuser.profileLevel === 0) && (
                  <View style={styles.editDeleteContainer}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleEditEvent}>
                      <Text style={styles.editButtonText}>Edit Event</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeleteEvent}>
                      <Text style={styles.deleteButtonText}>Delete Event</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </Modal>
      )}

      {/* Add/Edit Event Modal */}
      <EventModal
        visible={eventModalVisible}
        onClose={() => {
          setEventModalVisible(false);
          if (eventToEdit) {
            fetchEventDetails(eventToEdit._id); // ✅ Fetch updated details after closing edit modal
          }
          setEventToEdit(null);
        }}
        fetchEvents={fetchEvents}
        eventToEdit={eventToEdit}
      />

      {/* Reminder Modal */}
      <Modal
        transparent={true}
        visible={reminderModalVisible}
        animationType="fade"
        onRequestClose={() => setReminderModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Reminder</Text>
            {/* Show Date Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerText}>
                Select Date: {reminderDate.toDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* Show Time Picker */}
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text style={styles.pickerText}>
                Select Time: {formatTime(reminderTime)}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <TouchableOpacity
              style={styles.googleCalendarButton}
              onPress={handleReminder}>
              <Text style={styles.googleCalendarButtonText}>Set Reminder</Text>
            </TouchableOpacity>
            {/* <Button title="Set Reminder" onPress={handleReminder} /> */}
            <TouchableOpacity
              onPress={() => setReminderModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* <TouchableOpacity style={styles.floatingButton}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity> */}
    </View>
  );
};

export default Events;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 10,
  },
  headerContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexDirection: 'column',
    alignItems: 'center',
  },
  monthButtons: {
    // flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  headerButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  headerButtonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  currentMonth: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
  },
  viewSelector: {
    // flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  viewButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: IoColor1,
    alignSelf: 'center',
    borderRadius: 5,
  },
  viewButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  eventsList: {
    marginTop: 20,
    fontFamily: 'Lexend-Regular',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  tableHeaderText: {
    flex: 1,
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  eventCell: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  modalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    color: 'black',
    marginLeft: 10,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
  modalBody: {
    marginBottom: 10,
  },
  eventDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
    fontFamily: 'Lexend-Regular',
    marginTop: 10,
  },
  eventDetailLabel: {
    fontFamily: 'Lexend-Bold',
    color: 'black',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30, // Set equal width and height
    height: 30,
    backgroundColor: 'white',
    borderRadius: 20, // Border radius should be half of the width/height for a perfect circle
    justifyContent: 'center', // Center the text inside
    alignItems: 'center', // Center the text inside
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'black',
  },
  googleCalendarButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    // width: '80%',
  },
  googleCalendarButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },
  reminderButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  reminderButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30, // Set equal width and height
    height: 30,
    backgroundColor: 'lightgray',
    borderRadius: 20, // Border radius should be half of the width/height for a perfect circle
    justifyContent: 'center', // Center the text inside
    alignItems: 'center', // Center the text inside
    zIndex: 1,
  },
  // closeButtonText: {
  //   color: 'white',
  //   fontFamily: 'Lexend-Regular',
  // },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    width: '100%',
    marginVertical: 10,
    fontFamily: 'Lexend-Regular',
  },
  pickerText: {
    fontSize: 18,
    marginVertical: 10,
    color: '#000',
    fontFamily: 'Lexend-Regular',
  },
  attendanceContainer: {
    marginVertical: 10,
  },
  attendeesContainer: {marginTop: 20},
  attendeesTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: 'black',
    marginBottom: 10,
  },
  attendeeSection: {marginTop: 10},
  attendeeStatus: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  // attendeeItem: {fontSize: 14, marginBottom: 2, fontFamily: 'Lexend-Regular'},
  attendeeItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: 20,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  attendeeName: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    alignSelf: 'flex-start',
    borderRadius: 5,
    width: '100%', // Ensures the container uses full width
  },
  checkbox: {
    marginRight: 8,
  },
  labelCheckbox: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  boldText: {
    fontWeight: 'bold',
  },
  editDeleteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  editButton: {
    flex: 1,
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },

  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },

  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: IoColor1,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Add shadow for a lifted effect
  },
});
