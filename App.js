import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from './theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Layout = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState('Home');
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  // Booking form state hooks
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [time, setTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [people, setPeople] = useState('1');

  // Delivery form state hook
  const [showTimePicker2, setShowTimePicker2] = useState(false);
  const [address, setAddress] = useState('');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Which menu are we editing? 'Menu' or 'Gourmet Meals'
  const [editingMenu, setEditingMenu] = useState('Menu');

  // Meal data states for Menu and Gourmet Meals
  const [menuMeals, setMenuMeals] = useState([]);
  const [gourmetMeals, setGourmetMeals] = useState([]);
  const [courseFilter, setCourseFilter] = useState('All');

  // Form state inside modal
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUri, setFormImageUri] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null); // null means adding new meal
  const [formCourse, setFormCourse] = useState('Starter');
  
  // Favorite meals toggle
  const toggleFavorite = (menuName, mealId) => {
  if (menuName === 'Menu') {
    setMenuMeals(prev =>
      prev.map(m => m.id === mealId ? { ...m, favorite: !m.favorite } : m)
    );
  } else if (menuName === 'Gourmet Meals') {
    setGourmetMeals(prev =>
      prev.map(m => m.id === mealId ? { ...m, favorite: !m.favorite } : m)
    );
  }
};

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const navigateTo = (page) => {
    setSelectedPage(page);
    toggleMenu();
  };

  // Open modal for adding new meal or editing existing meal
  const openEditModal = (menu = 'Menu', meal = null) => {
    setEditingMenu(menu);
    if (meal) {
      setFormName(meal.name);
      setFormDescription(meal.description);
      setFormImageUri(meal.image);
      setFormCourse(meal.course || 'Starter');
      setEditingMealId(meal.id);
    } else {
      setFormName('');
      setFormDescription('');
      setFormImageUri(null);
      setFormCourse('Starter');
      setEditingMealId(null);
    }
    setModalVisible(true);
  };

  // Save meal data to the correct menu list
  const saveMeal = () => {
    const mealData = {
    id: editingMealId || Date.now(),
    name: formName,
    description: formDescription,
    image: formImageUri,
    course: formCourse,
    favorite: editingMealId ? (editingMenu === 'Menu' 
      ? menuMeals.find(m => m.id === editingMealId)?.favorite || false
      : gourmetMeals.find(m => m.id === editingMealId)?.favorite || false) 
      : false,
  };

    if (editingMenu === 'Menu') {
      if (editingMealId) {
        setMenuMeals((prev) =>
          prev.map((m) => (m.id === editingMealId ? mealData : m))
        );
      } else {
        setMenuMeals((prev) => [...prev, mealData]);
      }
    } else if (editingMenu === 'Gourmet Meals') {
      if (editingMealId) {
        setGourmetMeals((prev) =>
          prev.map((m) => (m.id === editingMealId ? mealData : m))
        );
      } else {
        setGourmetMeals((prev) => [...prev, mealData]);
      }
    }

    setModalVisible(false);
  };

  // Image picker handlers
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode && response.assets?.length) {
        setFormImageUri(response.assets[0].uri);
      }
    });
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode && response.assets?.length) {
        setFormImageUri(response.assets[0].uri);
      }
    });
  };

  // Render meals list for Menu or Gourmet Meals page
  const renderMealsList = (meals, menuName) => {
    if (meals.length === 0) {
      return <Text style={{ marginTop: 20, color: '#555' }}>No meals added yet.</Text>;
    }
    return meals.map((meal) => (
      <TouchableOpacity
        key={meal.id}
        style={styles.mealItem}
        onPress={() => openEditModal(menuName, meal)}
      >
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
        ) : (
          <View style={[styles.mealImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999' }}>No Image</Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
          <Text style={{ fontStyle: 'italic', color: '#888', fontSize: 14 }}>
            {meal.course}
          </Text>
        </View>

        {/* Star icon for favorite toggle */}
        <TouchableOpacity
          onPress={() => toggleFavorite(menuName, meal.id)}
          style={styles.favoriteIcon}
        >
          <Feather
            name={meal.favorite ? 'star' : 'star'}
            size={24}
            color={meal.favorite ? '#FFD700' : '#888'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    ));
  };

  const renderPageContent = () => {
    switch (selectedPage) {
      case 'Home':
        return (
          <View style={styles.pageContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Christoffel’s Culinary Experience!</Text>
            <Text style={styles.introText}>
              Discover a personalized digital menu that changes nightly, crafted to delight your unique tastes.
            </Text>
            <Text style={styles.briefText}>
              Stay effortlessly connected to Christoffel’s evolving menu, featuring fresh, seasonal dishes crafted daily. This app ensures you always have instant access to the latest culinary creations, allowing you to explore unique flavors and tailored dining experiences designed to delight your palate every time you dine.
            </Text>
          </View>
        );
      case 'Menu': {
        const filteredMenuMeals = courseFilter === 'All'
          ? menuMeals
          : menuMeals.filter(meal => 
              meal.course?.toLowerCase() === courseFilter.toLowerCase());

        return (
          <View style={styles.pageContainer}>
            <Text style={styles.pageTitle}>Menu</Text>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Course:</Text>
               <Picker
                  selectedValue={courseFilter}
                  onValueChange={setCourseFilter}
                  mode="dropdown"
                  style={{ flex: 1 }}
                >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Starter" value="Starter" />
                <Picker.Item label="Main" value="Main" />
                <Picker.Item label="Dessert" value="Dessert" />
                <Picker.Item label="Side" value="Side" />
                <Picker.Item label="Drink" value="Drink" />
              </Picker>
            </View>

            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Total Meals: {filteredMenuMeals.length}
            </Text>

            {renderMealsList(filteredMenuMeals, 'Menu')}
          </View>
        );
      }

      case 'Bookings': {
        const confirmBooking = () => {
          if (!name || !surname || !contactNumber || !time) {
            Alert.alert('Please fill in all fields');
            return;
          }
          Alert.alert(
            'Booking Confirmed',
            `Thank you, ${name}!\nYour booking for ${people} people at ${time} is confirmed.`
          );
        };

        // Helper to convert time string (e.g., "7:30 PM") to Date object
        const getTimeDate = () => {
          if (!time) return new Date();
          const [hourMin, meridian] = time.split(' ');
          let [hours, minutes] = hourMin.split(':').map(Number);
          if (meridian === 'PM' && hours < 12) hours += 12;
          if (meridian === 'AM' && hours === 12) hours = 0;
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          return date;
        };

        const onTimeChange = (event, selectedDate) => {
          setShowTimePicker(false); // Always close picker after selection on Android
          if (selectedDate) {
            let hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes();
            const meridian = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${meridian}`;
            setTime(formattedTime);
          }
        };

        return (
          <ScrollView contentContainerStyle={styles.pageContainer}>
            <Text style={styles.pageTitle}>Bookings</Text>

            {/* Stacked inputs aligned left */}
            <TextInput
              style={[styles.input, styles.leftAlignedInput]}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, styles.leftAlignedInput]}
              placeholder="Surname"
              value={surname}
              onChangeText={setSurname}
            />

            <TextInput
              style={[styles.input, styles.leftAlignedInput]}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            {/* Row container for Time and Number of People */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>{time || 'Select Time'}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={getTimeDate()}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onTimeChange}
                  />
                )}
              </View>

              <View style={[styles.pickerWrapper, styles.halfInput]}>
                <Picker
                  selectedValue={people}
                  onValueChange={(itemValue) => setPeople(itemValue)}
                  style={styles.picker2}
                >
                  {[...Array(15)].map((_, i) => (
                    <Picker.Item key={i + 1} label={`No. of people ${i + 1}`} value={`${i + 1}`} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmBooking}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      }
      case 'Deliveries': {
        const confirmDelivery = () => {
          if (!name || !surname || !contactNumber || !time || !address) {
            Alert.alert('Please fill in all fields');
            return;
          }
          Alert.alert(
            'Delivery Confirmed',
            `Thank you, ${name} ${surname}!\nYour order will be delivered to "${address}" at ${time}.`
          );
        };

        // Helper to convert time string (e.g., "7:30 PM") to Date object
        const getTimeDate = () => {
          if (!time) return new Date();
          const [hourMin, meridian] = time.split(' ');
          let [hours, minutes] = hourMin.split(':').map(Number);
          if (meridian === 'PM' && hours < 12) hours += 12;
          if (meridian === 'AM' && hours === 12) hours = 0;
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          return date;
        };

        const onTimeChange = (event, selectedDate) => {
          setShowTimePicker2(false); // Always close picker after selection on Android
          if (selectedDate) {
            let hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes();
            const meridian = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${meridian}`;
            setTime(formattedTime);
          }
        };

        return (
          <ScrollView contentContainerStyle={styles.pageContainer}>
            <Text style={styles.pageTitle}>Deliveries</Text>

            {/* Stacked inputs aligned left */}
            <TextInput
              style={[styles.input, styles.leftAlignedInput]}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, styles.leftAlignedInput]}
              placeholder="Surname"
              value={surname}
              onChangeText={setSurname}
            />

            <TextInput
              style={[styles.input, styles.leftAlignedInput]}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            {/* Row container for Time and Address */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker2(true)}
                >
                  <Text style={styles.timePickerButtonText}>{time || 'Select Time'}</Text>
                </TouchableOpacity>
                {showTimePicker2 && (
                  <DateTimePicker
                    value={getTimeDate()}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onTimeChange}
                  />
                )}
              </View>

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Delivery Address"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmDelivery}
              >
                <Text style={styles.confirmButtonText}>Confirm Delivery</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      }
      case 'Gourmet Meals': {
        const filteredGourmetMeals = courseFilter === 'All'
          ? gourmetMeals
          : gourmetMeals.filter(meal =>
              meal.course?.toLowerCase() === courseFilter.toLowerCase()
            );

        return (
          <View style={styles.pageContainer}>
            <Text style={styles.pageTitle}>Gourmet Meals</Text>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by Course:</Text>
              <Picker
                selectedValue={courseFilter}
                onValueChange={(value) => setCourseFilter(value)}
                mode="dropdown"
                style={{ flex: 1 }}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Starter" value="Starter" />
                <Picker.Item label="Main" value="Main" />
                <Picker.Item label="Dessert" value="Dessert" />
                <Picker.Item label="Side" value="Side" />
                <Picker.Item label="Drink" value="Drink" />
              </Picker>
            </View>

            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Total Meals: {filteredGourmetMeals.length}
            </Text>

            {renderMealsList(filteredGourmetMeals, 'Gourmet Meals')}
          </View>
        );
      }
      case 'About':
        return (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutText}>
              Founded by the passionate Chef Christoffel and his family, our restaurant began as a humble kitchen dedicated to celebrating the rich culinary traditions of the region. With decades of experience and a shared love for fresh, seasonal ingredients, the chefs have crafted a unique cooking style we call “Heritage Fusion.” This style blends classic techniques with modern flavors, emphasizing natural tastes and artistic presentation. Our mission is to offer an unforgettable dining experience that honors the past while embracing innovation.
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.pageContainer}>
            <Text>Page not found</Text>
          </View>
        );
    }
  };

  const Navbar = () => (
    <View style={[styles.nav, { backgroundColor: theme.colors.navBackground }]}>
      <TouchableOpacity onPress={() => navigateTo('Home')} style={styles.heroImageWrapper}>
        <Image
          source={require('./assets/hero-image.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={[styles.navText, { color: theme.colors.navText }]}>
        Christoffel's
      </Text>

      <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
        <View style={[styles.bar, { backgroundColor: theme.colors.navText }]} />
        <View style={[styles.bar, { backgroundColor: theme.colors.navText }]} />
        <View style={[styles.bar, { backgroundColor: theme.colors.navText }]} />
      </TouchableOpacity>
    </View>
  );

  const Footer = () => (
    <View style={[styles.footer, { backgroundColor: theme.colors.footerBackground }]}>
      <TouchableOpacity style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Order</Text>
      </TouchableOpacity>

      <View style={styles.listsContainer}>
        <View style={styles.list}>
          <Text style={styles.listHeading}>FAQS</Text>
          <Text style={styles.listItem}>BOOKINGS</Text>
          <Text style={styles.listItem}>TAKEAWAYS</Text>
          <Text style={styles.listItem}>LOCATIONS</Text>
        </View>
        <View style={styles.list}>
          <Text style={styles.listHeading}>PAYMENT OPTIONS</Text>
          <Text style={styles.listItem}>SNAP SCAN</Text>
          <Text style={styles.listItem}>TAP OR INSERT</Text>
          <Text style={styles.listItem}>EFT/PAYMENT GATEWAY</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.downloadButton}>
        <Text style={styles.downloadButtonText}>Download Menu</Text>
        <Feather name="download" color="#000" size={18} />
      </TouchableOpacity>

      <View style={styles.verticalLine} />

      <TouchableOpacity onPress={() => openEditModal(selectedPage)} style={styles.wrenchIcon}>
        <MaterialCommunityIcons name="wrench-outline" color="#000" size={14} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Navbar />
      <View style={styles.body}>{renderPageContent()}</View>
      <Footer />

      {menuVisible && (
        <>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.sideMenu, { left: slideAnim }]}>
            <TouchableOpacity onPress={toggleMenu} style={styles.exitIcon}>
              <Feather name="x" size={28} color="#000" />
            </TouchableOpacity>

            <View style={styles.menuItemsContainer}>
              {['Home', 'Menu', 'Bookings', 'Deliveries', 'Gourmet Meals', 'About'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.menuItem}
                  onPress={() => navigateTo(item)}
                >
                  <Text style={styles.menuItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </>
      )}

      {/* Modal for editing meal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingMealId ? 'Edit Meal' : 'Add New Meal'} - {editingMenu}
              </Text>

              {/* Menu selection picker */}
              <Text style={styles.inputLabel}>Select Menu</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={editingMenu}
                  onValueChange={(itemValue) => {
                    setEditingMenu(itemValue);
                    // Reset meal selection and clear form when menu changes
                    setEditingMealId(null);
                    setFormName('');
                    setFormDescription('');
                    setFormImageUri(null);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Menu" value="Menu" />
                  <Picker.Item label="Gourmet Meals" value="Gourmet Meals" />
                </Picker>
              </View>

              {/* Food item selection picker */}
              <Text style={styles.inputLabel}>Select Food Item</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={editingMealId || 'new'}
                  onValueChange={(itemValue) => {
                    if (itemValue === 'new') {
                      // Clear form for new meal
                      setEditingMealId(null);
                      setFormName('');
                      setFormDescription('');
                      setFormImageUri(null);
                    } else {
                      // Load selected meal data
                      const mealsList = editingMenu === 'Menu' ? menuMeals : gourmetMeals;
                      const meal = mealsList.find((m) => m.id === itemValue);
                      if (meal) {
                        setEditingMealId(meal.id);
                        setFormName(meal.name);
                        setFormDescription(meal.description);
                        setFormImageUri(meal.image);
                      }
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Add New Meal" value="new" />
                  {(editingMenu === 'Menu' ? menuMeals : gourmetMeals).map((meal) => (
                    <Picker.Item key={meal.id} label={meal.name} value={meal.id} />
                  ))}
                </Picker>
              </View>

              {/* Meal Name input */}
              <Text style={styles.inputLabel}>Meal Name</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Enter meal name"
              />

              {/* Description input */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Enter meal description"
              />

              <Text style={styles.inputLabel}>Course Type</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formCourse}
                    onValueChange={setFormCourse}
                    style={styles.picker}
                  >
                    <Picker.Item label="Starter" value="Starter" />
                    <Picker.Item label="Main" value="Main" />
                    <Picker.Item label="Dessert" value="Dessert" />
                    <Picker.Item label="Side" value="Side" />
                    <Picker.Item label="Drink" value="Drink" />
                  </Picker>
                </View>


              {/* Image picker */}
              <Text style={styles.inputLabel}>Image</Text>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {formImageUri ? (
                  <Image source={{ uri: formImageUri }} style={styles.imagePreview} />
                ) : (
                  <Text style={styles.imagePlaceholder}>Tap to select image</Text>
                )}
              </TouchableOpacity>

              {/* Take photo button */}
              <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>

              {/* Save button */}
              <TouchableOpacity onPress={saveMeal} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Save</Text>
              </TouchableOpacity>

              {/* Cancel button */}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  nav: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  heroImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 27.5,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
  },
  navText: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    width: 30,
    justifyContent: 'space-between',
    height: 20,
  },
  bar: {
    height: 3,
    borderRadius: 1.5,
  },

  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#000',
  },

  introText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
    lineHeight: 22,
  },

  briefText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  mealName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  mealDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },

  mealItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#e0e0e0ff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },

  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 6,
    marginBottom: 15,
    overflow: 'hidden',
    height: 65,
    justifyContent: 'center',  
    paddingVertical: 5,        
  },
  picker: {
    height: 65,
    width: '100%',
    color: '#000000ff',          
  },
  picker2: {
    height: 80,
    width: '100%',
    color: '#000000ff',          
  },

  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'center',
  },

  timePickerButton: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  timePickerButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },


   pageContainer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1c0a81',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  leftAlignedInput: {
    alignSelf: 'flex-start',
    width: '90%', 
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%', // roughly half width with some spacing
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  orderButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  orderButtonText: {
    color: '#000000ff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  listsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginHorizontal: 7,
  },
  list: {
    marginHorizontal: 10,
  },
  listHeading: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#fff',
  },
  listItem: {
    color: '#fff',
    marginVertical: 2,
    fontSize: 8,
    fontWeight: 'bold',
  },
  downloadButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderRadius: 5,
    width: 80,
  },
  downloadButtonText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  verticalLine: {
    width: 1,
    height: 50,
    backgroundColor: '#fff',
    marginHorizontal: 15,
  },
  wrenchIcon: {
    padding: 5,
    backgroundColor: '#ffffffff',
    borderRadius: 20,
  },

  // Side drawer styles
  sideMenu: {
    position: 'absolute',
    top: 150,
    bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  exitIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1100,
  },
  menuItemsContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  filterContainer: {
    height: 50, 
    width: '100%'
  },
  menuItem: {
    paddingVertical: 15,
    width: '100%',
    borderBottomColor: '#000',
    borderBottomWidth: 2.5,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },

  aboutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  aboutTitle: {
    textAlign: 'center',
    marginBottom: 60,
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },

  aboutText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: 'semibold',
    lineHeight: 24,
    color: '#000000ff',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  imagePicker: {
    height: 150,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    color: '#888',
  },
  cameraButton: {
    backgroundColor: '#ffffffff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000000ff',
    marginBottom: 15,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#000000ff',
    padding: 12,
    borderRadius: 6,
    borderColor: '#000000ff',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff0000ff',
    fontWeight: 'bold',
  },
});

export default Layout;
