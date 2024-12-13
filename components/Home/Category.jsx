import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import ItemListCollection from './ItemListCollection';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebaseconfig';

export default function Category({ category = () => {} }) {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Canned');
  const [showModal, setShowModal] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    GetCategories();
  }, []);

  const GetCategories = async () => {
    const categoryArray = [];
    const snapshot = await getDocs(collection(db, 'Category'));
    snapshot.forEach((doc) => {
      categoryArray.push(doc.data());
    });
    setCategoryList(categoryArray);
  };

  const handleCategoryClick = (itemName) => {
    setSelectedCategory(itemName);
    setShowModal(true);
    category(itemName); // Safe usage with fallback
    GetItemList(itemName);
  };

  const GetItemList = async (category) => {
    const q = query(collection(db, 'Items'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => doc.data());
    setItemList(items);
    setFilteredItems(items);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text.trim() === '') {
      setFilteredItems(itemList);
    } else {
      const filtered = itemList.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleAddItemToList = (item) => {
    setSelectedItems((prevItems) => [...prevItems, item]);
  };

  return (
    <View style={styles.categoryWrapper}>
      <Text style={styles.categoryText}>Category</Text>
      <View style={styles.categoryContainer}>
        {categoryList.map((item) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => handleCategoryClick(item.name)}
            style={styles.categoryItem}
          >
            <View
              style={[
                styles.container,
                selectedCategory === item.name && styles.selectedCategoryContainer,
              ]}
            >
              <Image
                source={{ uri: item?.imageUrl }}
                style={styles.categoryImage}
              />
            </View>
            <Text style={styles.itemName}>{item?.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedCategory} Items</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Search items..."
              value={searchTerm}
              onChangeText={handleSearch}
            />
            <ScrollView style={styles.itemListContainer}>
              {filteredItems.length === 0 ? (
                <Text>No items available in this category</Text>
              ) : (
                <View style={styles.gridContainer}>
                  {filteredItems.map((item, index) => (
                    <ItemListCollection
                      key={index.toString()}
                      product={item}
                      onAdd={handleAddItemToList}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryWrapper: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  categoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    marginBottom: 20,
  },
  container: {
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    padding: 10,
    alignItems: 'center',
  },
  selectedCategoryContainer: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  categoryImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  itemName: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  itemListContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
