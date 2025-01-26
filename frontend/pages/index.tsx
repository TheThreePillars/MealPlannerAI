import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export default function Home() {
  const [meals, setMeals] = useState<any[]>([]);
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [aiMealSuggestion, setAiMealSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch user session
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    getUser();
  }, []);

  // Fetch saved meals from Supabase
  useEffect(() => {
    async function fetchMeals() {
      let { data, error } = await supabase.from("meals").select("*");
      if (error) console.error("Error fetching meals:", error);
      else setMeals(data || []);
    }
    fetchMeals();
  }, []);

  // Add a new meal
  async function addMeal() {
    if (!mealName || !calories) return;
    
    let { data, error } = await supabase
      .from("meals")
      .insert([{ name: mealName, calories: parseInt(calories) }]);
    
    if (error) console.error("Error adding meal:", error);
    else setMeals([...meals, ...(data || [])]);

    setMealName("");
    setCalories("");
  }

  // Delete a meal
  async function deleteMeal(id: number) {
    let { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) console.error("Error deleting meal:", error);
    else setMeals(meals.filter((meal) => meal.id !== id));
  }

  // Generate AI-based meal suggestion
  async function generateMeal() {
    setLoading(true);
    
    let response = await fetch("/api/generate_meal", {
      method: "POST",
      body: JSON.stringify({ diet: "balanced", calories: 600 }),
    });

    let result = await response.json();
    setAiMealSuggestion(result.meal_suggestion);
    setLoading(false);
  }

  // Handle authentication
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Error signing in:", error);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex flex-col items-center justify-center min-h-screen p-6`}>
      <h1 className="text-4xl font-bold text-blue-500">Meal Planner AI 🍽️</h1>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {!user ? (
        <button
          onClick={signInWithGoogle}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Sign in with Google
        </button>
      ) : (
        <button
          onClick={signOut}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      )}

      {user && (
        <>
          <div className="flex flex-col items-center mt-6">
            <h2 className="text-xl font-semibold">Add a New Meal</h2>
            <input
              type="text"
              placeholder="Meal Name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="mt-2 p-2 border rounded text-black"
            />
            <input
              type="number"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="mt-2 p-2 border rounded text-black"
            />
            <button
              onClick={addMeal}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Meal
            </button>
          </div>

          <h2 className="text-xl font-semibold mt-6">Your Saved Meals</h2>
          <ul className="mt-4">
            {meals.length > 0 ? (
              meals.map((meal) => (
                <li key={meal.id} className="bg-white text-black p-2 rounded shadow mt-2 flex justify-between items-center">
                  <span>{meal.name} - {meal.calories} kcal</span>
                  <button onClick={() => deleteMeal(meal.id)} className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">❌</button>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No meals saved yet.</p>
            )}
          </ul>

          <button
            onClick={generateMeal}
            className="mt-6 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
          >
            {loading ? "Generating..." : "Generate AI Meal Plan"}
          </button>

          {aiMealSuggestion && (
            <p className="mt-4 p-4 bg-white text-black shadow">{aiMealSuggestion}</p>
          )}
        </>
      )}
    </div>
  );
}
