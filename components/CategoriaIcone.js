import React from 'react';
import {
  Sandwich, Pizza, Fish, Flame, Salad, Wheat, Beef, Grape, Utensils,
} from 'lucide-react-native';

// Ícone lucide intencional por categoria — substitui os emojis de comida.
const MAP = {
  'Hambúrgueres': Sandwich,
  'Pizzas': Pizza,
  'Japonês': Fish,
  'Mexicano': Flame,
  'Saudável': Salad,
  'Massas': Wheat,
  'Churrasco': Beef,
  'Açaí': Grape,
};

export default function CategoriaIcone({ categoria, size = 24, color, strokeWidth = 2 }) {
  const Cmp = MAP[categoria] || Utensils;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
