import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Search, BookOpen, ShoppingBasket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  minutes: number;
  tags: string[];
  description: string;
  n_steps: number;
  n_ingredients: number;
}

const SavedRecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteRecipe = (id: string) => {
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));
  };

  useEffect(() => {
    const savedRecipes = JSON.parse(
      localStorage.getItem("savedRecipes") || "[]"
    );
    setRecipes(savedRecipes);
  }, []);

  return (
    <div className="h-full bg-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto bg-gray-900 rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-white flex items-center">
              <BookOpen className="mr-4 text-indigo-500" size={36} />
              Saved Recipes
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-72 rounded-full border border-indigo-600 bg-gray-700 text-white focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 outline-none"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500"
                size={20}
              />
            </div>
          </div>

          <div className="h-[calc(100vh-12rem)] overflow-y-auto">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredRecipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-white mb-2">
                          {recipe.name}
                        </h3>
                        <div className="flex justify-between items-center mb-4">
                          <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                            <Clock size={14} className="mr-1" />
                            {recipe.minutes} min
                          </span>
                          <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                            <ShoppingBasket size={14} className="mr-1" />
                            {recipe.n_ingredients} ing.
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
                        <button
                          className="text-white bg-indigo-500 hover:bg-indigo-400 font-semibold py-2 px-4 rounded transition-colors duration-200"
                          onClick={() => navigate(`/recipes/${recipe.id}`)}
                        >
                          View Recipe
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SavedRecipesPage;
