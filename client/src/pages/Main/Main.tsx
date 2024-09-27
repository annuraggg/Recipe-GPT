import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  ChevronRight,
  X,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  servings: number;
}

interface ImagePrediction {
  class: string;
  probability: number;
}

const RecipeParser: React.FC = () => {
  const [dishName, setDishName] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePredictions, setImagePredictions] = useState<
    ImagePrediction[] | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParseRecipe = async () => {
    if (!dishName.trim()) {
      setError("Please enter a dish name");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/parse-recipe`,
        {
          dish_name: dishName,
        }
      );
      setRecipe(response.data);
    } catch (err) {
      setError("Failed to parse recipe. Please try again.");
      console.error("Error parsing recipe:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setImagePredictions(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/analyze-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.predictions) {
        setImagePredictions(response.data.predictions);
        if (response.data.predictions.length > 0) {
          setDishName(response.data.predictions[0].class);
        }
      }
      if (response.data.recipe) {
        setRecipe(response.data.recipe);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `An error occurred while analyzing the image: ${
            error.response?.data?.error || error.message
          }`
        );
      } else {
        setError(
          "An unexpected error occurred while analyzing the image. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipe = () => {
    if (recipe) {
      const savedRecipes = JSON.parse(
        localStorage.getItem("savedRecipes") || "[]"
      );
      const isAlreadySaved = savedRecipes.some(
        (savedRecipe: Recipe) => savedRecipe.id === recipe.id
      );

      if (!isAlreadySaved) {
        savedRecipes.push(recipe);
        localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
        toast.success("Recipe saved successfully!");
      } else {
        toast.warning("Recipe is already saved!");
      }
    } else {
      toast.error("No recipe to save!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Recipe Parser
            </h1>
            <div className="relative mb-6">
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="Enter dish name"
                className="w-full py-3 px-4 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleParseRecipe}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parse Recipe
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={20} className="inline mr-2" />
                Upload Image
              </button>
            </div>

            {recipe && (
              <button
                onClick={saveRecipe}
                disabled={isLoading}
                className="flex-1 w-full mt-3 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} className="inline mr-2" />
                Save Recipe
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="w-full md:w-1/2 bg-gray-800 p-6 sm:p-8">
            {selectedImage ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected food"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-gray-700 rounded-full p-1 hover:bg-gray-600 transition duration-300"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-600 rounded-lg">
                <p className="text-gray-300">No image uploaded</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-32"
            >
              <div className="loader"></div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-600 text-white p-4 m-6 sm:m-8 rounded-lg flex items-center"
            >
              <AlertCircle size={20} className="mr-2" />
              {error}
            </motion.div>
          )}

          {imagePredictions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 sm:p-8"
            >
              <h3 className="text-2xl font-semibold mb-4 text-white">
                Image Predictions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePredictions.map((pred, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p className="font-medium text-white">
                      {pred.class.charAt(0).toUpperCase() + pred.class.slice(1)}
                    </p>
                    <p className="text-sm text-gray-300">
                      {(pred.probability * 100).toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {recipe && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 sm:p-8"
            >
              <h2 className="text-3xl font-bold mb-4 text-white">
                {recipe.name.charAt(0).toUpperCase() + recipe.name.slice(1)}
              </h2>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  Ingredients
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <ChevronRight
                        size={20}
                        className="text-indigo-400 mr-2 flex-shrink-0"
                      />
                      <span className="text-white">
                        {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-4">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-bold text-indigo-400 mr-3 flex-shrink-0">
                        {index + 1}.
                      </span>
                      <span className="text-white">
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RecipeParser;
