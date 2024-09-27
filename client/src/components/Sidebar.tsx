import { useEffect, useState } from "react";
import { Download, Save, ChevronRight, Github } from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("/");

  const navItems = [
    {
      name: "Recipe Parser",
      icon: <Download />,
      href: "/",
    },
    {
      name: "Saved Recipes",
      icon: <Save />,
      href: "/saved-recipes",
    },
  ];

  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, []);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-purple-700 to-indigo-900 min-w-[20%] h-screen flex flex-col items-center px-4 py-8 text-white shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-8 text-center">
        Recipe Ingredient Parser
      </h2>

      <nav className="flex flex-col gap-4 w-full">
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            className={`flex items-center gap-3 text-lg p-3 rounded-lg transition-all duration-200 ${
              activeItem === item.href
                ? "bg-white bg-opacity-20 shadow-md"
                : "hover:bg-white hover:bg-opacity-10"
            }`}
            onClick={() => setActiveItem(item.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.icon}
            <span>{item.name}</span>
            {activeItem === item.name && (
              <ChevronRight className="ml-auto" size={20} />
            )}
          </motion.a>
        ))}
      </nav>

      <div className="mt-auto w-full">
        <motion.a
          href="https://github.com/annuraggg/Recipe-GPT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm bg-white bg-opacity-10 p-3 rounded-lg hover:bg-opacity-20 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Github size={20} />
          <span>View on GitHub</span>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default Sidebar;
