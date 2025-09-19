import { View, Text, FlatList, Pressable, RefreshControl, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "../../services/mealAPI";
import { homeStyles } from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import CategoryFilter from "../../components/CategoryFilter";
import RecipeCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { LinearGradient } from "expo-linear-gradient";
import { useClerk } from "@clerk/clerk-expo";

// Static mapping for welcome icons
const animalImages = [
  require("../../assets/images/lamb.png"),
  require("../../assets/images/chicken.png"),
  require("../../assets/images/pork.png"),
];

const HomeScreen = () => {
  const router = useRouter();
  const { signOut } = useClerk();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(12),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories = apiCategories.map((cat, index) => ({
        id: index + 1,
        name: cat.strCategory,
        image: cat.strCategoryThumb,
        description: cat.strCategoryDescription,
      }));

      setCategories(transformedCategories);
      if (!selectedCategory) setSelectedCategory(transformedCategories[0].name);

      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
      setRecipes(transformedMeals);

      const transformedFeatured = MealAPI.transformMealData(featuredMeal);
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category) => {
    try {
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals = meals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    await loadCategoryData(category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/sign-in"); // navigate back to sign-in
        },
      },
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) return <LoadingSpinner message="Loading delicious recipes..." />;

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
      numColumns={2}
      columnWrapperStyle={{ gap: 16, paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
      ListHeaderComponent={
        <>
          {/* Header with Logout */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              marginTop: 16,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.text }}>Home</Text>
            <Pressable
              onPress={handleLogout}
              android_ripple={{ color: "#ddd", borderless: true }}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: COLORS.primary,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            </Pressable>
          </View>

          {/* Welcome Icons */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 20 }}>
            {animalImages.map((img, idx) => (
              <Image
                key={idx}
                source={img}
                style={{ width: 80, height: 80, borderRadius: 40 }}
              />
            ))}
          </View>

          {/* Featured Section */}
          {featuredRecipe && (
            <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
              <Pressable
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                android_ripple={{ color: "#eee" }}
                onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
              >
                <View style={{ height: 220, position: "relative" }}>
                  <Image
                    source={{ uri: featuredRecipe.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={500}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60%",
                      justifyContent: "flex-end",
                      padding: 16,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.white }} numberOfLines={2}>
                      {featuredRecipe.title}
                    </Text>
                    <View style={{ flexDirection: "row", marginTop: 8, gap: 16 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="time-outline" size={16} color={COLORS.white} />
                        <Text style={{ color: COLORS.white }}>{featuredRecipe.cookTime}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="people-outline" size={16} color={COLORS.white} />
                        <Text style={{ color: COLORS.white }}>{featuredRecipe.servings}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            </View>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          )}

          {/* Section Header */}
          <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "600", color: COLORS.text }}>
              {selectedCategory}
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 80 }}>
          <Ionicons name="restaurant-outline" size={72} color={COLORS.textLight} />
          <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 12 }}>No recipes found</Text>
          <Text style={{ fontSize: 14, color: COLORS.textLight, marginTop: 4 }}>
            Try a different category
          </Text>
        </View>
      }
    />
  );
};

export default HomeScreen;
