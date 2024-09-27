import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Main from "./pages/Main/Main";
import SavedRecipesPage from "./pages/Main/SavedRecipe/SavedRecipe";
import ViewRecipe from "./pages/Main/ViewRecipe/ViewRecipe";

const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <Main /> },
        { path: "/saved-recipes", element: <SavedRecipesPage /> },
        { path: "/recipes/:id", element: <ViewRecipe /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;
