import React from 'react';
import {StyleSheet, Text, View, ScrollView, Image} from 'react-native';

const NewsDetail = ({route}) => {
  const {
    postId,
    title,
    description,
    createdAt,
    picturePath,
    videoPath,
    department,
  } = route.params || {}; // Use destructuring to access passed parameters

  console.log({createdAt}); // Debug to confirm value

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

  const getPostedByText = departmentName => {
    if (departmentName === 'All') {
      return 'By Super Admin';
    }
    return `By ${departmentName} Admin`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.newsTitle}>{title ? title : 'News Headline'}</Text>
      <Text style={styles.newsMeta}>Posted on {formatDate(createdAt)}</Text>
      <Text style={styles.profileLevel}>{getPostedByText(department)}</Text>
      <Image
        style={styles.newsImage}
        source={{uri: picturePath || 'https://via.placeholder.com/600x300'}}
      />
      <Text style={styles.newsDescription}>{description}</Text>
    </ScrollView>
  );
};

export default NewsDetail;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  newsTitle: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 10,
  },
  newsMeta: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  newsDescription: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 30,
  },
  profileLevel: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#333',
    marginBottom: 8,
  },
});
