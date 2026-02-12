import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Icon from '@react-native-vector-icons/ionicons';
import {launchImageLibrary} from 'react-native-image-picker';

const ScanScreen: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scanAnim = useRef(new Animated.Value(0)).current;

  const jokes = [
    'Oops! That’s not food—unless you’re eating rocks now? Try again! 🍔',
    'I think you picked a picture of your cat! Let’s find some food instead. 🐾',
    'Not quite edible! Let’s scan something tasty this time. 🥗',
    'Is that a shoe? I’m hungry for food, not fashion! Try again. 👟',
    'That’s definitely not on the menu! Let’s find some food to scan. 🍕',
  ];

  useEffect(() => {
    if (photo && isScanning) {
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [photo, isScanning]);

  const openGallery = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result?.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setPhoto(uri || null);
      setIsScanning(true);
      await analyzeImage(uri || '');
    }
  };

  const analyzeImage = async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'food_image.jpg',
      } as any);

      const response = await fetch('http://localhost:3000/analyze-food', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      console.log('Data', data);
      if (data.isFood) {
        setFoodItems(data.foodItems || []);
        setErrorMessage(null);

        await fetch('http://192.168.29.193:3000/analyze-food', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        setErrorMessage(randomJoke);
        setFoodItems([]);
      }
    } catch (error) {
      console.log('Error', error);
    } finally {
      setIsScanning(false);
    }
  };

  const imageHeight = 300;
  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, imageHeight],
  });

  const retakePhoto = () => {
    setPhoto(null);
    setIsScanning(false);
    setFoodItems([]);
    setErrorMessage(null);
  };

  console.log('items', foodItems);

  return (
    <SafeAreaView style={styles.container}>
      {photo ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.previewContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{uri: photo}} style={styles.previewImage} />
              {isScanning && (
                <Animated.View
                  style={[
                    styles.scanBar,
                    {transform: [{translateY: scanTranslateY}]},
                  ]}
                />
              )}
            </View>

            {foodItems.length > 0 && !isScanning && (
              <View style={styles.foodItemsContainer}>
                <Text style={styles.foodItemsTitle}>Detected Food Items</Text>
                {foodItems.map((item, index) => (
                  <View key={index} style={styles.foodItemContainer}>
                    <Text style={styles.foodItemName}>
                      {item.name} (Confidence:{' '}
                      {(item.confidence * 100).toFixed(2)}%)
                    </Text>
                    {item.nutrients ? (
                      <>
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientHeader}>Calories</Text>
                          <Text style={styles.nutrientHeader}>Proteins</Text>
                          <Text style={styles.nutrientHeader}>Carbs</Text>
                        </View>
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientValue}>
                            {item.nutrients.calories} kcal
                          </Text>
                          <Text style={styles.nutrientValue}>
                            {item.nutrients.proteins} g
                          </Text>
                          <Text style={styles.nutrientValue}>
                            {item.nutrients.carbohydrates} g
                          </Text>
                        </View>
                        <View style={styles.nutrientRow}>
                          <View style={styles.nutrientColumn}>
                            <Text style={styles.nutrientHeader}>Fats</Text>
                            <Text style={styles.nutrientValue}>
                              {item.nutrients.fats} g
                            </Text>
                          </View>
                          <View style={styles.nutrientColumn}>
                            <Text style={styles.nutrientHeader}>Vitamins</Text>
                            <Text style={styles.nutrientValue}>
                              {item.nutrients.vitamins?.[0] || '-'}
                            </Text>
                          </View>
                          <View style={styles.nutrientColumn}>
                            <Text style={styles.nutrientHeader}>Minerals</Text>
                            <Text style={styles.nutrientValue}>
                              {item.nutrients.minerals?.[0] || '-'}
                            </Text>
                          </View>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.nutrientValue}>
                        Nutritional data not available.
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            {errorMessage && !isScanning && (
              <View
                style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 20,
                  width: '80%',
                }}>
                <Text
                  style={{color: 'white', fontSize: 15, textAlign: 'center'}}>
                  {errorMessage}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={retakePhoto} style={styles.retakeButton}>
              <Text style={{textAlign: 'center', color: 'white'}}>
                Select Another Image
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Select an image from your gallery to scan for food
          </Text>
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={openGallery}
              style={styles.galleryButton}>
              <Icon name="images-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2526',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: 'white',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 16,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '80%',
    height: 300,
    position: 'relative',
    marginVertical: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  scanBar: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'white',
    opacity: 0.7,
    top: 0,
  },
  retakeButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  foodItemsContainer: {width: '90%', alignSelf: 'center', marginBottom: 20},
  foodItemsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  foodItemContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  foodItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 5,
  },
  nutrientHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  nutrientColumn: {
    flex: 1,
    alignItems: 'center',
  },
  nutrientValue: {fontSize: 16, color: '#333', flex: 1, textAlign: 'center'},
});
