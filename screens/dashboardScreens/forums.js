import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import SearchIcon from 'react-native-vector-icons/FontAwesome';
import {Picker} from '@react-native-picker/picker';
import {userApiServer} from '../../config';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import IndividualForum from './forumsComponents/individualForum';
import RenderHtml from 'react-native-render-html';

const Forums = ({navigation}) => {
  const [selectedSort, setSelectedSort] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [forumsData, setForumsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeForum, setActiveForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const profile = useSelector(state => state.auth.user);

  // Inside your Forums component (after your state declarations), add:
  const {width} = useWindowDimensions();

  // Fetch forums data from the API
  const fetchForums = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${userApiServer}/forums`); // Replace with your API endpoint
      const data = response.data.forums;

      let filteredForums = [];

      // Apply department-based filtering
      if (profile.profileLevel === 0) {
        // Superadmin can see all forums
        filteredForums = data;
      } else {
        // Filter based on department or 'All'
        filteredForums = data.filter(
          forum =>
            forum.department === profile.department ||
            forum.department === 'All',
        );
      }
      setForumsData(filteredForums);
      setFilteredData(filteredForums);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forums:', error);
      setLoading(false);
    }
  };

  // Refresh data when the component is focused
  useFocusEffect(
    useCallback(() => {
      fetchForums();
    }, [profile.department]),
  );

  // Filter and sort forums
  const handleSearchAndSort = () => {
    let updatedData = [...forumsData];

    if (searchQuery) {
      updatedData = updatedData.filter(forum =>
        forum.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedSort === 'Most popular') {
      updatedData.sort((a, b) => b.members.length - a.members.length);
    } else if (selectedSort === 'Most recent') {
      updatedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredData(updatedData);
  };

  // Trigger filtering and sorting when inputs change
  React.useEffect(() => {
    handleSearchAndSort();
  }, [searchQuery, selectedSort, forumsData]);

  if (activeForum) {
    return (
      <IndividualForum
        forum={activeForum}
        onBack={() => setActiveForum(null)}
      />
    );
  }

  // const data = [
  //   {title: 'Gastro private', description: 's', type: 'Private', members: 1},
  //   {
  //     title: 'Friend2 private gastro',
  //     description: 'Sample',
  //     type: 'Private',
  //     members: 1,
  //   },
  //   {
  //     title: 'gastro private forum',
  //     description: 'Sample',
  //     type: 'Private',
  //     members: 2,
  //   },
  //   {
  //     title: 'Gastro public forum',
  //     description: 'sam',
  //     type: 'Public',
  //     members: 1,
  //   },
  //   {
  //     title: 'Gastro public forum',
  //     description: 'sample',
  //     type: 'Public',
  //     members: 1,
  //   },
  // ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <TextInput
            placeholder="Search for topics"
            placeholderTextColor="#000"
            value={searchQuery}
            style={{color: 'black'}}
            onChangeText={text => setSearchQuery(text)} // Update search query
          />
          <SearchIcon
            name="search"
            color="#517fa4"
            size={15}
            style={styles.searchIcon}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSort}
            style={styles.picker}
            onValueChange={itemValue => setSelectedSort(itemValue)}
            dropdownIconColor="black">
            <Picker.Item label="Sort by" value="" />
            <Picker.Item label="Most popular" value="Most popular" />
            <Picker.Item label="Most recent" value="Most recent" />
          </Picker>
        </View>
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateForum')}>
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>
      <ScrollView style={styles.verticalScroll}>
        <ScrollView horizontal>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.columnTitle]}>Title</Text>
              <Text style={[styles.headerText, styles.columnDescription]}>
                Description
              </Text>
              <Text style={[styles.headerText, styles.columnType]}>Type</Text>
              <Text style={[styles.headerText, styles.columnMembers]}>
                Members
              </Text>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : filteredData.length ? (
              filteredData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <TouchableOpacity
                    style={styles.columnTitle}
                    onPress={() => setActiveForum(item)}>
                    <Text style={[styles.rowText, {fontWeight: '600'}]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                  <View style={[styles.columnDescription]}>
                    <RenderHtml
                      contentWidth={width}
                      source={{html: item.description}}
                      baseStyle={styles.rowText}
                    />
                  </View>
                  <Text style={[styles.rowText, styles.columnType]}>
                    {item.type}
                  </Text>
                  <Text style={[styles.rowText, styles.columnMembers]}>
                    {item.members.length}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No forums posted</Text>
            )}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default Forums;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    width: '60%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    height: 40,
    fontFamily: 'Lexend-Regular',
  },
  searchIcon: {
    position: 'absolute',
    top: 10,
    right: 5,
    marginHorizontal: 8,
  },
  pickerContainer: {
    width: '40%',
    height: 40,
    borderColor: '#00796b',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '#e9f5ef',
  },
  picker: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  createButton: {
    backgroundColor: '#136175',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  createButtonText: {
    color: '#fff',
    fontFamily: 'Lexend-Regular',
  },
  verticalScroll: {
    flex: 1,
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    // backgroundColor: '#e9f5ef',
    // borderBottomWidth: 2,
    // borderColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#000',
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    marginRight: 2,
    backgroundColor: '#e9f5ef',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
  },
  rowText: {
    color: 'black',
    paddingHorizontal: 8,
    textAlign: 'center',
    marginRight: 2,
  },
  columnTitle: {width: 120, fontWeight: '700'},
  columnDescription: {width: 150},
  columnType: {width: 100},
  columnMembers: {width: 80},

  // touchableTitle: {fontWeight: 'bold', color: '#007acc'},
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
});
