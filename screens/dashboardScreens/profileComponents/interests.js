import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Interests = () => {
  const [activeTab, setActiveTab] = useState('Companies');

  const renderContent = () => {
    switch (activeTab) {
      case 'Companies':
        return (
          <View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/ibmLogo.webp')}
                style={styles.interestsIcon}
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>IBM</Text>
                <Text style={styles.followersText}>16,806,194 followers</Text>
                <TouchableOpacity style={styles.followButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.followButtonText}>Following</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/oracleLogo.png')}
                style={styles.interestsIcon}
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>Oracle</Text>
                <Text style={styles.followersText}>9,711,279 followers</Text>
                <TouchableOpacity style={styles.followButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.followButtonText}>Following</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 5,
                alignSelf: 'center',
              }}>
              <Text style={{color: '#5c5350', fontSize: 15, marginRight: 5}}>
                Show all companies
              </Text>
              <Icon name="arrow-right" size={16} color="gray" />
            </TouchableOpacity>
          </View>
        );
      case 'Groups':
        return (
          <View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/reactLogo.png')}
                style={styles.interestsIcon}
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>
                  React Developers - ReactJS & React Native Professional
                  Development Mastermind
                </Text>
                <Text style={styles.followersText}>498,902 members</Text>
                <TouchableOpacity style={styles.joinedButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.joinedButtonText}>Joined</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/phpLogo.png')}
                style={styles.interestsIcon}
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>PHP Fresher Jobs</Text>
                <Text style={styles.followersText}>2,019 members</Text>
                <TouchableOpacity style={styles.joinedButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.joinedButtonText}>Joined</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 5,
                alignSelf: 'center',
              }}>
              <Text style={{color: '#5c5350', fontSize: 15, marginRight: 5}}>
                Show all groups
              </Text>
              <Icon name="arrow-right" size={16} color="gray" />
            </TouchableOpacity>
          </View>
        );
      case 'Newsletters':
        return (
          <View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/yellowMonleyLogo.png')}
                style={styles.interestsIcon}
                resizeMode="contain"
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>Yellomonkey</Text>
                <Text style={styles.interestsDescription}>
                  Get digital marketing insights delivered to your inbox!
                  Subscribe to our newsletter now and stay ahead of the game.
                </Text>
                <Text style={styles.publishedText}>Published weekly</Text>
                <View style={styles.publisherContainer}>
                  <Image
                    source={require('../../../assets/images/yellowMonleyLogo.png')}
                    style={styles.publisherIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.publisherName}>
                    Yellomonkey Labs - Digital Marketing
                  </Text>
                </View>
                <TouchableOpacity style={styles.subscribedButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.subscribedButtonText}>Subscribed</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/careerFresherLogo.png')}
                style={styles.interestsIcon}
                resizeMode="contain"
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>
                  Current Careers Opportunities
                </Text>
                <Text style={styles.interestsDescription}>
                  Keeping this in mind, we have designed this dedicated career
                  building knowledge platform for Fresher & Entry Level,Exp
                </Text>
                <Text style={styles.publishedText}>Published daily</Text>
                <View style={styles.publisherContainer}>
                  <Image
                    source={require('../../../assets/images/careerFresherLogo.png')}
                    style={styles.publisherIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.publisherName}>Career For Freshers</Text>
                </View>
                <TouchableOpacity style={styles.subscribedButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.subscribedButtonText}>Subscribed</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 5,
                alignSelf: 'center',
              }}>
              <Text style={{color: '#5c5350', fontSize: 15, marginRight: 5}}>
                Show all newsletters
              </Text>
              <Icon name="arrow-right" size={16} color="gray" />
            </TouchableOpacity>
          </View>
        );
      case 'Schools':
        return (
          <View>
            <View style={styles.interestsItem}>
              <Image
                source={require('../../../assets/images/AtmeCollegeLogo.png')}
                style={styles.interestsIcon}
                resizeMode="contain"
              />
              <View style={styles.interestsDetails}>
                <Text style={styles.interestsName}>
                  ATME College of Engineering, Mysuru
                </Text>
                <Text style={styles.followersText}>3,175 followers</Text>
                <TouchableOpacity style={styles.followButton}>
                  <Icon name="check" size={16} color="#0073b1" />
                  <Text style={styles.followButtonText}>Following</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.interests}>
      <Text style={styles.interestsTitle}>Interests</Text>
      <View style={styles.interestsTabs}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Companies' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('Companies')}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Companies' && styles.activeTabText,
            ]}>
            Companies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Groups' && styles.activeTab]}
          onPress={() => setActiveTab('Groups')}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Groups' && styles.activeTabText,
            ]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Newsletters' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('Newsletters')}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Newsletters' && styles.activeTabText,
            ]}>
            Newsletters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Schools' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('Schools')}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Schools' && styles.activeTabText,
            ]}>
            Schools
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

export default Interests;

const styles = StyleSheet.create({
  interests: {
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
  },
  interestsTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  interestsTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  tabButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0073b1',
  },
  tabButtonText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  interestsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  interestsIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  interestsDetails: {
    flex: 1,
  },
  interestsName: {
    fontSize: 16,
    color: 'black',
  },
  followersText: {
    fontSize: 14,
    color: 'gray',
  },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#0073b1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  followButtonText: {
    color: '#0073b1',
    marginLeft: 5,
  },
  joinedButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#0073b1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  joinedButtonText: {
    color: '#0073b1',
    marginLeft: 5,
  },
  subscribedButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#0073b1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  subscribedButtonText: {
    color: '#0073b1',
    marginLeft: 5,
  },
  interestsDescription: {
    fontSize: 14,
    color: 'black',
  },
  publisherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    flexWrap: 'wrap',
    width: '100%',
  },
  publishedText: {
    fontSize: 14,
    color: 'gray',
  },
  publisherIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  publisherName: {
    fontSize: 14,
    color: 'black',
    flexWrap: 'wrap',
    flex: 1,
  },
});
