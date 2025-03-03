import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Home from '../home';

const SocialMediaPost = ({showCreatePost, groupID}) => {
  console.log('SocialMediaPost ID :', groupID);
  return (
    <ScrollView style={styles.feedContainer}>
      <Home entityType="posts" groupID={groupID} showFloatingMenu={false} />
    </ScrollView>
  );
};

export default SocialMediaPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  createPostButton: {
    backgroundColor: '#f8a700',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  createPostText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
  },
  feedContainer: {
    flex: 1,
  },
});
