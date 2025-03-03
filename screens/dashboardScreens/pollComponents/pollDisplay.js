import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {Avatar} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EllipsisVIcon from 'react-native-vector-icons/FontAwesome5';
import PollModal from './pollModal';
import {userApiServer} from '../../../config';
import defaultPic from '../../../assets/images/profilepic.5188743c44340e4474b2.jpg';
import {IoColor1} from '../../../colorCode';

const PollDisplay = ({poll, archived}) => {
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here
  const [hasVoted, setHasVoted] = useState(false);
  const [updatedPoll, setUpdatedPoll] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // Menu visibility state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userVoted = poll.options.some(option =>
      option.votes.some(vote => vote.userId === profile._id),
    );
    setHasVoted(userVoted);
    if (userVoted) {
      setUpdatedPoll(poll);
    }
  }, [poll, profile._id]);

  const handleVote = async optionId => {
    if (poll.userId === profile._id) {
      Alert.alert('Error', 'You cannot vote on your own poll.');
      return;
    }

    try {
      setLoading(true);
      let body = {
        userId: profile._id,
        optionId: optionId,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
      };

      const response = await axios.put(
        `${userApiServer}/poll/${poll._id}`,
        body,
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Vote submitted successfully.');
        setUpdatedPoll(response.data.poll);
        setHasVoted(true);
      } else {
        console.error('Unexpected response status:', response.status);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit vote',
      );
    } finally {
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

  const calculatePercentages = options => {
    const totalVotes = options.reduce(
      (acc, option) => acc + option.votes.length,
      0,
    );
    return options.map(option => ({
      ...option,
      percentage: totalVotes ? (option.votes.length / totalVotes) * 100 : 0,
    }));
  };

  const handleOpenModal = () => {
    if (poll.userId === profile._id) {
      setModalVisible(true);
    } else {
      Alert.alert('Error', 'You are not authorized to view this information.');
    }
  };

  const handleEditPoll = async (question, options) => {
    setShowPollModal(true);

    const pollData = {
      userId: profile._id,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
      question: question,
      options: options,
    };

    try {
      const response = await axios.put(
        `${userApiServer}/poll/${poll._id}/editPoll`,
        pollData,
      );
      setShowPollModal(false);
      Alert.alert('Success', 'Poll edited successfully.');
      // Optionally refresh the poll data here
    } catch (error) {
      console.error('Error editing poll:', error);
      Alert.alert('Error', 'Failed to edit poll. Please try again.');
    }
  };

  const handleArchivePoll = () => {
    setArchiveModalVisible(true);
  };

  const confirmArchivePoll = async () => {
    setArchiveModalVisible(false);
    setLoading(true);

    try {
      const url = `${userApiServer}/poll/${poll._id}/archive`;
      const response = await axios.put(url);

      if (response.status === 200) {
        Alert.alert('Success', 'Poll archived successfully.');
        // Optionally, update UI state or reload the page
      } else {
        console.error('Failed to archive poll');
        Alert.alert('Error', 'Failed to archive poll.');
      }
    } catch (error) {
      console.error('Error occurred while archiving poll:', error);
      Alert.alert('Error', 'Failed to archive poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async () => {
    setLoading(true);

    try {
      const url = `${userApiServer}/poll/${poll._id}`;
      const response = await axios.delete(url);

      if (response.status === 200) {
        Alert.alert('Success', 'Poll deleted successfully.');
        // Optionally, update UI state or reload the page
      } else {
        console.error('Failed to delete poll');
        Alert.alert('Error', 'Failed to delete poll.');
      }
    } catch (error) {
      console.error('Error occurred while deleting poll:', error);
      Alert.alert('Error', 'Failed to delete poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pollData = hasVoted ? updatedPoll : poll;
  const optionsWithPercentages = calculatePercentages(pollData.options);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.top}>
        <Avatar
          size="medium"
          rounded
          source={poll.profilePicture ? {uri: poll.profilePicture} : defaultPic}
        />
        <View style={styles.info}>
          <Text style={styles.userName}>{poll.userName}</Text>
          <Text style={styles.createdAt}>
            {formatCreatedAt(poll.createdAt)}
          </Text>
        </View>
        {poll.userId === profile._id && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleDeletePoll}>
            <EllipsisVIcon name="trash" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>

      {/* {menuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={handleEditPoll}>
            <Text style={styles.menuItem}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleArchivePoll}>
            <Text style={styles.menuItem}>
              {archived ? 'Unarchive' : 'Archive'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePoll}>
            <Text style={styles.menuItem}>Delete</Text>
          </TouchableOpacity>
        </View>
      )} */}

      <Text style={styles.question}>{poll.question}</Text>
      <Text
        style={{
          color: 'grey',
          fontSize: 15,
          paddingTop: 10,
          fontFamily: 'Lexend-Regular',
        }}>
        (Choose only one option)
      </Text>
      <View style={styles.optionsContainer}>
        {poll.userId === profile._id && (
          <TouchableOpacity onPress={handleOpenModal}>
            <Text style={styles.seePollResults}>See Poll Results</Text>
          </TouchableOpacity>
        )}
        {optionsWithPercentages.map(option => (
          <TouchableOpacity
            key={option._id}
            style={[styles.option, hasVoted ? styles.voted : styles.clickable]}
            onPress={() => !hasVoted && handleVote(option._id)}>
            <Text style={styles.optionText}>{option.option}</Text>
            {hasVoted && ( // Only show the percentage bars if the user has voted
              <View style={styles.percentageBarContainer}>
                <View
                  style={[
                    styles.percentageBar,
                    {
                      width:
                        option.percentage === 0
                          ? '100%'
                          : `${option.percentage}%`, // Bar is always 100% width for 0.00% options
                      backgroundColor:
                        option.percentage === 0 ? 'transparent' : IoColor1, // Transparent background for 0.00%
                    },
                  ]}>
                  <Text style={styles.percentageText}>
                    {option.percentage.toFixed(2)}%
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Poll Results Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.votersContainer}>
            {pollData.options.map(option => (
              <View key={option._id} style={styles.optionResult}>
                <Text style={styles.optionTitle}>{option.option}</Text>
                <Text style={styles.totalVotes}>
                  Total votes: {option.votes.length}
                </Text>
                {option.votes.length > 0 ? (
                  option.votes.map(vote => (
                    <View key={vote.userId} style={styles.voterInfo}>
                      <Avatar
                        size="small"
                        rounded
                        source={
                          vote.profilePicture
                            ? {uri: vote.profilePicture}
                            : defaultPic
                        }
                      />
                      <Text style={styles.voterName}>{vote.userName}</Text>
                    </View>
                  ))
                ) : (
                  <Text>No voters</Text>
                )}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={archiveModalVisible}
        onRequestClose={() => setArchiveModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.archiveModalTitle}>
            Confirm {archived ? 'Unarchive' : 'Archive'}
          </Text>
          <Text style={styles.archiveModalBody}>
            Are you sure you want to {archived ? 'unarchive' : 'archive'} this
            poll?
          </Text>
          <View style={styles.archiveModalButtons}>
            <TouchableOpacity
              style={styles.archiveModalButton}
              onPress={() => setArchiveModalVisible(false)}>
              <Text>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.archiveModalButton}
              onPress={confirmArchivePoll}>
              <Text>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Poll Edit Modal */}
      <PollModal
        visible={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSubmit={handleEditPoll}
        initialData={pollData}
        edit={true}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </ScrollView>
  );
};

export default PollDisplay;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontFamily: 'Lexend-Regular',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 10,
  },
  info: {
    marginLeft: 10,
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Regular',
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
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  question: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    paddingTop: 10,
    color: '#3A3A3A',
  },
  optionsContainer: {
    marginTop: 20,
  },
  seePollResults: {
    textAlign: 'right',
    fontFamily: 'Lexend-Regular',
    color: '#004C8A',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  percentageBarContainer: {
    marginTop: 5,
    marginBottom: 5,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: 'Lexend-Regular',
    borderStyle: 'solid',
    padding: 5,
  },
  percentageBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#004C8A',
    fontFamily: 'Lexend-Regular',
    height: 20,
    justifyContent: 'center',
  },
  percentageText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  voted: {
    backgroundColor: '#d9d9d9',
  },
  clickable: {
    backgroundColor: '#e0e0e0',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  votersContainer: {
    width: '100%',
  },
  optionResult: {
    marginBottom: 20,
  },
  optionTitle: {
    fontFamily: 'Lexend-Regular',
    fontSize: 18,
    color: 'black',
  },
  totalVotes: {
    marginBottom: 10,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  voterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
    marginBottom: 10,
  },
  voterName: {
    marginLeft: 10,
    color: 'black',
    fontFamily: 'Lexend-Bold',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#004C8A',
    borderRadius: 5,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  archiveModalTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
  },
  archiveModalBody: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  archiveModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  archiveModalButton: {
    padding: 10,
    fontFamily: 'Lexend-Regular',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
});
