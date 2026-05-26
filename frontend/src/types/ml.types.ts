export interface Prediction {
    className: string;
    probability: number; // valor entre 0 y 1
}

/**
 * Configuración visual y de contenido para cada categoría de residuo
 * Permite mantener la UI desacoplada de la lógica de inferencia
 */
export interface CategoryConfig {
  color: string;        // Clase de Tailwind para el color principal
  gradient: string;     // Gradiente para la tarjeta destacada
  icon: string;        // icon representativo
  container: string;    // Color del contenedor de reciclaje
  consejo: string;      // Consejo ecológico contextual para Ica
}

/**
 * Diccionario de configuración para las 5 clases del modelo
 * Las claves DEBEN coincidir exactamente con los nombres en metadata.json
 */
export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'Orgánico': {
    color: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-600',
    icon: 'fa-solid fa-apple-whole',
    container: 'VERDE',
    consejo: 'Úsalo para compostaje doméstico. ¡Ica lo necesita! 🌱',
  },
  'Plástico': {
    color: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-orange-500',
    icon: 'fa-solid fa-glass-whiskey',
    container: 'AMARILLO',
    consejo: 'Lávalo y aplástalo antes de reciclar. Reduce volumen. ♻️',
  },
  'Papel_Carton': {
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-indigo-600',
    icon: 'fa-solid fa-file-alt',
    container: 'AZUL',
    consejo: 'Evita que se moje. Separa cartón de papel fino. 📦',
  },
  'Vidrio_Metal': {
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-pink-600',
    icon: 'fa-solid fa-glass-whiskey',
    container: 'BLANCO/GRIS',
    consejo: 'Manipula con cuidado. No mezcles vidrios rotos. ⚠️',
  },
  'Fondo_Control': {
    color: 'bg-gray-500',
    gradient: 'from-gray-400 to-gray-600',
    icon: 'fa-solid fa-hand-paper',
    container: 'N/A',
    consejo: 'No hay residuo detectado. Apunta a un objeto para clasificar. 🔍',
  },
};

/**
 * Helper para obtener configuración segura (evita errores si la clase no existe)
 */
export function getCategoryConfig(className: string): CategoryConfig {
  return CATEGORY_CONFIG[className] || CATEGORY_CONFIG['Fondo_Control'];
}

/**
 * Formatea probabilidad de decimal a porcentaje con 2 decimales
 * Ej: 0.9567 → "95.67"
 */
export function formatProbability(prob: number): string {
  return (Math.round(prob * 10000) / 100).toFixed(2);
}