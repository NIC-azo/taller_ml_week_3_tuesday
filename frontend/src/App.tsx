import IADetector from "./components/IADetector";
import { useThemeStore } from "@/store/theme.store";

function App() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* ───────── HEADER: Título + Toggle de Tema ───────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              ♻️ EcoClasifica Ica
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Clasificador inteligente de residuos con IA local
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={`
              p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 
                      text-gray-700 dark:text-gray-200
                      hover:bg-gray-200 dark:hover:bg-gray-600 
                      transition-all duration-200 shadow-sm
                      ${
                        theme === "light" ? (
                          <i className="fas fa-moon"></i>
                        ) : (
                          <i className="fas fa-sun"></i>
                        )
                      }`}
            aria-label={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
            title="Cambiar tema"
          >
            {theme === "light" ? (
              <i className="fas fa-moon text-lg" aria-hidden="true" />
            ) : (
              <i className="fas fa-sun text-lg" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* ───────── CONTENIDO PRINCIPAL ───────── */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Tarjeta de presentación del proyecto */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 md:p-7 mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">
            🎯 Clasificación en Tiempo Real
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
            Apunta tu cámara a un residuo y la inteligencia artificial lo
            clasificará instantáneamente. Funciona 100% en tu dispositivo:
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {" "}
              sin internet, sin privacidad comprometida
            </span>
            .
          </p>
        </div>

        {/* Componente de detección IA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 md:p-7 border border-gray-100 dark:border-gray-700">
          <IADetector />
        </div>

        {/* ───────── FOOTER: Información Técnica ───────── */}
        <footer className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500 space-y-2">
          <p>
            Desarrollado con <span className="text-red-500">♥</span> para Ica •
            TensorFlow.js + Teachable Machine
          </p>
          <p className="text-[10px] opacity-75">
            Inferencia local offline • Modelo MobileNet con transfer learning •
            Código abierto para fines educativos
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
