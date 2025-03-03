import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {IoColor1} from '../../colorCode';
import {userApiServer} from '../../config';
import {useSelector} from 'react-redux';
import axios from 'axios';

const messagesData = [
  {
    id: 1,
    sender: 'Dashwitha S S',
    senderImage: require('../../assets/images/girlAvatar.png'),
    time: '1:28 PM',
    date: 'Dec 18, 2024',
    message:
      'Hi Sir,\nI am looking for job change. If there are any openings for frontend developer, please let me know. I will share my resume.',
    isMine: false,
  },
  {
    id: 2,
    sender: 'Dashwitha S S',
    senderImage: require('../../assets/images/girlAvatar.png'),
    time: '1:30 PM',
    date: 'Dec 18, 2024',
    message: 'Please find my resume. I am waiting for your response.',
    pdf: {
      name: 'Dashwitha_S S_CV.pdf',
      size: '180 kB',
    },
    isMine: false,
  },
  {
    id: 3,
    sender: 'Keshavakarthik S',
    senderImage: require('../../assets/images/profilepic.5188743c44340e4474b2.jpg'),
    time: '4:12 PM',
    date: 'Dec 18, 2024',
    message: 'Hi Dashwitha\n\nMy team will get back to you.',
    isMine: true,
  },
];

const MessageScreen = ({route, navigation, user, onBack}) => {
  const [message, setMessage] = useState('');
  const [messagesData, setMessagesData] = useState([]);

  const [showOptions, setShowOptions] = useState(false); // State to toggle options
  const divUnderMessages = useRef();

  // Determine user from route params or passed props
  const selectedUser = user || route?.params?.user;
  const fromChat = route?.params?.fromChat || false; // If from chat, show header
  const profile = useSelector(state => state.auth.user);

  if (!selectedUser) {
    return <Text>No user selected</Text>;
  }

  // Fetch messages from the database
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${userApiServer}/messages/${selectedUser._id}`,
      );
      setMessagesData(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  // Send message to the database
  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessage = {
      text: message,
      sender: profile._id,
      recipient: selectedUser._id,
      createdAt: new Date().toISOString(),
    };

    // Update UI instantly
    setMessagesData(prev => [...prev, newMessage]);
    setMessage('');

    try {
      await axios.post(`${userApiServer}/messages`, newMessage);
    } catch (error) {
      console.error('Error sending message : ', error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (divUnderMessages.current) {
      divUnderMessages.current.scrollIntoView({
        behaviour: 'smooth',
        block: 'end',
      });
    }
  }, [messagesData]);

  // Function to render each message
  const renderMessage = ({item, index}) => {
    const isNewDate = index === 0 || messagesData[index - 1].date !== item.date;

    return (
      <>
        {isNewDate && (
          <View style={styles.dateContainer}>
            <View style={styles.line} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toDateString()}
            </Text>
            <View style={styles.line} />
          </View>
        )}

        <View
          style={[
            styles.messageItem,
            item.sender === profile._id
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}>
          <Image source={item.senderImage} style={styles.senderImage} />
          <View style={styles.messageContent}>
            <View style={styles.senderRow}>
              <Text style={styles.senderName}>{item.sender}</Text>
              <Text style={styles.timestamp}>
                {' '}
                • {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.messageText}>{item.text}</Text>

            {/* If PDF exists, render PDF attachment */}
            {item.file && (
              <View style={styles.pdfContainer}>
                <View style={styles.pdfIcon}>
                  <Text style={styles.pdfText}>PDF</Text>
                </View>
                <View>
                  <Text style={styles.pdfName}>{item.file.name}</Text>
                  <Text style={styles.pdfSize}>{item.file.size}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </>
    );
  };

  const getCurrentWork = workExperience => {
    if (!workExperience || workExperience.length === 0) return 'Unknown Role';

    const currentJob = workExperience.find(job => job.currentWork === true);
    return currentJob
      ? `${currentJob.title} @ ${currentJob.companyName}`
      : 'Unknown Role';
  };

  return (
    <View style={styles.container}>
      {/* Show Header ONLY if opened from ChatScreen */}
      {fromChat && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedUser.firstName} {selectedUser.lastName}
          </Text>
        </View>
      )}

      {/* To Section (ONLY if NOT opened from ChatScreen) */}
      {!fromChat && (
        <View style={styles.toContainer}>
          <Text style={styles.toText}>To:</Text>
          <View style={styles.selectedUser}>
            <Text style={styles.userName}>
              {selectedUser.firstName} {selectedUser.lastName}
            </Text>
            <TouchableOpacity onPress={onBack}>
              <Icon name="close" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content - Pushes Input to Bottom */}
      <View style={styles.contentContainer}>
        {/* User Profile */}
        <View style={styles.userProfile}>
          <Image
            source={
              selectedUser.profilePicture
                ? {uri: selectedUser.profilePicture}
                : require('../../assets/images/profilepic.5188743c44340e4474b2.jpg')
            }
            style={styles.userImage}
          />
          <Text style={styles.profileName}>
            {selectedUser.firstName} {selectedUser.lastName}
          </Text>
          <Text style={styles.profileRole}>
            {getCurrentWork(selectedUser.workExperience)}
          </Text>
        </View>

        {/* Chat Messages */}
        <FlatList
          data={messagesData}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.messageList}
          showsVerticalScrollIndicator={false}
          inverted // Invert to display the latest message at the bottom
        />

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.messageContainer}>
            {/* Toggle Plus / Close Icon */}
            <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
              <Icon
                name={showOptions ? 'close' : 'plus'}
                size={24}
                color={IoColor1}
              />
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              style={styles.messageInput}
              placeholder="Write a message..."
              placeholderTextColor="#666"
              value={message}
              onChangeText={text => setMessage(text)}
            />

            {/* Dynamic Icon - Microphone or Send */}
            {message.trim() ? (
              <TouchableOpacity onPress={sendMessage}>
                <Icon name="send" size={24} color={IoColor1} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <Icon name="microphone" size={24} color={IoColor1} />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={sendMessage}>
              <Icon name="send" size={24} color={IoColor1} />
            </TouchableOpacity>
          </View>

          {/* Extra Options View (Appears when Plus Icon is Clicked) */}
          {showOptions && (
            <View style={styles.optionsContainer}>
              {/* Document and Media Options */}
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.optionItem}>
                  <View style={styles.optionIcon}>
                    <Icon name="file" size={20} color="black" />
                  </View>

                  <Text style={styles.optionText}>Document</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <View style={styles.optionIcon}>
                    <Icon name="image" size={20} color="black" />
                  </View>
                  <Text style={styles.optionText}>Media</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: 'black',
  },
  toContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 15,
    padding: 10,
    borderRadius: 10,
  },
  toText: {fontSize: 16, fontWeight: 'bold', color: 'black', marginRight: 10},
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {color: 'white', fontWeight: 'bold', marginRight: 5},
  /* Content section takes full height and pushes input to bottom */
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', // Pushes input area to bottom
  },
  userProfile: {alignItems: 'flex-start', marginTop: 20, marginHorizontal: 15},
  userImage: {width: 80, height: 80, borderRadius: 40},
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'black',
  },
  profileRole: {fontSize: 14, color: '#666'},
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 15,
    padding: 10,
    borderRadius: 10,
  },
  messageInput: {flex: 1, fontSize: 16, color: '#333', marginHorizontal: 10},
  /* Extra Options Below Message Input */
  optionsContainer: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  optionItem: {
    alignItems: 'center',
    padding: 10,
  },
  optionIcon: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'black',
    padding: 15,
  },
  optionText: {
    marginTop: 5,
    fontSize: 14,
    color: 'black',
  },
  /* Chat Messages */
  messageList: {flex: 1, marginTop: 10},
  messageItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  myMessageContainer: {justifyContent: 'flex-end'},
  otherMessageContainer: {justifyContent: 'flex-start'},
  senderImage: {width: 35, height: 35, borderRadius: 20, marginRight: 10},
  messageContent: {flex: 1},
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {fontSize: 14, fontWeight: 'bold', color: 'black'},
  messageText: {fontSize: 14, color: 'black', marginTop: 3},
  timestamp: {fontSize: 12, color: '#888', marginTop: 3},

  /* PDF Attachment */
  pdfContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    alignItems: 'center',
  },
  pdfIcon: {
    backgroundColor: 'red',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    marginRight: 10,
  },
  pdfText: {color: 'white', fontWeight: 'bold'},
  pdfName: {fontSize: 14, fontWeight: 'bold', color: 'black'},
  pdfSize: {fontSize: 12, color: '#777'},

  /* Date Separator */
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  line: {flex: 1, height: 1, backgroundColor: '#ccc'},
  dateText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#777',
  },
});
