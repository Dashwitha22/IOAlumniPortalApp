import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-picker/picker';
import {useSelector} from 'react-redux';
import SuggestedGroups from './groupsComponents/suggestedGroups';
import JoinedGroups from './groupsComponents/joinedGroups';
import AllGroups from './groupsComponents/allGroups';
import {IoColor3} from '../../colorCode';

const screenWidth = Dimensions.get('window').width;

const Groups = () => {
  // Get logged-in user's profile from the store
  const user = useSelector(state => state.auth.user);
  const profile = user ? user : {}; // Add null check here

  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }
  const [index, setIndex] = useState(0);
  const [routes] = useState(
    admin
      ? [{key: 'allGroups', title: 'All Groups'}]
      : [
          {key: 'suggestedGroups', title: 'Suggested Groups'},
          {key: 'joinedGroups', title: 'Joined Groups'},
        ],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('All Groups');

  const JoinedGroupsTab = () => (
    <JoinedGroups
      profile={profile}
      searchQuery={searchQuery}
      selectedGroupType={selectedGroupType}
    />
  );
  const SuggestedGroupsTab = () => (
    <SuggestedGroups
      profile={profile}
      searchQuery={searchQuery}
      selectedGroupType={selectedGroupType}
      setIndex={setIndex}
    />
  );
  const AllGroupsTab = () => (
    <AllGroups
      profile={profile}
      searchQuery={searchQuery}
      selectedGroupType={selectedGroupType}
    />
  );

  const renderScene = SceneMap({
    allGroups: AllGroupsTab,
    suggestedGroups: SuggestedGroupsTab,
    joinedGroups: JoinedGroupsTab,
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.header}>
          <Icon name="group" size={30} color="black" />
          <Text style={styles.headerText}>Groups</Text>
        </View>
        <View style={styles.horizontalLine}></View>

        {/* Search Bar and Dropdown in the same row */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for groups"
              placeholderTextColor="gray"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
            <Icon
              name="search"
              size={25}
              color="#004C8A"
              style={styles.searchIcon}
            />
          </View>
          <View style={styles.dropdownWrapper}>
            <Picker
              selectedValue={selectedGroupType}
              style={styles.picker}
              dropdownIconColor="black"
              onValueChange={itemValue => setSelectedGroupType(itemValue)}>
              <Picker.Item
                label="All Groups"
                value="All Groups"
                style={styles.pickerText}
              />
              <Picker.Item
                label="Public"
                value="Public"
                style={styles.pickerText}
              />
              <Picker.Item
                label="Private"
                value="Private"
                style={styles.pickerText}
              />
            </Picker>
          </View>
        </View>
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: screenWidth}}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={styles.indicator}
              style={styles.tabBar}
              renderLabel={({route, focused}) => (
                <Text
                  style={[focused ? styles.activeLabel : styles.labelStyle]}>
                  {route.title}
                </Text>
              )}
            />
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Groups;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  // searchContainer: {
  //   // flexDirection: 'row',
  //   // justifyContent: 'space-between',
  //   padding: 5,
  //   backgroundColor: 'white',
  //   marginVertical: 10,
  // },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    color: 'black',
    borderColor: '#004C8A',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    marginHorizontal: 10,
  },
  searchInput: {
    padding: 5,
    paddingLeft: 10,
    width: '55%',
    fontSize: 13,
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  searchIcon: {
    position: 'absolute',
    right: 10,
  },
  dropdownWrapper: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#004C8A',
    backgroundColor: IoColor3,
    borderRadius: 8,

    height: 40,
    marginBottom: 16,
    marginHorizontal: 10,
  },
  picker: {
    width: '100%',
    color: 'black',
  },
  pickerText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: 'white',
  },
  indicator: {
    backgroundColor: 'black',
  },
  labelStyle: {
    color: 'black',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
  activeLabel: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Lexend-Regular',
  },
});
