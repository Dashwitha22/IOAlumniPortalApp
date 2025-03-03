import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MessageScreen from './messageScreen';
import {useDispatch, useSelector} from 'react-redux';
import {fetchMembers} from '../../store/actions/memberActions';

const NewMessageScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const members = useSelector(state => state.members.members);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  const filteredUsers = useMemo(
    () =>
      members.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, members],
  );

  const getCurrentWork = workExperience => {
    if (!workExperience || workExperience.length === 0)
      return {title: 'Unknown', companyName: 'Unknown'};

    const currentJob = workExperience.find(job => job.currentWork === true);
    return currentJob
      ? {title: currentJob.title, companyName: currentJob.companyName}
      : {title: 'Unknown', companyName: 'Unknown'};
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
      </View>

      {/* Replace content below the header dynamically */}
      {selectedUser ? (
        <MessageScreen
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
        />
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.toText}>To:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Type a name"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>

          {/* Suggested Users List */}
          {searchQuery === '' && (
            <Text style={styles.suggestedTitle}>Suggested</Text>
          )}

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item._id}
            renderItem={({item}) => {
              const {title, companyName} = getCurrentWork(item.workExperience);

              return (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => setSelectedUser(item)}>
                  <Image
                    source={
                      item.profilePicture
                        ? {uri: item.profilePicture}
                        : require('../../assets/images/profilepic.5188743c44340e4474b2.jpg')
                    }
                    style={styles.userImage}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.userRole}>
                      {title}@ {companyName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </View>
  );
};

export default NewMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: 'black',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  toText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  suggestedTitle: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
    color: 'black',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  userInfo: {
    marginLeft: 10,
    color: 'black',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
});
