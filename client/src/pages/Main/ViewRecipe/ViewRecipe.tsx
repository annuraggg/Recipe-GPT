import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Share2,
  Printer,
  ShoppingBag,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

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
  nutrition: string;
}

const ViewRecipe = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showNutrition, setShowNutrition] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [recipe, setRecipe] = useState<Recipe>({} as Recipe);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleStep = (index: number) => {
    setActiveStep(index);
  };

  useEffect(() => {
    getRecipe();
  }, []);

  useEffect(() => {
    if (recipe.name) {
      getImage();
    }
  }, [recipe]);

  const getRecipe = async () => {
    setIsLoading(true);
    setError(null);

    const id = window.location.pathname.split("/").pop();
    axios
      .post(`${import.meta.env.VITE_SERVER_ADDRESS}/get-recipe-by-id`, {
        recipe_id: id,
      })
      .then((response) => {
        const processedRecipe: Recipe = {
          name: processString(response.data.name, "title"),
          id: response.data.id,
          ingredients: response.data.ingredients.map((ingredient: string) =>
            processString(ingredient, "sentence")
          ),
          instructions: response.data.instructions.map((instruction: string) =>
            processString(instruction, "sentence")
          ),
          minutes: response.data.minutes,
          tags: response.data.tags,
          description: response.data.description,
          n_steps: response.data.n_steps,
          n_ingredients: response.data.n_ingredients,
          nutrition: response.data.nutrition,
        };
        setRecipe(processedRecipe);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error("Failed to fetch recipe data.");
        setError(error);
        setIsLoading(false);
      });
  };

  const processString = (str: string, stringCase: string) => {
    str = str.replace(/[^a-zA-Z0-9]/g, " ").toLowerCase();

    if (stringCase === "lower") {
      return str.toLowerCase();
    }

    if (stringCase === "upper") {
      return str.toUpperCase();
    }

    if (stringCase === "title") {
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    }

    if (stringCase === "sentence") {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return str;
  };

  const getImage = async () => {
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const CX = import.meta.env.VITE_GOOGLE_CX;

    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`,
        {
          params: {
            q: recipe.name, // Use the recipe name as the query
            searchType: "image",
            key: API_KEY,
            cx: CX,
          },
        }
      );

      const imageUrl = response.data.items[6].link; // Get the first image URL
      setImageUrl(imageUrl);
    } catch (error) {
      toast.error("Failed to fetch image.");
      console.error("Error fetching the image:", error);
    }
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard.");
  };

  const printRecipe = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto bg-gray-800 shadow-2xl overflow-hidden w-full"
      >
        <div className="relative h-96">
          <img
            src={imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full"
          ></motion.button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                <Clock size={16} className="mr-1" />
                {recipe.minutes} minutes
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                <ShoppingBag size={16} className="mr-1" />
                {recipe.n_ingredients} ingredients
              </span>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg"
                onClick={shareLink}
              >
                <Share2 size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg"
                onClick={printRecipe}
              >
                <Printer size={18} />
              </motion.button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Ingredients
            </h2>
            <ul className="grid grid-cols-2 gap-4">
              {recipe?.ingredients?.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start bg-gray-800 p-2 rounded-lg"
                >
                  <Check
                    size={20}
                    className="text-emerald-500 mr-2 flex-shrink-0 mt-1"
                  />
                  <span className="text-white">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Instructions
            </h2>
            {recipe?.instructions?.map((step, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  backgroundColor:
                    activeStep === index ? "rgb(30 41 59)" : "transparent",
                }}
                className="mb-4 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleStep(index)}
                  className="flex justify-between items-center w-full p-4 text-left text-white"
                >
                  <span className="font-medium">Step {index + 1}</span>
                  {activeStep === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                <motion.div
                  initial="collapsed"
                  animate={activeStep === index ? "open" : "collapsed"}
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4 text-white"
                >
                  <p>{step}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="mb-8">
            <button
              onClick={() => setShowNutrition(!showNutrition)}
              className="flex justify-between items-center w-full p-4 bg-gray-700 rounded-lg"
            >
              <span className="font-semibold text-white">
                Nutrition Information (Per Serving)
              </span>
              {showNutrition ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            <motion.div
              initial="collapsed"
              animate={showNutrition ? "open" : "collapsed"}
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {recipe?.nutrition && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">Calories</h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[0]} kcal
                    </p>
                  </div>
                  <div className="bg-emerald-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">Fat</h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[1]} g
                    </p>
                  </div>
                  <div className="bg-blue-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">
                      Carbohydrates
                    </h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[2]} g
                    </p>
                  </div>
                  <div className="bg-purple-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">Fiber</h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[3]} g
                    </p>
                  </div>
                  <div className="bg-amber-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">Protein</h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[4]} g
                    </p>
                  </div>
                  <div className="bg-amber-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">Sugar</h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[5]} g
                    </p>
                  </div>
                  <div className="bg-amber-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">Sodium</h3>
                    <p className="text-white">
                      {JSON.parse(recipe.nutrition)[6]} mg
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewRecipe;
