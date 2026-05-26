import { useEffect, useState, useRef } from "react";
import * as tmImage from "@teachablemachine/image";
import * as tf from "@tensorflow/tfjs";
import {
  type Prediction,
  getCategoryConfig,
  formatProbability,
} from "@/types/ml.types";

export default function IADetector() {
  // estados para manipular el DOM
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // estado para almacenar la predicción actual
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [prediction, setPrediction] = useState<Prediction[]>([]);
  // Cargar el modelo al montar el componente
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);

  /**
   * Carga el modelo de Teachable Machine al montar el componente
   * Usa useEffect para ejecutar solo una vez
   * Maneja estados de carga y error para feedback al usuario
   */
  useEffect(() => {
    async function loadModel() {
      try {
        // espera a que TensorFlow.js esté listo antes de cargar el modelo
        await tf.ready();
        // ruta a archivos en el public/model
        const modelURL = "/model/model.json";
        const metadataURL = "/model/metadata.json";
        // carga el modelo usando la API de Teachable Machine
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setLoading(false);
      } catch (error: any) {
        console.error("Error al cargar el modelo:", error);
        setError("No se pudo cargar el modelo. Intenta recargar la página.");
        setLoading(false);
      }
    }
    loadModel();
  }, []);
  /**
   * Inicia la webcam y el loop de predicción cuando el modelo esté cargado
   * Usa useEffect para ejecutar cuando el modelo cambie
   * Maneja errores comunes de acceso a la cámara para mejor UX
   * Limpia recursos (stream y animación) al desmontar el componente
   */
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;
    async function startWebcam() {
      if (!model || !videoRef.current || !canvasRef.current) return;

      try {
        // Solicita acceso a la cámara con restricciones para optimizar el rendimiento
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Usa la cámara trasera si está disponible
            width: { ideal: 224 },
            height: { ideal: 224 },
          },
          audio: false,
        });

        videoRef.current.srcObject = stream;
        setWebcamActive(true);
        // Esperar a que el video esté listo antes de configurar el canvas
        await new Promise((resolve) => {
          videoRef.current!.addEventListener(
            "loadedmetadata",
            () => resolve(true),
            { once: true },
          );
        });
        await videoRef.current.play();
        // Configura el canvas para que coincida con las dimensiones del video
        canvasRef.current!.width = videoRef.current!.videoWidth;
        canvasRef.current!.height = videoRef.current!.videoHeight;
        //
        async function predictLoop() {
          if (!model || !videoRef.current || !canvasRef.current) return;
          // Dibuja el frame actual del video en el canvas para preprocesamiento
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              videoRef.current,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height,
            );
          }
          // Realiza la predicción usando el modelo cargado
          const rawPredictions = await model.predict(canvasRef.current);
          // Formatea las predicciones para mostrar solo las 3 más probables con porcentaje
          const formatted: Prediction[] = rawPredictions.map((pred) => ({
            className: pred.className,
            probability: Math.round(pred.probability * 100) / 100, // Formatea a porcentaje con 2 decimales
          }));
          setPrediction(formatted); // Muestra todas las predicciones
          // Continúa el loop de predicción
          animationId = requestAnimationFrame(predictLoop);
        }
        predictLoop(); // Inicia el loop de predicción
      } catch (error: any) {
        console.error("❌ Error en webcam:", error);
        if (error.name === "NotAllowedError") {
          setError(
            "Permiso denegado. Habilita el acceso a la cámara en tu navegador.",
          );
        } else if (error.name === "NotFoundError") {
          setError("No se detectó una cámara en este dispositivo.");
        } else {
          setError("Error accediendo a la cámara. Intenta recargar la página.");
        }
      }
    }
    // Inicia la webcam solo si el modelo se cargó correctamente
    if (model && !error) {
      startWebcam();
    }
    // Limpia recursos al desmontar el componente
    return () => {
      // Limpia el stream de la cámara al desmontar el componente
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      // Cancela la animación del loop de predicción
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [model, error]);
  //
  const dominantPrediction =
    prediction.length > 0
      ? prediction.reduce((max, pred) =>
          pred.probability > max.probability ? pred : max,
        )
      : { className: "Fondo_Control", probability: 0 }; // Predicción por defecto si no hay resultados
  // Obtiene la configuración de la categoría dominante para mostrar el consejo y color correspondiente
  const config = getCategoryConfig(dominantPrediction.className);
  /** */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent mb-4" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Cargando modelo de IA para EcoClasifica...
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Esto solo ocurre la primera vez
        </p>
      </div>
    );
  }
  // Estado: Error
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">
          ⚠️ {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Recargar página
        </button>
      </div>
    );
  }
  // ui principal con video, predicciones y consejos
  return (
    <div className="space-y-6">
      {/* Video y canvas para mostrar la webcam y procesar las imágenes */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-1/2 object-cover"
          aria-label="Vista previa de la cámara para clasificación de residuos"
        />
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        {/* Overlay para mostrar la categoría dominante y el consejo correspondiente */}
        {!webcamActive && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-sm font-medium">
              Esperando cámara...
            </p>
          </div>
        )}
      </div>
      {/* tarjeta destacada: categoría dominante y consejo */}
      <div className={`bg-linear-to-r ${config.gradient} rounded-2xl p-6 text-white shadow-lg transition-all duration-300`}>
        <div className="flex items-center gap-3 mb-2">
          <i className={`${config.icon} text-3xl bg-clip-text bg-linear-to-r from-blue-500 to-purple-500`}></i>
          <div>
            <h3 className="text-sm font-medium opacity-90">Residuo Detectado</h3>
            <p className="text-2xl font-bold">{dominantPrediction.className}</p>
          </div>
        </div>
        <p className="text-lg opacity-95 mb-3">
          {formatProbability(dominantPrediction.probability)}% confianza
        </p>
        <div className="bg-white/20 rounded-lg p-3 text-sm">
          <p className="font-medium">♻️ Contenedor: <span className="font-bold">{config.container}</span></p>
          <p className="opacity-90 mt-1">{config.consejo}</p>
        </div>
      </div>
      {/* Barras de progreso para todas las categorías */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Todas las predicciones:
        </h4>
        {prediction.map((pred) => {
          const predConfig = getCategoryConfig(pred.className);
          const isDominant = pred.className === dominantPrediction.className;
          
          return (
            <div key={pred.className} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <i className={`${predConfig.icon} text-2xl bg-clip-text bg-linear-to-r from-blue-500 to-purple-500`}></i>
                  {pred.className.replace('_', ' ')}
                </span>
                <span className={`font-bold ${isDominant ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                  {formatProbability(pred.probability)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDominant 
                      ? `bg-linear-to-r ${predConfig.gradient}` 
                      : 'bg-gray-400 dark:bg-gray-500'
                  }`}
                  style={{ width: `${pred.probability * 100}%` }}
                  role="progressbar"
                  aria-valuenow={pred.probability * 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${pred.className}: ${formatProbability(pred.probability)}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Nota técnica para el usuario */}
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        Inferencia local con TensorFlow.js • Sin envío de imágenes a servidores
      </div>
    </div>
  );
}
