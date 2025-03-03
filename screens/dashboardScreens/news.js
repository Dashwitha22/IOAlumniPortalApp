import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {IoColor1, IoColor2} from '../../colorCode';
import Home from './home';
import {useSelector} from 'react-redux';

const News = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>News</Text>
        <Text style={styles.subHeader}>
          Welcome to our dynamic Alumni Portal News Page, your source for the
          latest updates, inspiring stories, and exclusive opportunities
          tailored for our esteemed alumni community.
        </Text>
      </View>

      {isAdmin ? (
        <Home
          showCreatePost={false}
          showCreateButton={true}
          entityType="news"
          entityId="id"
          showDeleteButton={true}
          showFloatingMenu={false} // Hide the floating menu
        />
      ) : (
        <Home
          showCreatePost={false}
          entityType="news"
          entityId="id"
          showDeleteButton={true}
          showFloatingMenu={false} // Hide the floating menu
        />
      )}
    </ScrollView>
  );
};

export default News;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: IoColor2,
    margin: 16,
  },
  header: {
    fontFamily: 'Lexend-Regular',
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
  },
  subHeader: {
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
    fontWeight: '400',
    color: 'black',
    paddingTop: 10,
  },

  // createButton: {
  //   backgroundColor: IoColor1,
  //   paddingVertical: 10,
  //   paddingHorizontal: 20,
  //   borderRadius: 5,
  //   alignSelf: 'flex-start',
  //   marginBottom: 20,
  // },
  // createButtonText: {
  //   color: '#fff',
  //   fontSize: 16,
  //   fontFamily: 'Lexend-Regular',
  // },
  // newsItem: {
  //   backgroundColor: '#fff',
  //   padding: 10,
  //   borderRadius: 8,
  //   marginBottom: 20,
  //   flexDirection: 'row',
  //   shadowColor: '#000',
  //   shadowOffset: {width: 0, height: 1},
  //   shadowOpacity: 0.3,
  //   shadowRadius: 2,
  //   elevation: 3,
  // },
  // newsImage: {
  //   width: 100,
  //   height: 100,
  //   borderRadius: 8,
  //   marginRight: 16,
  // },
  // newsContent: {
  //   flex: 1,
  // },
  // newsTitle: {
  //   fontSize: 18,
  //   fontFamily: 'Lexend-Regular',
  //   marginBottom: 5,
  //   color: 'black',
  // },
  // newsMeta: {
  //   fontSize: 14,
  //   color: '#888',
  //   marginBottom: 10,
  //   fontFamily: 'Lexend-Regular',
  // },
  // newsDescription: {
  //   fontSize: 16,
  //   color: 'black',
  //   marginBottom: 10,
  //   fontFamily: 'Lexend-Regular',
  // },
  // readMoreContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // readMore: {
  //   fontSize: 16,
  //   color: '#007bff',
  //   marginRight: 5,
  //   fontFamily: 'Lexend-Regular',
  // },
});
