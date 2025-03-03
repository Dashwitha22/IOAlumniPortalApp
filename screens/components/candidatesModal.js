import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native';
import axios from 'axios';
import {userApiServer} from '../../config';
import {useSelector} from 'react-redux';
import {IoColor1, IoColor2} from '../../colorCode';

const CandidatesModal = ({visible, onClose, jobId, title}) => {
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const profile = useSelector(state => state.auth.user);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/${title}/appliedCandidates/${jobId}`,
      );
      setAppliedCandidates(response.data.userIds);
      setAppliedCandidatesDetails(response.data.appliedCandidates);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchCandidates();
    }
  }, [visible]);

  const handleApprove = (status, userId) => {
    setComments(prevComments => ({
      ...prevComments,
      [userId]: {showCommentBox: true, comment: ''},
    }));
    setStatus(status);
  };

  const handleReject = (status, userId) => {
    setComments(prevComments => ({
      ...prevComments,
      [userId]: {showCommentBox: true, comment: ''},
    }));
    setStatus(status);
  };

  //   const handleInReview = userId => {
  //     handleStatusUpdate('In Review', '', userId);
  //   };

  const handleClose = userId => {
    setComments(prevComments => ({
      ...prevComments,
      [userId]: {showCommentBox: false, comment: ''},
    }));
  };

  const handleSend = userId => {
    if (comments[userId].comment.trim() !== '') {
      setShowCommentBox(false);
      handleStatusUpdate(status, comments[userId].comment, userId);
      setComments(prevComments => ({
        ...prevComments,
        [userId]: {showCommentBox: false, comment: ''},
      }));
    }
  };

  const handleStatusUpdate = async (status, comment, userId) => {
    setStatusLoading(status);
    try {
      await axios.put(`${userApiServer}/jobs/${jobId}/updateJobStatus`, {
        userId,
        status,
        comment,
      });
      fetchCandidates();
      setStatusLoading(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Interested Candidates</Text>
          <View
            style={{
              height: 1,
              backgroundColor: 'black',
              marginVertical: 5,
            }}></View>
          <ScrollView>
            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : appliedCandidatesDetails.length === 0 ? (
              <View style={{marginVertical: 10}}>
                <Text style={styles.text}>No interested candidates</Text>
              </View>
            ) : (
              appliedCandidatesDetails.map((candidate, index) => (
                <View key={index} style={styles.candidateCard}>
                  <Text style={styles.text}>Name: {candidate.name}</Text>
                  <Text style={styles.text}>
                    Applied At: {new Date(candidate.appliedAt).toLocaleString()}
                  </Text>
                  <Text style={styles.resumeText}>
                    Resume:{' '}
                    <Text
                      style={styles.resumeLink}
                      onPress={() =>
                        Linking.openURL(
                          `${userApiServer}/uploads/${candidate.resume}`,
                        )
                      }>
                      {candidate.resume}
                    </Text>
                  </Text>
                  <Text style={styles.text}>
                    Status: {candidate.status || 'Pending'}
                  </Text>
                  {candidate.answers.map((answer, i) => (
                    <View key={i}>
                      <Text style={styles.text}>
                        Question: {answer.question}
                      </Text>
                      <Text style={styles.text}>Answer: {answer.answer}</Text>
                    </View>
                  ))}
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() =>
                        handleApprove('Approved', candidate.userId)
                      }>
                      <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() =>
                        handleReject('Rejected', candidate.userId)
                      }>
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.inReviewButton}
                      onPress={() =>
                        handleStatusUpdate('In Review', '', candidate.userId)
                      }>
                      <Text style={styles.buttonText}>In Review</Text>
                    </TouchableOpacity>
                  </View>
                  {comments[candidate.userId]?.showCommentBox && (
                    <View style={styles.commentBox}>
                      <TextInput
                        placeholder="Enter your comment"
                        style={styles.input}
                        placeholderTextColor="gray"
                        value={comments[candidate.userId].comment}
                        onChangeText={text =>
                          setComments(prevComments => ({
                            ...prevComments,
                            [candidate.userId]: {
                              ...prevComments[candidate.userId],
                              comment: text,
                            },
                          }))
                        }
                      />
                      <View style={styles.commentButtons}>
                        <TouchableOpacity
                          style={styles.sendButton}
                          onPress={() => handleSend(candidate.userId)}>
                          <Text style={styles.buttonText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.closeButton, {marginLeft: 10}]}
                          onPress={() => handleClose(candidate.userId)}>
                          <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CandidatesModal;

const styles = StyleSheet.create({
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
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  candidateCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  inReviewButton: {
    backgroundColor: '#c4c400',
    padding: 10,
    borderRadius: 5,
  },
  commentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: IoColor1,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  text: {
    color: 'black',
    marginVertical: 5,
  },
  input: {
    color: 'black',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'gray',
    marginTop: 10,
    padding: 10,
  },
  resumeText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginVertical: 5,
  },
  resumeLink: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
});
