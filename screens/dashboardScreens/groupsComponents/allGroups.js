import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {userApiServer} from '../../../config';
import DisplayGroupItem from './displayGroupItem';

const AllGroups = ({profile, searchQuery, selectedGroupType}) => {
  // const profile = useSelector(state => state.auth.user);
  const title = 'SuggestedGroups';
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [loading, setLoading] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const LIMIT = 4;
  const [page, setPage] = useState(1);

  const getGroups = async (isRefreshing = false) => {
    if (loading && !isRefreshing) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `${userApiServer}/groups?page=${page}&size=${LIMIT}`,
        {userId: profile._id},
      );
      // console.log('All groups response : ', response.data);
      const newGroups = response.data.records;
      if (isRefreshing) {
        setGroups(newGroups); // If refreshing, replace the data
      } else {
        setGroups(prevItems => [...prevItems, ...newGroups]); // Load more, append data
      }
      setTotalGroups(response.data.total);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getGroups();
  }, [page]);

  const handleLoadMore = () => {
    if (page <= totalGroups / LIMIT) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1); // Reset to the first page
    getGroups(true); // Pass `true` to signal refresh
  };

  // Apply filtering based on selectedGroupType (All Groups, Public, Private)
  const filteredGroups = groups.filter(group => {
    if (group.businessConnect === true) {
      return false; // Exclude groups with 'businessConnect' set to true
    }
    if (selectedGroupType === 'All Groups') {
      return true; // No filter, show all groups
    }
    return group.groupType === selectedGroupType; // Filter by Public or Private
  });

  // Apply search query filter
  const searchFilteredGroups = filteredGroups.filter(group =>
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#0000ff" />;
  };

  return (
    <View style={styles.container}>
      {loading && page === 1 ? ( // Show loader only during the first load
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : groups.length > 0 ? (
        <FlatList
          data={searchFilteredGroups}
          renderItem={({item}) => (
            <DisplayGroupItem item={item} title={title} />
          )}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.groupList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['blue']} // Customize the refresh control color
            />
          }
          ListFooterComponent={renderFooter}
          style={{marginVertical: 10}}
        />
      ) : (
        <Text style={styles.noGroupsText}>No groups</Text>
      )}
    </View>
  );
};

export default AllGroups;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    marginVertical: 20,
  },
  groupList: {
    paddingBottom: 50, // Extra padding at the bottom for better scrolling UX
  },
  noGroupsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',

    fontFamily: 'Lexend-Regular',
  },
});
