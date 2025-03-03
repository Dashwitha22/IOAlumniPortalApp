import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const people = [
  {
    id: 1,
    name: 'Pramod Kumar K N',
    title: 'Software Developer',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 2,
    name: 'Sachin K V',
    title: 'Software Developer @ InsideOut',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 3,
    name: 'Koti Kiran NB',
    title: 'Jeweller | Senior Web Developer | Freelance WordPress Developer',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 4,
    name: 'Pinaki Prasad Rajkumar',
    title: 'Full stack web developer | React and Node.js',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 5,
    name: 'Sahana Evangeline',
    title: 'Technical Lead & Web Developer',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 6,
    name: 'Sindhu C',
    title:
      'FULLSTACK DEVELOPER (immediate joiner) Masters in computer applications',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 7,
    name: 'Swatimonalisa patra',
    title: 'Software Developer',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 8,
    name: 'Pallavi Gowda',
    title: 'Software Developer',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 9,
    name: 'Santhosh HC',
    title:
      'SOFTWARE DEVELOPER | REACT JS | NODE JS | MONGODB | IMMEDIATE JOINER',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
  {
    id: 10,
    name: 'Sam Thomas Abraham',
    title:
      'RPA Developer at UST | UiPath (UiARD) Advanced Certified RPA Developer',
    image: require('../../../assets/images/profilePicture.jpg'),
  },
];

const PeopleYouMayKnow = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>People you may know</Text>
      <Text style={styles.subtitle}>From your job title</Text>
      {people.map(person => (
        <View key={person.id} style={styles.person}>
          <Image source={person.image} style={styles.image} />
          <View style={styles.personDetails}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.personTitle}>{person.title}</Text>
            <TouchableOpacity style={styles.connectButton}>
              <Icon name="user-plus" size={16} color="#0073b1" />
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 5,
          alignSelf: 'center',
        }}>
        <Text style={{color: '#5c5350', fontSize: 15, marginRight: 5}}>
          Show all
        </Text>
        <Icon name="arrow-right" size={16} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default PeopleYouMayKnow;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 5,
  },
  personTitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  person: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  personDetails: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  connectButton: {
    marginVertical: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: '#0073b1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: '#0073b1',
    marginLeft: 5,
  },
});
