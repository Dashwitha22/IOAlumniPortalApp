// BusinessConnectTab.js
import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {userApiServer} from '../../../config';
import DisplayGroupItem from '../groupsComponents/displayGroupItem';

const BusinessConnectTab = () => {
  const title = 'SuggestedGroups';
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const profile = useSelector(state => state.auth.user);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${userApiServer}/groups/groups/businessConnect`,
      );
      setGroups(response.data.businessConnect);
    } catch (error) {
      console.error('Error fetching business connect groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#301C58" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groups.map(group => (
        <DisplayGroupItem key={group._id} title={title} item={group} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BusinessConnectTab;
