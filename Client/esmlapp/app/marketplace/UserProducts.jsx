import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const CustomAlert = ({ visible, title, message, buttons, onClose }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.alertOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{title}</Text>
              </View>
              <View style={styles.alertBody}>
                <Text style={styles.alertMessage}>{message}</Text>
              </View>
              <View style={styles.alertFooter}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alertButton,
                      button.style === 'cancel' && styles.alertCancelButton,
                      button.style === 'destructive' && styles.alertDestructiveButton,
                      button.style === 'default' && styles.alertDefaultButton,
                    ]}
                    onPress={button.onPress}
                  >
                    <Text
                      style={[
                        styles.alertButtonText,
                        button.style === 'cancel' && styles.alertCancelButtonText,
                        button.style === 'destructive' && styles.alertDestructiveButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const DeleteConfirmationModal = ({ visible, product, onClose, onConfirm }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalIconContainer}>
            <MaterialIcons name="warning" size={40} color="#EF4444" />
          </View>
          
          <Text style={styles.deleteModalTitle}>Delete Product</Text>
          
          <Text style={styles.deleteModalMessage}>
            Are you sure you want to delete "{product?.name}"? This action cannot be undone.
          </Text>

          <View style={styles.deleteModalImageContainer}>
            <Image
              source={{ uri: product?.image_url || 'https://via.placeholder.com/150' }}
              style={styles.deleteModalImage}
            />
            <View style={styles.deleteModalProductInfo}>
              <Text style={styles.deleteModalProductName} numberOfLines={2}>
                {product?.name}
              </Text>
              <Text style={styles.deleteModalProductPrice}>
                ${parseFloat(product?.price).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteModalCancelButton]}
              onPress={onClose}
            >
              <Text style={styles.deleteModalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteModalDeleteButton]}
              onPress={onConfirm}
            >
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.deleteModalDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const FormInput = memo(({ label, icon, value, onChangeText, placeholder, keyboardType = "default", multiline = false, numberOfLines = 1 }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon && (
        <MaterialIcons 
          name={icon} 
          size={20} 
          color="#718096" 
          style={styles.inputIcon}
        />
      )}
      <TextInput
        style={[
          styles.input,
          icon && styles.inputWithIcon,
          value && styles.inputFilled,
          multiline && styles.textArea
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#A0AEC0"
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  </View>
));

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sports, setSports] = useState([]);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'update'
  const [isSportsModalVisible, setIsSportsModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    sport_id: '',
    discount: '0',
    product_id: ''
  });
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const id = await AsyncStorage.getItem('user_id');
        console.log('Loaded auth data:', { token, id });
        setAuthToken(token);
        setUserId(id);
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserProducts();
    }
  }, [userId]);

  useEffect(() => {
    fetchSports();
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to upload images!');
      }
    })();
  }, []);

  const fetchUserProducts = async () => {
    try {
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await axios.get(`${BASE_URL}/userproduct/user/${userId}`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showAlert(
        'Error',
        'Failed to fetch products',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/sports`);
      setSports(response.data);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const user_id = await AsyncStorage.getItem('user_id');

      if (!token || !user_id) {
        showAlert(
          'Error',
          'Please log in to continue',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      if (!formData.name || !formData.price || !selectedSport) {
        showAlert(
          'Missing Fields',
          'Please fill in all required fields (*)',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      setLoading(true);

      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        price: parseFloat(formData.price),
        image_url: formData.image_url || '',
        sport_id: selectedSport.sport_id,
        user_id: parseInt(user_id),
        discount: parseFloat(formData.discount || '0')
      };

      if (modalMode === 'add') {
        await axios.post(
          `${BASE_URL}/userproduct`,
          productData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        await axios.put(
          `${BASE_URL}/userproduct/${formData.product_id}`,
          productData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      setIsModalVisible(false);
      fetchUserProducts();
      showAlert(
        'Success',
        `Product ${modalMode === 'add' ? 'added' : 'updated'} successfully!`,
        [{ text: 'OK', style: 'default' }]
      );
      resetForm();
    } catch (error) {
      console.error('Submit error:', error.response || error);
      showAlert(
        'Error',
        error.response?.data?.message || 'Failed to save product. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    resetForm();
    setIsModalVisible(false);
  };

  const ProductModal = () => {
    const pickImage = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert(
            'Permission needed',
            'Gallery permission is required to choose photos',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          setLoading(true);
          const asset = result.assets[0];
          const imageUri = asset.uri;
          const base64Data = asset.base64;
          
          // Create form data with base64
          const formData = new FormData();
          formData.append('image', {
            uri: `data:image/jpeg;base64,${base64Data}`,
            type: 'image/jpeg',
            name: 'photo.jpg'
          });

          // Upload directly here instead of calling handleImageUpload
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            throw new Error('Authentication required');
          }

          const response = await axios.post(
            `${BASE_URL}/upload`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
              },
              timeout: 60000,
            }
          );

          if (response.data && response.data.url) {
            setFormData(prev => ({...prev, image_url: response.data.url}));
          } else {
            throw new Error('Invalid response from server');
          }

          setLoading(false);
        }
      } catch (error) {
        console.error('Image picker error:', error);
        showAlert(
          'Error',
          'Failed to upload image. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
        setLoading(false);
      }
    };

    const takePhoto = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showAlert(
            'Permission needed',
            'Camera permission is required to take photos',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          setLoading(true);
          const asset = result.assets[0];
          const imageUri = asset.uri;
          const base64Data = asset.base64;
          
          // Create form data with base64
          const formData = new FormData();
          formData.append('image', {
            uri: `data:image/jpeg;base64,${base64Data}`,
            type: 'image/jpeg',
            name: 'photo.jpg'
          });

          // Upload directly here instead of calling handleImageUpload
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            throw new Error('Authentication required');
          }

          const response = await axios.post(
            `${BASE_URL}/upload`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
              },
              timeout: 60000,
            }
          );

          if (response.data && response.data.url) {
            setFormData(prev => ({...prev, image_url: response.data.url}));
          } else {
            throw new Error('Invalid response from server');
          }

          setLoading(false);
        }
      } catch (error) {
        console.error('Camera error:', error);
        showAlert(
          'Error',
          'Failed to upload photo. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
        setLoading(false);
      }
    };

    const handleInputChange = useCallback((field, value) => {
      if (field === 'discount') {
        const discount = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
        setFormData(prev => ({...prev, [field]: discount.toString()}));
      } else {
        setFormData(prev => ({...prev, [field]: value}));
      }
    }, []);

    return (
      <Modal
        visible={isModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {modalMode === 'add' ? 'Add New Product' : 'Update Product'}
                  </Text>
                  <TouchableOpacity onPress={handleModalClose}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formContainer}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardDismissMode="on-drag"
                >
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderIcon}>
                        <MaterialIcons name="info-outline" size={24} color="#4FA5F5" />
                      </View>
                      <Text style={styles.sectionHeaderText}>Product Information</Text>
                    </View>
                    <Text style={styles.formSectionDescription}>
                      Fill in the details about your product. Fields marked with * are required.
                    </Text>
                  </View>

                  <FormInput
                    label="Product Name *"
                    icon="shopping-bag"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="Enter product name"
                  />

                  <FormInput
                    label="Price *"
                    icon="attach-money"
                    value={formData.price}
                    onChangeText={(text) => handleInputChange('price', text)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />

                  <FormInput
                    label="Discount (%)"
                    icon="local-offer"
                    value={formData.discount}
                    onChangeText={(text) => handleInputChange('discount', text)}
                    placeholder="Enter discount percentage"
                    keyboardType="decimal-pad"
                  />

                  <FormInput
                    label="Description"
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    placeholder="Enter product description"
                    multiline={true}
                    numberOfLines={4}
                  />

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Category *</Text>
                    <TouchableOpacity 
                      style={[
                        styles.categoryButton,
                        selectedSport && styles.categoryButtonSelected
                      ]}
                      onPress={() => setIsSportsModalVisible(true)}
                    >
                      <View style={styles.categoryButtonContent}>
                        <MaterialIcons 
                          name="category" 
                          size={20} 
                          color={selectedSport ? '#4FA5F5' : '#718096'} 
                        />
                        <Text style={[
                          styles.categoryButtonText,
                          selectedSport && styles.categoryButtonTextSelected
                        ]}>
                          {selectedSport ? selectedSport.name : 'Select Sport Category'}
                        </Text>
                      </View>
                      <MaterialIcons 
                        name="arrow-drop-down" 
                        size={24} 
                        color={selectedSport ? '#4FA5F5' : '#718096'} 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderIcon}>
                        <MaterialIcons name="photo-library" size={24} color="#4FA5F5" />
                      </View>
                      <Text style={styles.sectionHeaderText}>Product Image</Text>
                    </View>
                    
                    {formData.image_url ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: formData.image_url }}
                          style={styles.previewImage}
                        />
                        <View style={styles.imageOverlay}>
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => setFormData(prev => ({...prev, image_url: ''}))}
                          >
                            <MaterialIcons name="close" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.imageUploadContainer}>
                        <View style={styles.uploadButtons}>
                          <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={pickImage}
                          >
                            <MaterialIcons name="photo-library" size={24} color="#4FA5F5" />
                            <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={takePhoto}
                          >
                            <MaterialIcons name="photo-camera" size={24} color="#4FA5F5" />
                            <Text style={styles.uploadButtonText}>Take Photo</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.formFooter}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleModalClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      (!formData.name || !formData.price || !selectedSport) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!formData.name || !formData.price || !selectedSport}
                  >
                    <Text style={styles.submitButtonText}>
                      {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    );
  }; // End of ProductModal

  const renderItem = useCallback(({ item }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productOverlay}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            ${parseFloat(item.price).toFixed(2)}
            {item.discount > 0 && (
              <Text style={styles.discountTag}> -{item.discount}%</Text>
            )}
          </Text>
          {item.sport && (
            <View style={styles.sportTag}>
              <MaterialIcons name="sports" size={16} color="#fff" />
              <Text style={styles.sportText}>{item.sport.name}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleUpdate(item)}
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleUpdate, handleDelete]);

  const handleUpdate = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      sport_id: product.sport?.sport_id?.toString() || '',
      discount: product.discount?.toString() || '0',
      product_id: product.product_id
    });
    setSelectedSport(product.sport || null);
    setSelectedProduct(product);
    setModalMode('update');
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      sport_id: '',
      discount: '0',
      product_id: ''
    });
    setSelectedSport(null);
    setSelectedProduct(null);
    setModalMode('add');
  };

  const handleAddNew = () => {
    resetForm();
    setModalMode('add');
    setIsModalVisible(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete || !productToDelete.product_id) {
      showAlert('Error', 'Invalid product selected for deletion', [{ text: 'OK', style: 'default' }]);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const user_id = await AsyncStorage.getItem('user_id');
      
      if (!token || !user_id) {
        showAlert('Error', 'Please log in to continue', [{ text: 'OK', style: 'default' }]);
        return;
      }

      await axios.delete(
        `${BASE_URL}/userproduct/${productToDelete.product_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            user_id: parseInt(user_id)
          }
        }
      );

      setDeleteModalVisible(false);
      setProductToDelete(null);
      await fetchUserProducts();
      showAlert('Success', 'Product deleted successfully!', [{ text: 'OK', style: 'default' }]);
    } catch (error) {
      console.error('Error deleting product:', error);
      let errorMessage = 'Failed to delete product. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your data and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to continue.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to delete this product.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Product not found. It may have been already deleted.';
      }
      
      showAlert('Error', errorMessage, [{ text: 'OK', style: 'default' }]);
    } finally {
      setLoading(false);
    }
  };

  const SportSelectionModal = memo(() => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSports, setFilteredSports] = useState(sports);

    useEffect(() => {
      if (searchQuery.trim() === '') {
        setFilteredSports(sports);
      } else {
        const filtered = sports.filter(sport => 
          sport.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSports(filtered);
      }
    }, [searchQuery]);

    const sportStyles = {
      'Gym': { icon: 'fitness-center', color: '#FF6B6B', bgColor: '#FFE8E8', gradient: ['#FF6B6B', '#FF8E8E'] },
      'Cricket': { icon: 'sports-cricket', color: '#4ECDC4', bgColor: '#E8F8F7', gradient: ['#4ECDC4', '#6EE7E0'] },
      'Rowing': { icon: 'rowing', color: '#45B7D1', bgColor: '#E6F6FA', gradient: ['#45B7D1', '#67D5EF'] },
      'Skating': { icon: 'skateboarding', color: '#96C93D', bgColor: '#F0F7E6', gradient: ['#96C93D', '#B1E150'] },
      'E-Sports': { icon: 'sports-esports', color: '#845EC2', bgColor: '#F1EAFA', gradient: ['#845EC2', '#A17ED8'] },
      'Trophies': { icon: 'emoji-events', color: '#FFB800', bgColor: '#FFF8E6', gradient: ['#FFB800', '#FFCC33'] },
      'Walking': { icon: 'directions-walk', color: '#00C9A7', bgColor: '#E6F8F5', gradient: ['#00C9A7', '#1EEBC6'] },
      'Football': { icon: 'sports-football', color: '#FF9671', bgColor: '#FFE8E3', gradient: ['#FF9671', '#FFB499'] },
      'Basketball': { icon: 'sports-basketball', color: '#FFC75F', bgColor: '#FFF4E6', gradient: ['#FFC75F', '#FFD68A'] },
      'Baseball': { icon: 'sports-baseball', color: '#F9F871', bgColor: '#FAFDE6', gradient: ['#F9F871', '#FBFA9E'] },
      'Hockey': { icon: 'sports-hockey', color: '#C34A36', bgColor: '#FAE8E6', gradient: ['#C34A36', '#E65D45'] },
      'MMA': { icon: 'sports-mma', color: '#FF8066', bgColor: '#FFE8E6', gradient: ['#FF8066', '#FFA28F'] },
      'Tennis': { icon: 'sports-tennis', color: '#4FA5F5', bgColor: '#E6F0FA', gradient: ['#4FA5F5', '#72B9F7'] }
    };

    const handleSearch = useCallback((text) => {
      setSearchQuery(text);
    }, []);

    const clearSearch = () => {
      setSearchQuery('');
      Keyboard.dismiss();
    };

    return (
      <Modal
        visible={isSportsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSportsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.sportModalContainer}>
              <View style={styles.sportModalHeader}>
                <Text style={styles.sportModalTitle}>Select Sport Category</Text>
                <TouchableOpacity 
                  style={styles.sportModalCloseButton}
                  onPress={() => setIsSportsModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#4A5568" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.sportModalSearchContainer}>
                <MaterialIcons name="search" size={20} color="#718096" style={styles.sportModalSearchIcon} />
                <TextInput
                  style={styles.sportModalSearchInput}
                  placeholder="Search sports..."
                  placeholderTextColor="#A0AEC0"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.sportModalSearchClear}
                    onPress={clearSearch}
                  >
                    <MaterialIcons name="close" size={20} color="#A0AEC0" />
                  </TouchableOpacity>
                )}
              </View>

              {filteredSports.length === 0 ? (
                <View style={styles.sportModalEmptyState}>
                  <MaterialIcons name="search-off" size={48} color="#A0AEC0" />
                  <Text style={styles.sportModalEmptyStateTitle}>No Sports Found</Text>
                  <Text style={styles.sportModalEmptyStateText}>
                    Try searching with different keywords
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredSports}
                  keyExtractor={(item) => item.sport_id.toString()}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.sportModalGrid}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const style = sportStyles[item.name] || { 
                      icon: 'sports', 
                      color: '#718096', 
                      bgColor: '#F8FAFC', 
                      gradient: ['#718096', '#A0AEC0'] 
                    };
                    return (
                      <TouchableOpacity
                        style={[
                          styles.sportModalItem,
                          { backgroundColor: style.bgColor },
                          selectedSport?.sport_id === item.sport_id && styles.sportModalItemSelected
                        ]}
                        onPress={() => {
                          setSelectedSport(item);
                          setFormData(prev => ({...prev, sport_id: item.sport_id}));
                          setIsSportsModalVisible(false);
                          clearSearch();
                        }}
                      >
                        <View style={[styles.sportModalIconContainer, { backgroundColor: style.color }]}>
                          <MaterialIcons name={style.icon} size={28} color="#FFF" />
                        </View>
                        <Text style={[
                          styles.sportModalItemText,
                          selectedSport?.sport_id === item.sport_id && { color: style.color }
                        ]}>
                          {item.name}
                        </Text>
                        {selectedSport?.sport_id === item.sport_id && (
                          <View style={[styles.sportModalCheckmark, { backgroundColor: style.color }]}>
                            <MaterialIcons name="check" size={16} color="#FFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  });

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const memoizedFilteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(product => product.sport?.name === selectedFilter);
    }
    
    return filtered;
  }, [products, searchQuery, selectedFilter]);

  const showAlert = (title, message, buttons) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(btn => ({
        ...btn,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          btn.onPress?.();
        }
      }))
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FA5F5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddNew}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#A0AEC0"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={24} color="#718096" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' && styles.filterChipSelected
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'all' && styles.filterChipTextSelected
            ]}>All</Text>
          </TouchableOpacity>
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.sport_id}
              style={[
                styles.filterChip,
                selectedFilter === sport.name && styles.filterChipSelected
              ]}
              onPress={() => setSelectedFilter(sport.name)}
            >
              <MaterialIcons 
                name={sportIcons[sport.name] || sportIcons.default}
                size={16} 
                color={selectedFilter === sport.name ? '#fff' : '#4A5568'} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === sport.name && styles.filterChipTextSelected
              ]}>{sport.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-basket" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products yet</Text>
          <Text style={styles.emptySubText}>Start selling by adding your first product!</Text>
        </View>
      ) : memoizedFilteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No matches found</Text>
          <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={memoizedFilteredProducts}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 80 }} />}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          initialNumToRender={5}
        />
      )}

      <ProductModal />
      <SportSelectionModal />
      <CustomAlert 
        visible={alertConfig.visible} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        buttons={alertConfig.buttons} 
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        product={productToDelete}
        onClose={() => {
          setDeleteModalVisible(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </View>
  );
};

const sportIcons = {
  Football: 'sports-soccer',
  Basketball: 'sports-basketball',
  Tennis: 'sports-tennis',
  Baseball: 'sports-baseball',
  Golf: 'sports-golf',
  Rugby: 'sports-rugby',
  Cricket: 'sports-cricket',
  default: 'sports'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingBottom: 80, // Space for bottom navbar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4FA5F5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#3993E8',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100, // Extra padding at bottom for better scrolling
  },
  productCard: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  productPrice: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  discountTag: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 165, 245, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sportText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  editButton: {
    backgroundColor: '#4FA5F5',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    minHeight: '50%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formScrollView: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 120, // Extra space for the form footer
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    color: '#2D3748',
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
    position: 'relative',
    zIndex: 1,
  },
  inputFocused: {
    borderColor: '#4FA5F5',
    backgroundColor: '#F8FAFC',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    position: 'absolute',
    left: 16,
    top: -10,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
    zIndex: 2,
  },
  inputLabelFocused: {
    color: '#4FA5F5',
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  formSectionDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  imageUploadSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imageUploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageUploadDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F7FAFC',
    position: 'relative',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  removeImageButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageUploadContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    padding: 20,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadButtonText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  modalContent: {
    flex: 1,
    maxHeight: '100%',
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 2,
  },
  discountInput: {
    flex: 1,
  },
  inputPrefix: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  inputSuffix: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  inputWithPrefix: {
    paddingLeft: 32,
  },
  inputWithSuffix: {
    paddingRight: 32,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  alertHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  alertBody: {
    padding: 20,
    paddingTop: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertFooter: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDefaultButton: {
    backgroundColor: '#4FA5F5',
  },
  alertCancelButton: {
    backgroundColor: '#EDF2F7',
  },
  alertDestructiveButton: {
    backgroundColor: '#FF4444',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  alertCancelButtonText: {
    color: '#4A5568',
  },
  alertDestructiveButtonText: {
    color: '#fff',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteModalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteModalImageContainer: {
    width: '100%',
    height: 120,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  deleteModalImage: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },
  deleteModalProductInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  deleteModalProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  deleteModalProductPrice: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '600',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteModalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteModalDeleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteModalCancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  formAnimatedContainer: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 2,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputCounter: {
    position: 'absolute',
    right: 16,
    bottom: -20,
    fontSize: 12,
    color: '#718096',
  },
  characterLimit: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'right',
    marginTop: 4,
  },
  characterLimitWarning: {
    color: '#F6AD55',
  },
  characterLimitExceeded: {
    color: '#FF4444',
  },
  tooltipContainer: {
    position: 'absolute',
    right: -8,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 2,
  },
  tooltip: {
    position: 'absolute',
    right: 32,
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: '#2D3748',
    padding: 8,
    borderRadius: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
  },
  tooltipArrow: {
    position: 'absolute',
    right: -8,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderLeftWidth: 8,
    borderLeftColor: '#2D3748',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4FA5F5',
    borderRadius: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  chipIcon: {
    width: 16,
    height: 16,
    tintColor: '#4A5568',
  },
  tagInput: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    color: '#4A5568',
    fontSize: 14,
  },
  tagRemove: {
    padding: 2,
  },
  tagInput: {
    flex: 1,
    minWidth: 100,
    fontSize: 14,
    padding: 0,
    color: '#2D3748',
  },
  submitButtonContainer: {
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: '#4FA5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  submitButtonIcon: {
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  successAnimation: {
    width: 100,
    height: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  sectionHeaderIcon: {
    marginRight: 8,
    backgroundColor: '#EBF8FF',
    padding: 8,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  inputLabel: {
    position: 'absolute',
    left: 16,
    top: -10,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
    zIndex: 2,
  },
  inputFilled: {
    borderColor: '#4FA5F5',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonSelected: {
    borderColor: '#4FA5F5',
    backgroundColor: '#EBF8FF',
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF8FF',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#4FA5F5',
    fontWeight: '600',
  },
  sportModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '80%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sportModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.5,
  },
  sportModalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  sportModalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sportModalSearchIcon: {
    marginRight: 12,
  },
  sportModalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: 0,
  },
  sportModalSearchClear: {
    padding: 4,
    marginLeft: 8,
  },
  sportModalEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sportModalEmptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  sportModalEmptyStateText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  sportModalGrid: {
    padding: 12,
  },
  sportModalItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sportModalItemSelected: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sportModalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sportModalItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 8,
  },
  sportModalCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#4FA5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FA5F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#2D3748',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: '#4FA5F5',
    borderColor: '#4FA5F5',
  },
  filterChipText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
});

export default UserProducts;
