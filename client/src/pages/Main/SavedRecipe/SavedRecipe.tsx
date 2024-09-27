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

  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecipes = recipes.filter((recipe: Recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteRecipe = (id: string) => {
    const updatedRecipes = recipes.filter((recipe: Recipe) => recipe.id !== id);
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
    <div className="h-full bg-gradient-to-br from-purple-100 via-white to-indigo-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-purple-800 flex items-center">
              <BookOpen className="mr-4 text-indigo-600" size={36} />
              Saved Recipes
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-full border border-purple-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-none"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                size={20}
              />
            </div>
          </div>

          <div className="h-[calc(100vh-12rem)] overflow-y-auto">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredRecipes.map((recipe: Recipe) => (
                  <motion.div
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white h-[50vh] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-purple-200">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 h-[30%]">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold">
                            {recipe.name}
                          </h3>
                        </div>
                      </div>
                      <div className="p-4 h-[50%]">
                        <div className="flex justify-between items-center mb-4">
                          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                            <Clock size={14} className="mr-1" />
                            {recipe.minutes} minutes
                          </span>{" "}
                          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                            <ShoppingBasket size={14} className="mr-1" />
                            {recipe.n_ingredients} ingredients
                          </span>{" "}
                        </div>
                        <p className="text-sm text-gray-600">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center h-[20%]">
                        <button
                          className="text-purple-600 border border-purple-600 hover:bg-purple-50 font-semibold py-2 px-4 rounded"
                          onClick={() =>
                            navigate(`/recipes/${recipe.id}`)
                          }
                        >
                          View Recipe
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
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
