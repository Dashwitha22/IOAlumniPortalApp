import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {userApiServer} from '../../../config';
import DisplayGroupItem from './displayGroupItem';
import {IoColor1} from '../../../colorCode';

const LIMIT = 4; // Number of groups per page (adjustable)

const SuggestedGroups = ({
  profile,
  searchQuery,
  selectedGroupType,
  setIndex,
}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleGroups, setVisibleGroups] = useState(LIMIT); // Number of groups to display
  const [refreshing, setRefreshing] = useState(false);
  const [totalGroups, setTotalGroups] = useState(0);
  const [page, setPage] = useState(1);

  // Fetch groups from API
  const getGroups = async (isRefreshing = false) => {
    if (loading && !isRefreshing) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${userApiServer}/groups?page=${page}&size=${LIMIT}&userId=${profile._id}`,
      );

      // console.log('Suggested groups response : ', response.data);

      const validGroups = response.data.records.filter(
        group => !group.businessConnect, // Exclude businessConnect groups
      );

      if (isRefreshing) {
        setGroups(validGroups); // Replace groups if refreshing
      } else {
        setGroups(prevGroups => [...prevGroups, ...validGroups]); // Append new groups
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
      setPage(prevPage => prevPage + 1); // Increment the page to load more
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1); // Reset to the first page
    // setGroups([]); // Clear groups array before fetching new data
    getGroups(true); // Signal refresh
  };

  // Apply filtering based on selectedGroupType (All Groups, Public, Private)
  const filteredGroups = useMemo(() => {
    const filteredByType = groups.filter(group => {
      if (selectedGroupType === 'All Groups') return true;
      return group.groupType === selectedGroupType; // Filter by Public or Private
    });

    // Apply search query filter
    return filteredByType.filter(group =>
      group.groupName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [groups, searchQuery, selectedGroupType]);

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < filteredGroups.slice(0, visibleGroups).length; i += 2) {
      rows.push(
        <View key={i} style={styles.row}>
          <DisplayGroupItem item={filteredGroups[i]} setIndex={setIndex} />
          {filteredGroups[i + 1] && (
            <DisplayGroupItem
              item={filteredGroups[i + 1]}
              setIndex={setIndex}
            />
          )}
        </View>,
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.groupList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {filteredGroups.length === 0 ? (
            <Text style={styles.noGroupsText}>No groups found.</Text>
          ) : (
            renderRows()
          )}
          {page <= totalGroups / LIMIT && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}>
              <Text style={styles.loadMoreButtonText}>Load More</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SuggestedGroups;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupList: {
    justifyContent: 'space-between',
  },
  noGroupsText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
    fontSize: 18,
  },
  loadMoreButton: {
    backgroundColor: IoColor1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    fontFamily: 'Lexend-Regular',
    marginVertical: 5,
  },
  loadMoreButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
  },
});
