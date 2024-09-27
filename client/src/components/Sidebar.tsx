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
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 min-w-[20%] h-screen flex flex-col items-start px-6 py-4 text-gray-200 shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-6">Recipe Parser</h2>

      <nav className="flex flex-col gap-4 w-full">
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            className={`flex items-center gap-3 text-lg p-2 rounded-md transition-colors duration-200 ${
              activeItem === item.href
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveItem(item.href)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
            {activeItem === item.href && (
              <ChevronRight className="ml-auto" size={16} />
            )}
          </motion.a>
        ))}
      </nav>

      <div className="mt-auto w-full">
        <motion.a
          href="https://github.com/annuraggg/Recipe-GPT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Github size={18} />
          <span>GitHub</span>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default Sidebar;
