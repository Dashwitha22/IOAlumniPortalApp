import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const alumniData = [
  {
    name: 'Arjun Kumar Sharma',
    title: 'Software Engineer',
    description:
      'Arjun graduated in 2015 and has been working in the tech industry for over 6 years. He specializes in web development and is passionate about mentoring students.',
    image: 'https://via.placeholder.com/150',
  },
  {
    name: 'Rohan Rajesh Reddy',
    title: 'Data Scientist',
    description:
      'Rohan graduated in 2018 and has experience in data analysis and machine learning. He loves helping students navigate their career paths.',
    image: 'https://via.placeholder.com/150',
  },
  {
    name: 'Vikram Anand Joshi',
    title: 'Product Manager',
    description:
      'Vikram graduated in 2016 and has worked in various startups. He is eager to share his insights on product development and management.',
    image: 'https://via.placeholder.com/150',
  },
];

const Guidance = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Guidance from Alumni</Text>
      <Text style={styles.subheader}>
        Welcome to the Guidance Page! Here, current students can connect with
        alumni for advice and mentorship.
      </Text>
      {alumniData.map((alumni, index) => (
        <View style={styles.card} key={index}>
          <Image source={{uri: alumni.image}} style={styles.image} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{alumni.name}</Text>
            <Text style={styles.cardSubtitle}>{alumni.title}</Text>
            <Text style={styles.cardText}>{alumni.description}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Get Guidance</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default Guidance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: 'black',
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#71be95',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
