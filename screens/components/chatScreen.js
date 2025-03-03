import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SearchIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {IoColor1} from '../../colorCode';

const ChatScreen = ({navigation}) => {
  const [activeFilter, setActiveFilter] = useState('Focused'); // Track active filter

  const chatRecords = [
    {
      id: 1,
      firstName: 'Siddhi K.',
      message: 'How much do you love Data Science?',
      time: 'Mon',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 2,
      firstName: 'Franklin Tavarez',
      message: 'Hi there, Dashwitha!',
      time: 'Thu',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 3,
      firstName: 'Mishel M',
      message: 'Okay',
      time: 'Jul 8',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 4,
      firstName: 'Kiran Suresh',
      message: 'Guaranteed placement in a top Full-Stack or Backend dev role',
      time: 'Jul 1',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 5,
      firstName: 'Pratik Kapasi',
      message: 'Learn DSA to join Google & Top Product Companies!',
      time: 'Jun 18',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 6,
      firstName: 'pushpalatha r',
      message: 'Hello',
      time: 'May 6',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 7,
      firstName: 'LinkedIn Member',
      message: 'Guaranteed placement in a top Full-Stack or Backend dev role',
      time: 'May 3',
      image: require('../../assets/images/girlAvatar.png'),
    },
    {
      id: 8,
      firstName: 'LinkedIn Member',
      message: 'Event: Rohde & Schwarz Technology Symposium 2024',
      time: 'Apr 19',
      image: require('../../assets/images/girlAvatar.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.navigate('Dashboard')}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchIcon name="search" style={styles.searchicon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor="#000"
          />
        </View>
        <TouchableOpacity style={styles.moreIconContainer}>
          <Icon name="ellipsis-v" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      {/* <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'Focused' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('Focused')}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'Focused' && styles.activeFilterText,
            ]}>
            Focused
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'Unread' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('Unread')}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'Unread' && styles.activeFilterText,
            ]}>
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'Drafts' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('Drafts')}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'Drafts' && styles.activeFilterText,
            ]}>
            Drafts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'InMail' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('InMail')}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'InMail' && styles.activeFilterText,
            ]}>
            InMail
          </Text>
        </TouchableOpacity>
      </View> */}
      <FlatList
        data={chatRecords}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              navigation.navigate('MessageScreen', {
                user: item,
                fromChat: true,
              })
            }>
            <Image style={styles.chatProfilePic} source={item.image} />
            <View style={styles.chatContent}>
              <Text style={styles.chatName}>{item.firstName}</Text>
              <Text style={styles.chatMessage}>{item.message}</Text>
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate('NewMessageScreen')}>
        <FontAwesome name="pencil-square-o" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    height: 60,
  },
  backButtonContainer: {
    padding: 5,
  },
  searchContainer: {
    width: '70%',
    alignSelf: 'center',
    marginLeft: 10,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    paddingLeft: 30,
    height: 40,
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#000000',
  },
  searchicon: {
    position: 'absolute',
    left: 10,
    fontSize: 15,
    color: '#000000',
  },
  moreIconContainer: {
    padding: 5,
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#ECECEC', // Background color for inactive filters
  },
  activeFilterButton: {
    backgroundColor: '#0073b1', // Background color for the active filter
  },
  filterText: {
    color: '#000',
    fontFamily: 'Lexend-Bold',
  },
  activeFilterText: {
    color: '#FFF', // Text color for the active filter
  },
  chatList: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  chatContent: {
    flex: 1,
    marginLeft: 10,
  },
  chatName: {
    fontFamily: 'Lexend-Regular',
    color: 'black',
  },
  chatMessage: {
    color: 'black',
  },
  chatTime: {
    color: '#999',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 60,
    backgroundColor: IoColor1,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
