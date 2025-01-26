import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { User } from "@supabase/supabase-js"; // ✅ Import Supabase User type

// ✅ Define Meal type
interface Meal {
  id: number;
  name: string;
  calories: number;
}

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealName, setMealName] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [aiMealSuggestion, setAiMealSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ✅ Fetch user session & keep it updated
  useEffect(() => {
    const getSession = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);
      setUser(session?.session?.user || null);
    };

    getSession();

    // ✅ Listen for auth changes (sign in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setUser(session?.user || null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ✅ Fetch saved meals from Supabase
  useEffect(() => {
    async function fetchMeals() {
      const { data, error } = await supabase.from("meals").select<Meal>("*");
      if (error) console.error("Error fetching meals:", error);
      else setMeals(data || []);
    }
    fetchMeals();
  }, []);

  // ✅ Add a new meal
  async function addMeal() {
    if (!mealName || !calories) return;

    const { data, error } = await supabase
      .from("meals")
      .insert([{ name: mealName, calories: parseInt(calories, 10) }])
      .select("*");

    if (error) console.error("Error adding meal:", error);
    else setMeals([...meals, ...(data || [])]);

    setMealName("");
    setCalories("");
  }

  // ✅ Delete a meal
  async function deleteMeal(id: number) {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) console.error("Error deleting meal:", error);
    else setMeals(meals.filter((meal) => meal.id !== id));
  }

  // ✅ Generate AI-based meal suggestion
  async function generateMeal() {
    setLoading(true);
    try {
      const response = await fetch("/api/generate_meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diet: "balanced", calories: 600 }),
      });

      const result = await response.json();
      setAiMealSuggestion(result.meal_suggestion);
    } catch (error) {
      console.error("Error generating meal:", error);
    }
    setLoading(false);
  }

  // ✅ Handle Google authentication
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
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

      {/* ✅ Dark Mode Toggle */}
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

          {/* ✅ Generate AI meal button */}
          <button
            onClick={generateMeal}
            className="mt-6 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
          >
            {loading ? "Generating..." : "Generate AI Meal Plan"}
          </button>

          {/* ✅ Display AI meal suggestion */}
          {loading && <p className="mt-4 text-gray-500">Generating meal...</p>}
          {aiMealSuggestion && (
            <p className="mt-4 p-4 bg-white text-black shadow">{aiMealSuggestion}</p>
          )}
        </>
      )}
    </div>
  );
}
