import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import Navbar from '../navbar/Navbar';
global.Buffer = Buffer;

// Country codes data with names
const COUNTRY_CODES = [
  { code: '+1', name: 'United States' },
  { code: '+1', name: 'Canada' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+33', name: 'France' },
  { code: '+49', name: 'Germany' },
  { code: '+34', name: 'Spain' },
  { code: '+39', name: 'Italy' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
  { code: '+91', name: 'India' },
  { code: '+61', name: 'Australia' },
  { code: '+64', name: 'New Zealand' },
  { code: '+216', name: 'Tunisia' },
  { code: '+971', name: 'UAE' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+20', name: 'Egypt' },
  { code: '+27', name: 'South Africa' },
  { code: '+55', name: 'Brazil' },
  { code: '+52', name: 'Mexico' },
  { code: '+65', name: 'Singapore' },
].sort((a, b) => a.name.localeCompare(b.name));

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

const EditProfile = ({ route, navigation }) => {
  const userData = route?.params?.userData || {};
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [formData, setFormData] = useState({
    username: userData.username || '',
    email: userData.email || '',
    location: userData.location || '',
    profile_picture: userData.profile_picture || '',
    phone_number: userData.phone_number || '',
    birthdate_day: userData.birthdate ? new Date(userData.birthdate).getDate().toString() : '',
    birthdate_month: userData.birthdate ? (new Date(userData.birthdate).getMonth() + 1).toString() : '',
    birthdate_year: userData.birthdate ? new Date(userData.birthdate).getFullYear().toString() : '',
    phone_country_code: userData.phone_country_code || '+1',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        quality: 0.1,
        base64: true,
        exif: false,
        width: 300,
        height: 300,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        const approximateSize = base64Image.length * 0.75 / 1024 / 1024;
        
        if (approximateSize > 1) {
          alert('Image file is too large. Please choose a smaller image.');
          return;
        }

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

      const birthdate = formData.birthdate_year && formData.birthdate_month && formData.birthdate_day
        ? `${formData.birthdate_year}-${String(formData.birthdate_month).padStart(2, '0')}-${String(formData.birthdate_day).padStart(2, '0')}`
        : null;

      const requestData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        location: formData.location.trim() || null,
        birthdate,
        phone_number: formData.phone_number,
        phone_country_code: formData.phone_country_code,
        ...(formData.profile_picture?.startsWith('data:image') && {
          profile_picture: formData.profile_picture
        })
      };

      console.log(userId);
      
      const response = await axios.put(
        `http://192.168.104.10:3000/users/${userId}`,
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
        navigation.navigate('Profile');
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" style={styles.backIcon} />
        </TouchableWithoutFeedback>

        <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerContainer}>
          <Image 
            source={{ 
              uri: formData.profile_picture || 
              'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' 
            }} 
            style={styles.profileImage} 
          />
          <View style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#6F61E8" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </View>
        </TouchableOpacity>

        {renderInput('username', 'Username', 'person-outline')}
        {renderInput('email', 'Email', 'mail-outline', 'email-address')}
        {renderInput('location', 'Location', 'location-outline')}

        <View style={styles.phoneContainer}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.phoneIcon} />
          <TouchableOpacity 
            style={styles.countryCodeButton}
            onPress={() => setShowCountryPicker(!showCountryPicker)}
          >
            <Text>{formData.phone_country_code}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <TextInput
            style={[ 
              styles.input, 
              { flex: 1, marginLeft: 10 },
              errors.phone_number && styles.inputError 
            ]}
            placeholder="Phone Number"
            value={formData.phone_number}
            onChangeText={(value) => handleInputChange('phone_number', value)}
            keyboardType="phone-pad"
          />
        </View>

        {showCountryPicker && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.phone_country_code}
              style={styles.picker}
              onValueChange={(itemValue) => {
                handleInputChange('phone_country_code', itemValue);
                setShowCountryPicker(false);
              }}
            >
              {COUNTRY_CODES.map((country) => (
                <Picker.Item 
                  key={`${country.code}-${country.name}`}
                  label={`${country.name} (${country.code})`}
                  value={country.code}
                />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.birthdateContainer}>
          <Ionicons name="calendar-outline" size={20} color="#666" style={styles.calendarIcon} />
          <View style={styles.dateContainer}>
            <TextInput
              style={[styles.dateInput, errors.birthdate && styles.inputError]}
              placeholder="DD"
              keyboardType="numeric"
              value={formData.birthdate_day}
              onChangeText={(value) => handleInputChange('birthdate_day', value)}
              maxLength={2}
            />
            <TextInput
              style={[styles.dateInput, errors.birthdate && styles.inputError]}
              placeholder="MM"
              keyboardType="numeric"
              value={formData.birthdate_month}
              onChangeText={(value) => handleInputChange('birthdate_month', value)}
              maxLength={2}
            />
            <TextInput
              style={[styles.dateInput, errors.birthdate && styles.inputError]}
              placeholder="YYYY"
              keyboardType="numeric"
              value={formData.birthdate_year}
              onChangeText={(value) => handleInputChange('birthdate_year', value)}
              maxLength={4}
            />
          </View>
          {errors.birthdate && (
            <Text style={[styles.errorText, { marginTop: 5 }]}>{errors.birthdate}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
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
  inputContainer: {
    width: '90%',
    marginVertical: 10,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    top: 9,
    left: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginVertical: 10,
  },
  phoneIcon: {
    position: 'absolute',
    top: 9,
    left: 10,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#F1F1F1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    padding: 10,
  },
  picker: {
    width: '100%',
    height: 150,
  },
  birthdateContainer: {
    width: '90%',
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    position: 'absolute',
    top: 9,
    left: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
  },
  dateInput: {
    width: '30%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    fontSize: 16,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#6F61E8',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#bbb',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  backIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
});

export default EditProfile;