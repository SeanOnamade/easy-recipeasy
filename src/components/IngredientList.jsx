"use client";
import {useState, useEffect} from "react";

export default function IngredientList() {
    const [ingredients, setIngredients] = useState([]);
    const [input, setInput] = useState("");

    // load ingredients from storage
    useEffect(() => {
        const saved = localStorage.getItem("ingredients");
        if (saved) setIngredients(JSON.parse(saved));
    }, []);

    // save ingredients when they change
    useEffect(() => {
        localStorage.setItem("ingredients", JSON.stringify(ingredients));
    }, [ingredients]);

    const addIngredient = () => {
        if (!input.trim()) return;
        setIngredients([...ingredients, input.trim()]);
        setInput("");
    };

    const removeIngredient = (item) => {
        setIngredients(ingredients.filter((i) => i !== item));
    };

    return (
        <div>
                <div className="flex gap-3 mb-4">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Add an ingredient..."
                        className="flex-grow border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                    />
                    <button
                        onClick={addIngredient}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5"
                    >
                        Add
                    </button>
                </div>
                {ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ingredients.map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between bg-green-900/20 border border-green-700 rounded-lg p-3 group hover:bg-green-900/30 transition-all duration-200"
                            >
                                <span className="text-green-300 font-medium">{item}</span>
                                <button
                                    onClick={() => removeIngredient(item)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full p-1 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2 text-gray-600">⚡</div>
                        <p>No ingredients added yet</p>
                    </div>
                )}
        </div>
    );


}