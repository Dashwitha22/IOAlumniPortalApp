import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For icons
import {userApiServer} from '../../../config';

const reactions = ['😍', '😂', '😡', '😞', '🤩'];

const CommentSection = ({
  comments,
  entityId,
  entityType,
  onCommentSubmit,
  onDeleteComment,
}) => {
  const [content, setContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [reply, setReply] = useState('');
  const profile = useSelector(state => state.auth.user);
  const [showReport, setShowReport] = useState({});
  const [likes, setLikes] = useState({});

  const handleCommentSubmit = async () => {
    try {
      const response = await axios.post(
        `${userApiServer}/${entityType}/${entityId}/comments`,
        {
          userId: profile._id,
          content: content,
          userName: profile.firstName,
          parentCommentId: null,
          profilePicture: profile.profilePicture,
        },
      );
      const postId = response.data._id;
      setContent('');
      onCommentSubmit(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentDelete = async commentId => {
    try {
      await axios.delete(
        `${userApiServer}/${entityType}/${entityId}/comments/${commentId}`,
      );
      onDeleteComment(entityId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReportToggle = commentId => {
    setShowReport(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleReport = async (commentId, userId) => {
    try {
      await axios.put(`${userApiServer}/${entityType}/${entityId}/report`, {
        commentId: commentId,
        userId: userId,
      });
      Alert.alert('Success', 'Reported successfully!');
      onCommentSubmit(entityId);
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const handleLikeToggle = (commentId, reaction = '❤️') => {
    setLikes(prevLikes => ({
      ...prevLikes,
      [commentId]: prevLikes[commentId] === reaction ? null : reaction,
    }));
  };

  const handleCommentReply = commentId => {
    if (!replyToCommentId) setReplyToCommentId(commentId);
    else setReplyToCommentId(null);
    setContent('');
  };

  const handleReplySubmit = async parentCommentId => {
    try {
      const response = await axios.post(
        `${userApiServer}/${entityType}/${entityId}/comments`,
        {
          content: reply,
          userName: profile.firstName,
          parentCommentId: parentCommentId,
          userId: profile._id,
          profilePicture: profile.profilePicture,
        },
      );
      const postId = response.data._id;
      setReply('');
      setReplyToCommentId(null);
      onCommentSubmit(postId);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const renderComments = commentsArray => {
    if (!commentsArray || commentsArray.length === 0) {
      return null;
    }

    return (
      <View style={styles.commentList}>
        {commentsArray.map(comment => (
          <View key={comment._id} style={styles.commentItem}>
            <View style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <Image
                  source={{uri: comment.profilePicture}}
                  style={styles.commentAvatar}
                />
                <Text style={styles.commentUsername}>{comment.userName}</Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <View style={styles.commentMenu}>
                <TouchableOpacity
                  onPress={() => handleReportToggle(comment._id)}>
                  <Icon name="more-vert" size={20} color="#000" />
                </TouchableOpacity>
                {showReport[comment._id] && (
                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => handleReport(comment._id, comment.userId)}>
                    <Text style={styles.reportButtonText}>Report</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.commentButtons}>
              {(comment.userId === profile._id ||
                profile.profileLevel === 0) && (
                <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() => handleCommentDelete(comment._id)}>
                  <Icon name="delete" size={20} color="#000" />
                  <Text style={styles.commentButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => handleCommentReply(comment._id)}>
                <Icon name="reply" size={20} color="#000" />
                <Text style={styles.commentButtonText}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleLikeToggle(comment._id)}
                onPressIn={() =>
                  setLikes({...likes, hoverComment: comment._id})
                }
                onPressOut={() => setLikes({...likes, hoverComment: null})}>
                <Text style={styles.likeButtonText}>
                  {likes[comment._id] || 'Like'}
                </Text>
              </TouchableOpacity>
              {likes.hoverComment === comment._id && (
                <View style={styles.reactionContainer}>
                  {reactions.map((reaction, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.reactionButton}
                      onPress={() => handleLikeToggle(comment._id, reaction)}>
                      <Text style={styles.reactionText}>{reaction}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {replyToCommentId === comment._id && (
              <View style={styles.replyForm}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Reply to this comment"
                  value={reply}
                  onChangeText={setReply}
                />
                <TouchableOpacity
                  style={styles.replySubmitButton}
                  onPress={() => handleReplySubmit(comment._id)}>
                  <Text style={styles.replySubmitButtonText}>Submit Reply</Text>
                </TouchableOpacity>
              </View>
            )}

            {renderComments(comment.comments)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.commentBox}>
        <View style={styles.commentHeader}>
          <Image
            source={{uri: profile.profilePicture}}
            style={styles.userAvatar}
          />
          <Text style={styles.userName}>{profile.firstName}</Text>
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment"
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity
          style={styles.commentSubmitButton}
          onPress={handleCommentSubmit}>
          <Text style={styles.commentSubmitButtonText}>Comment</Text>
        </TouchableOpacity>
      </View>

      {renderComments(comments)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
  },
  commentBox: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  userAvatar: {
    width: 60,
    height: 55,
    borderRadius: 27.5,
  },
  userName: {
    fontWeight: '600',
    fontSize: 18,
    color: 'black',
  },
  commentInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#71be95',
    paddingTop: 25,
    marginBottom: 16,
    color: 'black',
  },
  commentSubmitButton: {
    backgroundColor: '#0a3a4c',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  commentSubmitButtonText: {
    color: '#F8F8FF',
  },
  commentList: {
    marginTop: 16,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: '500',
    color: 'black',
  },
  commentContent: {
    padding: 10,
  },
  commentMenu: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  reportButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportButtonText: {
    color: '#000',
  },
  commentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentButtonText: {
    fontSize: 16,
  },
  likeButton: {
    position: 'relative',
  },
  likeButtonText: {
    fontSize: 16,
  },
  reactionContainer: {
    position: 'absolute',
    top: 30,
    left: -40,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5,
    borderRadius: 5,
  },
  reactionButton: {
    padding: 5,
  },
  reactionText: {
    fontSize: 16,
  },
  replyForm: {
    marginTop: 10,
  },
  replyInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#71be95',
    paddingTop: 25,
    marginBottom: 16,
  },
  replySubmitButton: {
    backgroundColor: '#0a3a4c',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  replySubmitButtonText: {
    color: '#F8F8FF',
  },
});

export default CommentSection;
