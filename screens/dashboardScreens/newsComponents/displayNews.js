import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {userApiServer} from '../../config';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DisplayNews = ({
  postId,
  title,
  description,
  createdAt,
  picturePath,
  videoPath,
  department,
  userId,
  onDeletePost,
}) => {
  const navigation = useNavigation();
  const profile = useSelector(state => state.auth.user);
  const isAdmin = profile?.profileLevel === 0;
  const isUserDepartment =
    profile?.department === 'All' ||
    profile?.department === department ||
    department === 'All';

  const handleDeletePost = async () => {
    if (userId === profile?._id) {
      try {
        await axios.delete(`${userApiServer}/news/${postId}`);
        onDeletePost(postId);
        Alert.alert('Success', 'News deleted successfully!');
      } catch (error) {
        console.error('Error deleting news:', error);
        Alert.alert('Error', 'Failed to delete news.');
      }
    } else {
      Alert.alert('Error', 'You do not have permission to delete this news.');
    }
  };

  const getPostedByText = departmentName => {
    if (departmentName === 'All') {
      return 'By Super Admin';
    }
    return `By ${departmentName} Admin`;
  };

  const formatDate = dateString => {
    const dateParts = dateString.split(' ');
    const day = parseInt(dateParts[1], 10);
    const month = dateParts[2].substring(0, 3);
    const year = dateParts[3];

    const daySuffix = day => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${daySuffix(day)} ${month} ${year}`;
  };

  const handleReadMore = () => {
    navigation.navigate('NewsDetail', {
      postId,
      title,
      description,
      createdAt,
      picturePath,
      videoPath,
      department,
    });
  };

  if (!isUserDepartment) return null;

  return (
    <View style={styles.newsCard}>
      <Image
        source={{uri: picturePath || 'https://via.placeholder.com/300x120'}}
        style={styles.newsImage}
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{title ? title : 'News Headline'}</Text>
        <Text style={styles.newsDate}>Posted on {formatDate(createdAt)}</Text>
        <Text style={styles.profileLevel}>{getPostedByText(department)}</Text>
        <Text style={styles.newsDescription}>{description}</Text>
        <TouchableOpacity
          style={styles.readMoreContainer}
          onPress={handleReadMore}>
          <Text style={styles.readMore}>Read More</Text>
          <Icon name="arrow-forward" size={16} color="black" />
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity
            onPress={handleDeletePost}
            style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default DisplayNews;

const styles = StyleSheet.create({
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  newsContent: {
    marginTop: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    color: '#333',
    marginBottom: 8,
  },
  profileLevel: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#333',
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Lexend-Regular',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: '#555',
    marginBottom: 8,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 16,
    color: '#000',
    marginRight: 5,
    fontFamily: 'Lexend-Regular',
  },
  deleteButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FF0000',
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
