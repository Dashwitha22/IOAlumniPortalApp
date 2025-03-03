import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const SponsorshipDetails = ({details, onBack}) => (
  <ScrollView contentContainerStyle={styles.detailsContainer}>
    <Text style={styles.detailsTitle}>{details.title}</Text>
    <Text style={styles.detailsDate}>Posted on {details.date}</Text>
    <Text style={styles.detailsAuthor}>By {details.author}</Text>
    <Image
      source={{uri: 'https://via.placeholder.com/300x120'}}
      style={styles.imagePlaceholder}
    />
    <View style={styles.progressBar}>
      <View style={styles.progressFill} />
    </View>
    <Text style={styles.fundText}>₹ 40000 raised of ₹ 50000</Text>
    <Text style={styles.detailsDescription}>{details.description}</Text>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  detailsContainer: {
    flexGrow: 1,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontFamily: 'Lexend-Regular',
    marginBottom: 5,
    color: 'black',
  },
  detailsDate: {
    fontSize: 14,
    marginBottom: 4,
    color: 'gray',
  },
  detailsAuthor: {
    fontSize: 14,
    marginBottom: 16,
    color: 'gray',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    width: '80%',
    height: '100%',
    backgroundColor: 'black',
  },
  fundText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 16,
  },
  detailsDescription: {
    fontSize: 14,
    color: 'black',
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: 'black',
  },
});

export default SponsorshipDetails;
