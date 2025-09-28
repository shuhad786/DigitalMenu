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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from './theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Layout = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current; // off-screen left full width

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
    console.log('Navigate to:', page);
    toggleMenu();
    // Replace with your navigation logic, e.g. navigation.navigate(page);
  };

  const Navbar = () => (
    <View style={[styles.nav, { backgroundColor: theme.colors.navBackground }]}>
      <View style={styles.heroImageWrapper}>
        <Image
          source={require('./assets/hero-image.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

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

      <View style={styles.wrenchIcon}>
        <MaterialCommunityIcons name="wrench-outline" color="#000" size={14} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Navbar />
      <View style={styles.body}>{children}</View>
      <Footer />

      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {menuVisible && (
        <>
          {/* Overlay to close menu when tapping outside */}
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          {/* Side Drawer Menu */}
          <Animated.View style={[styles.sideMenu, { left: slideAnim }]}>
            {/* Exit Icon */}
            <TouchableOpacity onPress={toggleMenu} style={styles.exitIcon}>
              <Feather name="x" size={28} color="#000" />
            </TouchableOpacity>

            {/* Menu Items */}
            <View style={styles.menuItemsContainer}>
              {['Menu', 'Bookings', 'Deliveries', 'Gourmet Meals', 'About'].map((item) => (
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
    top: 150, // height of your navbar, so menu starts below it
    bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 40, // some padding below exit icon
    paddingHorizontal: 20,
    // shadows and elevation as before
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
    marginTop: 40, // space below exit icon
    alignItems: 'center', // center menu items horizontally
  },
  menuItem: {
    paddingVertical: 15,
    width: '100%',
    borderBottomColor: '#000000ff',
    borderBottomWidth: 2.5,
    alignItems: 'center', // center text horizontally inside each item
  },
  menuItemText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 150, // same as sideMenu top, so overlay covers only below navbar
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
});

export default Layout;
