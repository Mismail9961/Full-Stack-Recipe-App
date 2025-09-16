import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";  // ✅ fixed spelling
import { eq } from "drizzle-orm";

const app = express();
const PORT = ENV.PORT || 5001;

// Middleware
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// Add favorite
app.post("/api/favorites", async (req, res) => {
  try {
    console.log("📩 Incoming headers:", req.headers);
    console.log("📦 Incoming body:", req.body);

    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId: Number(recipeId),
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json({ success: true, favorite: newFavorite });
  } catch (error) {
    console.error("❌ Error adding favorite:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Delete favorite
app.get("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    if (!userId || !recipeId) {
      return res.status(400).json({ error: "Missing required params" });
    }

    const deleted = await db
      .delete(favoritesTable)
      .where(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.recipeId, parseInt(recipeId))
      )
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ success: false, message: "Favorite not found" });
    }

    res.status(200).json({ success: true, deleted });
  } catch (error) {
    console.error("❌ Error removing favorite:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get all favorites for a user
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json({ success: true, favorites: userFavorites });
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});



// Start server
app.listen(PORT, () => {
  console.log("✅ Server is running on port", PORT);
});
