import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
  Button,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@my_favorites_ids';

export default function App() {
  // États principaux
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(response.data);

      const storedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter ou retirer un favori
  const toggleFavorite = async (userId) => {
    try {
      let newFavorites;
      if (favorites.includes(userId)) {
        newFavorites = favorites.filter((id) => id !== userId);
      } else {
        newFavorites = [...favorites, userId];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erreur de sauvegarde', error);
    }
  };

  // Effacer tous les favoris
  const clearAll = async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      setFavorites([]);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation', error);
    }
  };

  // Ajouter un utilisateur fictif via POST
  const addUser = async () => {
    if (!newUserName || !newUserEmail) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await axios.post(
        'https://jsonplaceholder.typicode.com/users',
        {
          name: newUserName,
          email: newUserEmail,
        }
      );

      const addedUser = response.data;
      setUsers([addedUser, ...users]);
      setNewUserName('');
      setNewUserEmail('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'utilisateur');
    }
  };

  // Composant pour un item
  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item.id);
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={[styles.favButton, isFav ? styles.favActive : styles.favInactive]}
        >
          <Text style={styles.favText}>{isFav ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mon Répertoire API</Text>

      {/* Formulaire ajout utilisateur */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <TextInput
          placeholder="Nom"
          value={newUserName}
          onChangeText={setNewUserName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={newUserEmail}
          onChangeText={setNewUserEmail}
          style={styles.input}
        />
        <Button title="Ajouter un utilisateur" onPress={addUser} />
      </View>

      {/* Bouton filtrage */}
      <View style={{ marginBottom: 10, paddingHorizontal: 16 }}>
        <Button
          title={showFavoritesOnly ? "Afficher tous" : "Afficher seulement les favoris"}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        />
      </View>

      {/* Bouton effacer */}
      <View style={{ marginBottom: 10, paddingHorizontal: 16 }}>
        <Button title="Effacer tout" color="red" onPress={clearAll} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Chargement des contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={showFavoritesOnly ? users.filter((user) => favorites.includes(user.id)) : users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginTop: 4 },
  favButton: { padding: 10, borderRadius: 20 },
  favActive: { backgroundColor: '#fff3cd' },
  favInactive: { backgroundColor: '#f0f0f0' },
  favText: { fontSize: 24, color: '#f1c40f' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8 },
});
