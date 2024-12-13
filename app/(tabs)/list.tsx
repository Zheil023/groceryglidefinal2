import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { useNavigation } from '@react-navigation/native';

interface SelectedItem {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  quantity: number;
}

export default function ListScreen() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const navigation = useNavigation();

  // Fetch selected items from Firestore in real-time
  const fetchSelectedItems = () => {
    const q = query(collection(db, 'SelectedItems'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        category: doc.data().category,
        quantity: doc.data().quantity || 1,
      }));

      console.log("Fetched items:", items); // Log to verify data

      // Aggregate items with the same name
      const aggregatedItems = items.reduce((acc, item) => {
        if (acc[item.name]) {
          acc[item.name].quantity += 1;
        } else {
          acc[item.name] = { ...item, quantity: 1 };
        }
        return acc;
      }, {} as { [key: string]: SelectedItem });

      setSelectedItems(Object.values(aggregatedItems)); // Set the aggregated items to state
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = fetchSelectedItems();
    return () => unsubscribe();
  }, []);

  const handleStartNavigation = () => {
    Alert.alert(
      "Start Navigation", 
      "Are you sure you want to start navigation?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Navigation cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            // Pass selected categories to the map screen
            const selectedCategories = [...new Set(selectedItems.map(item => item.category))];
            navigation.navigate('map', { selectedCategories });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleRemoveItem = async (itemId: string, itemName: string, quantity: number) => {
    if (quantity > 1) {
      // If more than one item, update the quantity
      await updateDoc(doc(db, 'SelectedItems', itemId), {
        quantity: quantity - 1,
      });
      setSelectedItems((prevItems) =>
        prevItems.map((item) =>
          item.name === itemName
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ).filter((item) => item.quantity > 0)
      );
      Alert.alert("Item Removed", `${itemName} has been removed from your list.`);
    } else {
      // If quantity is 1, remove the item completely
      await deleteDoc(doc(db, 'SelectedItems', itemId));
      setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      Alert.alert("Item Removed", `${itemName} has been removed from your list.`);
    }
  };

  // Function to remove all items from the list
  const handleRemoveAllItems = async () => {
    try {
      // Get all selected items from Firestore
      const selectedItemsRef = collection(db, 'SelectedItems');
      const snapshot = await getDocs(selectedItemsRef); // Fetch all documents in the collection

      // Delete all documents
      snapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, 'SelectedItems', docSnapshot.id)); // Delete each document
      });

      // Clear the selected items from local state
      setSelectedItems([]);
      Alert.alert('All items removed', 'All selected items have been removed from your list.');
    } catch (error) {
      console.error('Error removing all items:', error);
      Alert.alert('Error', 'An error occurred while removing all items.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected Items</Text>
      <FlatList
        data={selectedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>
              {item.name} x{item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id, item.name, item.quantity)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      {/* Button to remove all items */}
      <TouchableOpacity onPress={handleRemoveAllItems} style={styles.button}>
        <Text style={styles.buttonText}>Remove All Items</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleStartNavigation} style={styles.button}>
        <Text style={styles.buttonText}>Start Navigation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
  },
  removeButton: {
    backgroundColor: '#a62639',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
  },
  button: {
    backgroundColor: '#a62639',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
