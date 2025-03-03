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

const LIMIT = 4; // Number of groups per page

const JoinedGroups = ({profile, searchQuery, selectedGroupType}) => {
  const profileId = profile ? profile._id : null;
  console.log('Fetching groups for profileId:', profileId);
  const [groups, setGroups] = useState([]); // Group state
  const [page, setPage] = useState(1); // Pagination page state
  const [totalGroups, setTotalGroups] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleGroups, setVisibleGroups] = useState(LIMIT); // Number of groups to display

  // Fetch groups from API
  const getGroups = async (isRefreshing = false) => {
    if (loading && !isRefreshing) return; // Prevent multiple requests at the same time
    setLoading(true);
    try {
      const response = await axios.get(
        `${userApiServer}/groups/joined?page=${page}&size=${LIMIT}&userId=${profileId}`,
      );

      // console.log('Joined groups response : ', response.data);
      const newGroups = response.data.records;

      if (isRefreshing) {
        setGroups(newGroups); // Reset the group list on refresh
      } else {
        setGroups(prevItems => [...prevItems, ...newGroups]); // Append new groups to the existing list
      }

      setTotalGroups(response.data.total); // Total groups available in API
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load groups on page change
  useEffect(() => {
    getGroups();
  }, [page]);

  // Handle loading more groups
  const handleLoadMore = () => {
    if (visibleGroups < totalGroups) {
      setPage(page + 1); // Load more data from the next page
      setVisibleGroups(prev => prev + LIMIT); // Update the visible group count
    }
  };

  // Refresh groups
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1); // Reset to the first page
    getGroups(true); // Refresh the data
  };

  // Apply filtering based on selectedGroupType (All Groups, Public, Private)
  const filteredGroups = useMemo(() => {
    if (!searchQuery && !selectedGroupType) {
      return groups; // Return all groups if filtering params are null
    }
    const filteredByType = groups.filter(group => {
      if (selectedGroupType === 'All Groups') return true;
      return group.groupType === selectedGroupType;
    });

    // Apply search query filter
    return filteredByType.filter(group =>
      group.groupName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [groups, searchQuery, selectedGroupType]);

  // Render groups in rows of two, similar to SuggestedGroups
  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < filteredGroups.slice(0, visibleGroups).length; i += 2) {
      rows.push(
        <View key={i} style={styles.row}>
          <DisplayGroupItem item={filteredGroups[i]} />
          {filteredGroups[i + 1] && (
            <DisplayGroupItem item={filteredGroups[i + 1]} />
          )}
        </View>,
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {loading ? (
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
          {visibleGroups < filteredGroups.length && (
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

export default JoinedGroups;

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
    marginVertical: 5,
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
