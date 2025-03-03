import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const newsletters = [
  {
    id: 1,
    title: 'India Industry Insights',
    subtitle:
      'Subscribe to the Accenture Business Journal for India weekly newsletter for new...',
    published: 'Published weekly',
    source: 'Accenture in India',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 2,
    title: 'Energy to the World',
    subtitle:
      'A look inside our world, our people’s stories, and our latest innovations as we continue t...',
    published: 'Published monthly',
    source: 'aramco',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 3,
    title: 'Industrial Learning',
    subtitle:
      'Industry oriented education is an approach to learning from an industry perspective ...',
    published: 'Published daily',
    source: 'Engineering UPdates',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 4,
    title: 'AI in Action',
    subtitle:
      'AI news is moving fast. Keep your business ahead with updates about AI advancement...',
    published: 'Published biweekly',
    source: 'IBM',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 5,
    title: 'AWS Certification & Training',
    subtitle: 'Tips and resources to fast-track your Cloud Career',
    published: 'Published weekly',
    source: 'Neal K. Davis',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 6,
    title: 'The Monthly Tech-In',
    subtitle:
      'Your monthly source of "byte-sized" updates on Microsoft innovations and global tech ...',
    published: 'Published monthly',
    source: 'Microsoft',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 7,
    title: 'In the Loop',
    subtitle:
      'A Newsletter highlighting trending topics, conversations and tools to help navigate th...',
    published: 'Published biweekly',
    source: 'LinkedIn',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 8,
    title: 'Transformation Today',
    subtitle:
      'Stories, interviews, and musings on technology innovations happening now fro...',
    published: 'Published biweekly',
    source: 'Google Cloud',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 9,
    title: 'Artificial Intelligence',
    subtitle:
      'The most important artificial intelligence and machine learning news and articles',
    published: 'Published weekly',
    source: 'Andriy Burkov',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
  {
    id: 10,
    title: 'The Spark',
    subtitle: 'Microsoft Learn',
    published: 'Published monthly',
    source: 'Microsoft Learn',
    image: require('../../../assets/images/newsLetter.jpg'),
  },
];

const YouMightLike = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You might like</Text>
      <Text style={styles.heading}>From your job title</Text>
      {newsletters.map(newsletter => (
        <View key={newsletter.id} style={styles.newsletter}>
          <Image source={newsletter.image} style={styles.image} />
          <View style={styles.newsletterDetails}>
            <Text style={styles.newsletterTitle}>{newsletter.title}</Text>
            <Text style={styles.newsletterSubtitle}>{newsletter.subtitle}</Text>
            <Text style={styles.newsletterPublished}>
              {newsletter.published}
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Image
                source={newsletter.image}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  marginRight: 5,
                }}
              />
              <Text style={styles.newsletterSource}>{newsletter.source}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subscribeButton}>
              <Icon name="plus" size={16} color="#0073b1" />
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
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

export default YouMightLike;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 5,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
    marginBottom: 5,
  },
  heading: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  newsletter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  newsletterDetails: {
    flex: 1,
  },
  newsletterTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  newsletterSubtitle: {
    fontSize: 14,
    color: 'black',
  },
  newsletterPublished: {
    fontSize: 12,
    color: 'gray',
  },
  newsletterSource: {
    fontSize: 12,
    color: 'black',
    marginBottom: 5,
  },
  subscribeButton: {
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
  subscribeButtonText: {
    color: '#0073b1',
    marginLeft: 5,
    fontSize: 16,
  },
});
