import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Animated, Dimensions,
  TouchableWithoutFeedback, Modal, TextInput, ScrollView, Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from './theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Layout = () => {
  // Navigation and menu
   const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState('Home');
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  // Menu state
  const [menuMeals, setMenuMeals] = useState([]); // main meals array
  const [gourmetMeals, setGourmetMeals] = useState([]); // gourmet meals array
  const [courseFilter, setCourseFilter] = useState('All');

  // Chef Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState('Menu');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUri, setFormImageUri] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null);
  const [formCourse, setFormCourse] = useState('Starter');
  const [formPrice, setFormPrice] = useState('');

  // Booking state
  const [bookingName, setBookingName] = useState('');
  const [bookingSurname, setBookingSurname] = useState('');
  const [bookingContactNumber, setBookingContactNumber] = useState('');
  const [bookingTime, setBookingTime] = useState(new Date());
  const [showBookingTimePicker, setShowBookingTimePicker] = useState(false);
  const [bookingPeople, setBookingPeople] = useState('1');

  // Delivery state
  const [deliveryName, setDeliveryName] = useState('');
  const [deliverySurname, setDeliverySurname] = useState('');
  const [deliveryContactNumber, setDeliveryContactNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(new Date());
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);

  // Favorite toggle
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

  // Navigation
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

  // Modal for Chef Menu
  const openEditModal = (menu = 'Menu', meal = null) => {
    setEditingMenu(menu);
    if (meal) {
      setFormName(meal.name);
      setFormDescription(meal.description);
      setFormImageUri(meal.image);
      setFormCourse(meal.course || 'Starter');
      setFormPrice(meal.price ? meal.price.toString() : '');
      setEditingMealId(meal.id);
    } else {
      setFormName('');
      setFormDescription('');
      setFormImageUri(null);
      setFormCourse('Starter');
      setFormPrice('');
      setEditingMealId(null);
    }
    setModalVisible(true);
  };

  // Save meal (add or edit)
  const saveMeal = () => {
    if (!formName || !formDescription || !formCourse || !formPrice) {
      Alert.alert('Please fill in all fields');
      return;
    }
    const mealData = {
      id: editingMealId || Date.now(),
      name: formName,
      description: formDescription,
      image: formImageUri,
      course: formCourse,
      price: parseFloat(formPrice),
      favorite: editingMealId ? (
        editingMenu === 'Menu'
          ? menuMeals.find(m => m.id === editingMealId)?.favorite || false
          : gourmetMeals.find(m => m.id === editingMealId)?.favorite || false
      ) : false,
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

  // Remove meal
  const removeMeal = (menuName, mealId) => {
    Alert.alert(
      'Remove Meal',
      'Are you sure you want to remove this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (menuName === 'Menu') {
              setMenuMeals(prev => prev.filter(m => m.id !== mealId));
            } else if (menuName === 'Gourmet Meals') {
              setGourmetMeals(prev => prev.filter(m => m.id !== mealId));
            }
          }
        }
      ]
    );
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

  // Render meals list (for Home, Menu, Gourmet Meals, Guest Filter)
  const renderMealsList = (meals, menuName, showRemove = false) => {
    if (meals.length === 0) {
      return (
        <>
          <Text style={{ marginTop: 20, color: '#555' }}>No meals added yet.</Text>
          <View style={{ height: 50 }} />
        </>
      );
    }
    return meals.map((meal) => (
      <View key={meal.id} style={styles.mealItem}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
        ) : (
          <View style={[styles.mealImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999' }}>No Image</Text>
          </View>
        )}
        <View style={styles.mealTextContainer}>
          <Text style={styles.mealName} numberOfLines={1} ellipsizeMode="tail">
            {meal.name}
          </Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
          <Text style={{ fontStyle: 'italic', color: '#888', fontSize: 14 }}>
            {meal.course}
          </Text>
          <Text style={{ color: '#333', fontWeight: 'bold' }}>
            R{meal.price ? meal.price.toFixed(2) : 'N/A'}
          </Text>
        </View>
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
        {showRemove && (
          <>
            <TouchableOpacity
              onPress={() => removeMeal(menuName, meal.id)}
              style={{ marginLeft: 10 }}
            >
              <Feather name="trash-2" size={22} color="#d00" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openEditModal(menuName, meal)}
              style={{ marginLeft: 10 }}
            >
              <Feather name="edit" size={22} color="#007bff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    ));
  };

  // Calculate average price per course
  const getAveragePrices = (meals) => {
    const courses = ['Starter', 'Main', 'Dessert', 'Side', 'Drink'];
    const result = {};
    courses.forEach(course => {
      const filtered = meals.filter(m => m.course === course && m.price);
      if (filtered.length) {
        const avg = filtered.reduce((sum, m) => sum + m.price, 0) / filtered.length;
        result[course] = avg;
      }
    });
    return result;
  };

  // Home page: show all menu items and average price per course
  const renderHomePage = () => {
    const allMeals = [...menuMeals, ...gourmetMeals];
    const avgPrices = getAveragePrices(allMeals);
    return (
      <ScrollView
        style={{ flex: 1 }}  
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 30,
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Text style={styles.welcomeTitle}>Welcome to Christoffel’s Culinary Experience!</Text>
        <Text style={styles.introText}>
          Discover a personalized digital menu that changes nightly, crafted to delight your unique tastes.
        </Text>
        <Text style={styles.briefText}>
          Stay effortlessly connected to Christoffel’s evolving menu, featuring fresh, seasonal dishes crafted daily. This app ensures you always have instant access to the latest culinary creations, allowing you to explore unique flavors and tailored dining experiences designed to delight your palate every time you dine.
        </Text>
        <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: 18 }}>Average Price by Course:</Text>
        <View style={{height: 30}}></View>
        {Object.keys(avgPrices).length === 0 && (
          
          <Text style={{ color: '#555', marginBottom: 10 }}>No menu items yet.</Text>
        )}
        {Object.entries(avgPrices).map(([course, avg]) => (
          <Text key={course} style={{ fontSize: 16 }}>
            {course}: R{avg.toFixed(2)}
          </Text>
        ))}
        <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: 18 }}>Complete Menu:</Text>
        {renderMealsList(allMeals, 'Menu')}
      </ScrollView>
    );
  };

  // Chef Menu Management Page
  const renderChefMenuPage = () => (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <Text style={styles.pageTitle}>Chef Menu Management</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openEditModal('Menu', null)}
      >
        <Text style={styles.addButtonText}>Add New Menu Meal</Text>
      </TouchableOpacity>
      {renderMealsList(menuMeals, 'Menu', true)}

      <View style={{ height: 20 }} />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openEditModal('Gourmet Meals', null)}
      >
        <Text style={styles.addButtonText}>Add New Gourmet Meal</Text>
      </TouchableOpacity>
      {renderMealsList(gourmetMeals, 'Gourmet Meals', true)}
    </ScrollView>
  );

  // Guest Filter Page
  const renderGuestFilterPage = () => {
    const allMeals = [...menuMeals, ...gourmetMeals];
    const filtered = courseFilter === 'All'
      ? allMeals
      : allMeals.filter(meal => meal.course === courseFilter);
    return (
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <Text style={styles.pageTitle}>Filter Menu by Course</Text>

        <View style={{ height: 15 }} />

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Select Course:</Text>
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
        {renderMealsList(filtered, 'Menu')}
      </ScrollView>
    );
  };

  // Bookings Page
  const renderBookingsPage = () => {
    const onChangeTime = (event, selectedDate) => {
      setShowBookingTimePicker(false);
      if (selectedDate) setBookingTime(selectedDate);
    };

    const submitBooking = () => {
      if (!bookingName || !bookingSurname || !bookingContactNumber) {
        Alert.alert('Please fill in all required fields');
        return;
      }
      Alert.alert('Booking submitted', `Thank you, ${bookingName}!`);
      // Reset form
      setBookingName('');
      setBookingSurname('');
      setBookingContactNumber('');
      setBookingPeople('1');
      setBookingTime(new Date());
    };

    return (
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <Text style={styles.pageTitle}>Make a Booking</Text>

        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={bookingName}
          onChangeText={setBookingName}
          placeholder="Enter your name"
        />

        <Text style={styles.inputLabel}>Surname</Text>
        <TextInput
          style={styles.input}
          value={bookingSurname}
          onChangeText={setBookingSurname}
          placeholder="Enter your surname"
        />

        <Text style={styles.inputLabel}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={bookingContactNumber}
          onChangeText={setBookingContactNumber}
          placeholder="Enter your contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Number of People</Text>
        <Picker
          selectedValue={bookingPeople}
          onValueChange={setBookingPeople}
          style={styles.picker}
        >
          {[...Array(20).keys()].map(i => (
            <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
          ))}
        </Picker>

        <Text style={styles.inputLabel}>Booking Time</Text>
        <TouchableOpacity
          onPress={() => setShowBookingTimePicker(true)}
          style={styles.timePickerButton}
        >
          <Text>{bookingTime.toLocaleString()}</Text>
        </TouchableOpacity>
        {showBookingTimePicker && (
          <DateTimePicker
            value={bookingTime}
            mode="datetime"
            display="default"
            onChange={onChangeTime}
          />
        )}

        <TouchableOpacity onPress={submitBooking} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Deliveries Page
  const renderDeliveriesPage = () => {
    const onChangeDeliveryTime = (event, selectedDate) => {
      setShowDeliveryTimePicker(false);
      if (selectedDate) setDeliveryTime(selectedDate);
    };

    const submitDelivery = () => {
      if (!deliveryName || !deliverySurname || !deliveryContactNumber || !deliveryAddress) {
        Alert.alert('Please fill in all required fields');
        return;
      }
      Alert.alert('Delivery order submitted', `Thank you, ${deliveryName}!`);
      // Reset form
      setDeliveryName('');
      setDeliverySurname('');
      setDeliveryContactNumber('');
      setDeliveryAddress('');
      setDeliveryTime(new Date());
    };

    return (
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <Text style={styles.pageTitle}>Place a Delivery Order</Text>

        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={deliveryName}
          onChangeText={setDeliveryName}
          placeholder="Enter your name"
        />

        <Text style={styles.inputLabel}>Surname</Text>
        <TextInput
          style={styles.input}
          value={deliverySurname}
          onChangeText={setDeliverySurname}
          placeholder="Enter your surname"
        />

        <Text style={styles.inputLabel}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={deliveryContactNumber}
          onChangeText={setDeliveryContactNumber}
          placeholder="Enter your contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Delivery Address</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Enter your delivery address"
        />

        <Text style={styles.inputLabel}>Delivery Time</Text>
        <TouchableOpacity
          onPress={() => setShowDeliveryTimePicker(true)}
          style={styles.timePickerButton}
        >
          <Text>{deliveryTime.toLocaleString()}</Text>
        </TouchableOpacity>
        {showDeliveryTimePicker && (
          <DateTimePicker
            value={deliveryTime}
            mode="datetime"
            display="default"
            onChange={onChangeDeliveryTime}
          />
        )}

        <TouchableOpacity onPress={submitDelivery} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit Delivery Order</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // About Page
  const renderAboutPage = () => (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <Text style={styles.pageTitle}>About Christoffel's Culinary Experience</Text>
      <Text style={styles.aboutText}>
        Welcome to Christoffel’s Culinary Experience, where passion meets flavor. Our mission is to provide a personalized and evolving menu that delights your palate with fresh, seasonal dishes crafted daily by our expert chefs.
      </Text>
      <Text style={styles.aboutText}>
        This app allows you to explore our menu, make bookings, place delivery orders, and stay connected with our latest culinary creations.
      </Text>
      <Text style={styles.aboutText}>
        Thank you for choosing Christoffel’s. We look forward to serving you!
      </Text>
    </ScrollView>
  );

  // Page router
  const renderPageContent = () => {
    switch (selectedPage) {
      case 'Home': return renderHomePage();
      case 'Chef Menu': return renderChefMenuPage();
      case 'Guest Filter': return renderGuestFilterPage();
      case 'Bookings': return renderBookingsPage();
      case 'Deliveries': return renderDeliveriesPage();
      case 'About': return renderAboutPage();
      default: return <View style={styles.pageContainer}><Text>Page not found</Text></View>;
    }
  };

  // Navbar and Footer
  const Navbar = () => (
    <View style={[styles.nav, { backgroundColor: theme.colors.navBackground }]}>
      <TouchableOpacity onPress={() => navigateTo('Home')} style={styles.heroImageWrapper}>
        <Image source={require('./assets/hero-image.png')} style={styles.heroImage} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={[styles.navText, { color: theme.colors.navText }]}>Christoffel's</Text>
      <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
        <View style={[styles.bar, { backgroundColor: theme.colors.navText }]} />
        <View style={[styles.bar, { backgroundColor: theme.colors.navText }]} />
        <View style={[styles.bar, { backgroundColor: theme.colors.navText }]} />
      </TouchableOpacity>
    </View>
  );
  const Footer = () => (
    <View style={[styles.footer, { backgroundColor: theme.colors.footerBackground }]}>
      <Text style={{ color: theme.colors.footerText, textAlign: 'center', width: '100%' }}>
        © 2025 Christoffel's Culinary Experience
      </Text>
    </View>
  );


  // Side menu with pages
  const menuPages = ['Home', 'Chef Menu', 'Guest Filter', 'Bookings', 'Deliveries', 'About'];

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
              {menuPages.map((item) => (
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
      {/* Chef Modal */}
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
              {/* Meal Name */}
              <Text style={styles.inputLabel}>Meal Name</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Enter meal name"
              />
              {/* Description */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Enter meal description"
              />
              {/* Course */}
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
              {/* Price */}
              <Text style={styles.inputLabel}>Price (R)</Text>
              <TextInput
                style={styles.input}
                value={formPrice}
                onChangeText={setFormPrice}
                placeholder="Enter price"
                keyboardType="numeric"
              />
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
    paddingHorizontal: 10,
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    flexShrink: 1,
  },

  mealDescription: {
     fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  mealItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#e0e0e0ff',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: 380,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: 100,
    justifyContent: 'space-between', 
  },
  mealImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#eee',
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

  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    textAlign: 'center'
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
