import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchMembers} from '../../store/actions/memberActions';
import MemberCard from './memberComponents/memberCard';
import {Picker} from '@react-native-picker/picker';
import {IoColor1, IoColor3} from '../../colorCode';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddMemberModal from './memberComponents/addMemberModal ';

const Members = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const allMembers = useSelector(state => state.members.members);
  const profile = useSelector(state => state.auth.user); // Get the user's profile info

  const [visibleMembers, setVisibleMembers] = useState(5); // Number of members to show initially
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query
  const [selectedRole, setSelectedRole] = useState('All Members');
  const [selectedGraduatingYear, setSelectedGraduatingYear] = useState(
    'All Graduating Years',
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState('All Departments');
  const [selectedBatch, setSelectedBatch] = useState('All Batches');
  const [loading, setLoading] = useState(true); // Local loading state
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  // Fetch members when the component is mounted
  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  const filteredMembers = useMemo(() => {
    // Perform filtering by search query and role
    const filteredBySearch = allMembers.filter(member =>
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );

    const filteredByRole = filteredBySearch.filter(member => {
      if (selectedRole === 'All Members') return true;
      if (selectedRole === 'Admin' && member.profileLevel === 1) return true;
      if (selectedRole === 'Alumni' && member.profileLevel === 2) return true;
      if (selectedRole === 'Current Student' && member.profileLevel === 3)
        return true;
      return false;
    });

    // Additional filtering by Graduating Year, Department, and Batch
    const filteredByGraduatingYear = filteredByRole.filter(member => {
      return (
        selectedGraduatingYear === 'All Graduating Years' ||
        member.graduatingYear === selectedGraduatingYear
      );
    });

    const filteredByDepartment = filteredByGraduatingYear.filter(member => {
      return (
        selectedDepartment === 'All Departments' ||
        member.department === selectedDepartment
      );
    });

    const filteredByBatch = filteredByDepartment.filter(member => {
      return selectedBatch === 'All Batches' || member.batch === selectedBatch;
    });

    return filteredByBatch;
  }, [
    allMembers,
    searchQuery,
    selectedRole,
    selectedGraduatingYear,
    selectedDepartment,
    selectedBatch,
  ]);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      await dispatch(fetchMembers());
      setLoading(false);
    };
    loadMembers();
  }, [dispatch]);

  const loadMore = () => {
    setVisibleMembers(prev => prev + 6); // Load more members
  };

  const renderRows = () => {
    // Insert the AddMemberCard as the first item if profile level matches
    const modifiedFilteredMembers =
      profile?.profileLevel === 0 || profile?.profileLevel === 1
        ? [{isAddMemberCard: true}, ...filteredMembers]
        : filteredMembers;

    const rows = [];
    for (
      let i = 0;
      i < modifiedFilteredMembers.slice(0, visibleMembers).length;
      i += 2
    ) {
      rows.push(
        <View key={i} style={styles.row}>
          {/* Render AddMemberCard if isAddMemberCard is true */}
          {modifiedFilteredMembers[i]?.isAddMemberCard ? (
            <TouchableOpacity
              key="addMember"
              style={styles.addMemberCard}
              onPress={() => setIsModalVisible(true)}>
              <Icon name="user-plus" size={50} color={IoColor1} />
            </TouchableOpacity>
          ) : (
            <MemberCard
              key={modifiedFilteredMembers[i]._id}
              member={modifiedFilteredMembers[i]}
            />
          )}

          {/* Render the second card in the row if it exists */}
          {modifiedFilteredMembers[i + 1] &&
            !modifiedFilteredMembers[i + 1]?.isAddMemberCard && (
              <MemberCard
                key={modifiedFilteredMembers[i + 1]._id}
                member={modifiedFilteredMembers[i + 1]}
              />
            )}
        </View>,
      );
    }
    return rows;
  };

  const generateGraduatingYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1925; i--) {
      years.push(i.toString());
    }
    return years;
  };

  // Generate years function adapted for React Native
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i >= currentYear - 100; i--) {
      years.push(`${i} - ${i + 1}`);
    }
    return years;
  };

  const refreshMembers = () => {
    dispatch(fetchMembers()); // Reload members
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for members"
        placeholderTextColor="gray"
        value={searchQuery}
        onChangeText={setSearchQuery} // Update search query state on input change
      />

      {/* AddMemberModal */}
      <AddMemberModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        profile={profile}
        refreshMembers={refreshMembers} // Added this
      />

      {/* Dropdown for role filtering */}
      <View style={styles.rowWrapper}>
        <View style={[styles.dropdownWrapper, styles.halfWidth]}>
          <Picker
            selectedValue={selectedRole}
            style={styles.dropdown}
            onValueChange={(itemValue, itemIndex) => setSelectedRole(itemValue)}
            dropdownIconColor="black">
            <Picker.Item
              label="All Members"
              value="All Members"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Admin"
              value="Admin"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Alumni"
              value="Alumni"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Current Student"
              value="Current Student"
              style={styles.pickerText}
            />
          </Picker>
        </View>
        <View style={[styles.dropdownWrapper, styles.halfWidth]}>
          <Picker
            selectedValue={selectedGraduatingYear}
            style={styles.dropdown}
            onValueChange={value => setSelectedGraduatingYear(value)}
            dropdownIconColor="black">
            <Picker.Item
              label="All Graduating Years"
              value="All Graduating Years"
              style={styles.pickerText}
            />
            {generateGraduatingYears().map(year => (
              <Picker.Item
                key={year}
                label={year}
                value={year}
                style={styles.pickerText}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Dropdown for department and batch */}
      <View style={styles.rowWrapper}>
        <View style={[styles.dropdownWrapper, styles.halfWidth]}>
          <Picker
            selectedValue={selectedDepartment}
            style={styles.dropdown}
            onValueChange={value => setSelectedDepartment(value)}
            dropdownIconColor="black">
            <Picker.Item
              label="All Departments"
              value="All Departments"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Agricultural"
              value="Agricultural"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Gastroenterology"
              value="Gastroenterology"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Neurosurgery"
              value="Neurosurgery"
              style={styles.pickerText}
            />
            <Picker.Item
              label="Human Languages"
              value="Human Languages"
              style={styles.pickerText}
            />
          </Picker>
        </View>
        <View style={[styles.dropdownWrapper, styles.halfWidth]}>
          <Picker
            selectedValue={selectedBatch}
            style={styles.dropdown}
            onValueChange={value => setSelectedBatch(value)}
            dropdownIconColor="black">
            <Picker.Item
              label="All Batches"
              value="All Batches"
              style={styles.pickerText}
            />
            {generateYears().map(year => (
              <Picker.Item
                key={year}
                label={year}
                value={year}
                style={styles.pickerText}
              />
            ))}
          </Picker>
        </View>
      </View>

      <Text style={styles.header}>All Members (alumni/current)</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredMembers.length === 0 ? (
            <Text style={styles.noResultsText}>No members found.</Text>
          ) : (
            renderRows()
          )}
          {visibleMembers < filteredMembers.length && (
            <TouchableOpacity
              style={{
                backgroundColor: IoColor1,
                padding: 10,
              }}
              onPress={loadMore}>
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontFamily: 'Lexend-Regular',
                }}>
                Load More
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Members;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  searchBar: {
    height: 40,
    color: 'black',
    borderColor: '#004C8A',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    fontFamily: 'Lexend-Regular',
  },
  dropdownWrapper: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#004C8A',
    backgroundColor: IoColor3,
    borderRadius: 8,
    height: 40,
    marginBottom: 10,
  },
  dropdown: {
    color: 'black',
    fontFamily: 'Lexend-Regular',
  },
  rowWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  pickerText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
  },
  header: {
    fontSize: 16,
    fontFamily: 'Lexend-Regular',
    marginBottom: 16,
    color: 'black',
  },
  listContainer: {
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noResultsText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontSize: 18,
    fontFamily: 'Lexend-Regular',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  addMemberCard: {
    width: '48%',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: IoColor1,
    borderStyle: 'dotted',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  addMemberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a98de3',
  },
});
