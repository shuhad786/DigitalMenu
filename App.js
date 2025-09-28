import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { theme } from './theme';

const Layout = ({ children }) => (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <View style={[styles.nav, { backgroundColor: theme.colors.navBackground }]}>
      <Text style={[styles.navText, { color: theme.colors.navText }]}>Navigation Bar</Text>
    </View>

    <View style={styles.body}>
      {children}
    </View>

    <View style={[styles.footer, { backgroundColor: theme.colors.footerBackground }]}>
      <Text style={[styles.footerText, { color: theme.colors.footerText }]}>Footer</Text>
    </View>
  </View>
);

const App = () => {
  const [page, setPage] = useState('home');

  let content;
  if (page === 'home') {
    content = <Text style={{ color: theme.colors.bodyText }}>Welcome to the Home Page!</Text>;
  } else if (page === 'about') {
    content = <Text style={{ color: theme.colors.bodyText }}>This is the About Page.</Text>;
  }

  return (
    <Layout>
      {content}
      <View style={styles.buttons}>
        <Button title="Home" onPress={() => setPage('home')} color={theme.colors.primary} />
        <Button title="About" onPress={() => setPage('about')} color={theme.colors.primary} />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: { fontSize: 20, fontWeight: 'bold' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 16 },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '60%',
  },
});

export default App;
