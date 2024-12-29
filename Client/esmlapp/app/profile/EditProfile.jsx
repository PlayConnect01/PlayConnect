import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableWithoutFeedback, Modal, FlatList } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Picker } from '@react-native-picker/picker'; // Add this import
import Navbar from '../navbar/Navbar';
import CountryPicker from 'react-native-country-picker-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Import the date picker
import { BASE_URL } from '../../api';


global.Buffer = Buffer;

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
};

const EditProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    location: '',
    profile_picture: '',
    phone_number: '',
    birthdate_day: '',
    birthdate_month: '',
    birthdate_year: '',
    phone_country_code: '+1',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        // Decode the token to get user ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        const decodedToken = JSON.parse(atob(base64));
        const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;

        const response = await axios.get(`${BASE_URL}/users/${userId}`);
        setUserData(response.data.user);

        // Set the form data with existing user data
        setFormData(prev => ({
          ...prev,
          username: response.data.user.username || '',
          email: response.data.user.email || '',
          profile_picture: response.data.user.profile_picture || '',
          phone_number: response.data.user.phone_number || '',
          phone_country_code: response.data.user.phone_country_code || '+1',
          location: response.data.user.location || '',
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate date options
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }
    
    // Validate birthdate if all fields are filled
    if (formData.birthdate_day && formData.birthdate_month && formData.birthdate_year) {
      const date = new Date(
        parseInt(formData.birthdate_year),
        parseInt(formData.birthdate_month) - 1,
        parseInt(formData.birthdate_day)
      );
      
      if (isNaN(date.getTime()) || date > new Date()) {
        newErrors.birthdate = 'Invalid birthdate';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality for smaller file size
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData(prev => ({ ...prev, profile_picture: base64Image }));
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('Error selecting image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        alert('Please log in again to continue.');
        return;
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        alert('Session expired. Please log in again.');
        return;
      }

      const userId = decodedToken.id || decodedToken.user_id || decodedToken.userId;

      console.log(userId);
      
      if (!userId) {
        throw new Error('Invalid user session. Please log in again.');
      }

      // Construct the birthdate from day, month, and year
      const { birthdate_day, birthdate_month, birthdate_year } = formData;
      const birthdate = birthdate_day && birthdate_month && birthdate_year
        ? `${birthdate_year}-${birthdate_month}-${birthdate_day}`
        : null;

      const requestData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        location: formData.location.trim() || null,
        birthdate, // Send the formatted birthdate
        phone_number: formData.phone_number,
        phone_country_code: formData.phone_country_code,
        ...(formData.profile_picture?.startsWith('data:image') && {
          profile_picture: formData.profile_picture
        })
      };

      console.log(userId);
      
      const response = await axios.put(
        `${BASE_URL}/users/${userId}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        alert('Profile updated successfully!');
        navigation.navigate('profile/ProfilePage');

      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (field, placeholder, icon, keyboardType = 'default', customStyle = {}) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={[ 
          styles.input, 
          { paddingLeft: 40 },
          errors[field] && styles.inputError,
          customStyle
        ]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        keyboardType={keyboardType}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const handleSelectDay = (day) => {
    setFormData((prev) => ({ ...prev, birthdate_day: day }));
    setShowDayPicker(false);
  };

  const handleSelectMonth = (month) => {
    setFormData((prev) => ({ ...prev, birthdate_month: month }));
    setShowMonthPicker(false);
  };

  const handleSelectYear = (year) => {
    setFormData((prev) => ({ ...prev, birthdate_year: year }));
    setShowYearPicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerContainer}>
          <Image 
            source={{ 
              uri: formData.profile_picture || 'https://via.placeholder.com/150'
            }} 
            style={styles.profileImage} 
          />
          <View style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#6F61E8" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            placeholder={userData?.username || "Name"}
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            placeholder={userData?.email || "Email"}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.phoneContainer}>
          <TouchableOpacity 
            style={styles.countryCodeContainer}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.countryCodeLabel}>{formData.phone_country_code}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder="(308) 555-0121"
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange('phone_number', value)}
            keyboardType="phone-pad"
          />
        </View>

        {showCountryPicker && (
          <CountryPicker
            visible={showCountryPicker}
            onClose={() => setShowCountryPicker(false)}
            onSelect={(country) => {
              handleInputChange('phone_country_code', `+${country.callingCode[0]}`);
              setShowCountryPicker(false);
            }}
            withFilter
            withFlag
            withCallingCode
            withEmoji
          />
        )}

        <View style={styles.addressContainer}>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </View>

        <Text style={styles.birthdayLabel}>When's your birthday?</Text>
        <View style={styles.birthdateContainer}>
          <TouchableOpacity onPress={() => setShowDayPicker(true)} style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Day"
              value={formData.birthdate_day}
              editable={false}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Month"
              value={formData.birthdate_month}
              editable={false}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowYearPicker(true)} style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Year"
              value={formData.birthdate_year}
              editable={false}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Day Picker Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showDayPicker}
          onRequestClose={() => setShowDayPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <FlatList
                data={days}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectDay(item)} style={styles.pickerItem}>
                    <Text style={styles.pickerText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Month Picker Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showMonthPicker}
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <FlatList
                data={months}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectMonth(item)} style={styles.pickerItem}>
                    <Text style={styles.pickerText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Year Picker Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={showYearPicker}
          onRequestClose={() => setShowYearPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <FlatList
                data={years}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectYear(item)} style={styles.pickerItem}>
                    <Text style={styles.pickerText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    padding: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#6F61E8',
    fontSize: 14,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    width: '30%',
  },
  countryCodeLabel: {
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  birthdayLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 16,
  },
  birthdateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '31%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6F61E8',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#bbb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerItem: {
    padding: 16,
  },
  pickerText: {
    fontSize: 18,
  },
});

export default EditProfile;