import { useState, useEffect } from "react";
import { InputForm } from "@/components/InputForm";
import { ScatterPlot } from "@/components/ScatterPlot";
import { MetricsPanel } from "@/components/MetricsPanel";
import { runKMeansAPI, checkAPIHealth } from "@/services/api";
import { KMeansResult } from "@/types/kmeans";
import { toast } from "sonner";
import { Activity, AlertCircle } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<KMeansResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputParams, setInputParams] = useState<{ hospitals: number; neighborhoods: number; planeSize: number } | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  // Verificar conexión con el backend al cargar
  useEffect(() => {
    const checkBackend = async () => {
      const isHealthy = await checkAPIHealth();
      setBackendStatus(isHealthy ? "connected" : "disconnected");
      if (!isHealthy) {
        toast.error("No se puede conectar con el servidor backend");
      }
    };
    checkBackend();
  }, []);

  const handleSubmit = async (hospitals: number, neighborhoods: number, planeSize: number) => {
    if (backendStatus !== "connected") {
      toast.error("El servidor backend no está disponible");
      return;
    }

    setIsLoading(true);
    setInputParams({ hospitals, neighborhoods, planeSize });

    toast.info("Ejecutando algoritmo K-means en el servidor...");

    try {
      const kmeansResult = await runKMeansAPI(neighborhoods, hospitals, planeSize);
      setResult(kmeansResult);
      toast.success("¡Análisis completado exitosamente!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al procesar los datos";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Optimización de Hospitales
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Análisis inteligente de distribución de hospitales usando clustering K-means
          </p>
          {/* Estado del backend */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div
              className={`w-3 h-3 rounded-full ${
                backendStatus === "connected"
                  ? "bg-green-500"
                  : backendStatus === "disconnected"
                  ? "bg-red-500"
                  : "bg-yellow-500 animate-pulse"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {backendStatus === "connected"
                ? "Backend conectado"
                : backendStatus === "disconnected"
                ? "Backend desconectado"
                : "Verificando conexión..."}
            </span>
          </div>
          {backendStatus === "disconnected" && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>Asegúrate de que el servidor backend esté ejecutándose</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Results */}
        {result && inputParams && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metrics */}
            <MetricsPanel
              optimalClusters={result.optimalClusters}
              totalNeighborhoods={inputParams.neighborhoods}
              totalHospitals={inputParams.hospitals}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScatterPlot
                neighborhoods={result.neighborhoods}
                title="Distribución Inicial de Vecindarios"
                showClusters={false}
                planeSize={inputParams.planeSize}
              />
              
              <ScatterPlot
                neighborhoods={result.neighborhoods}
                hospitals={result.hospitals}
                title="Distribución Optimizada con Clusters"
                showClusters={true}
                planeSize={inputParams.planeSize}
              />
            </div>

            {/* Info Cards */}
            <div className="bg-accent rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                📊 Interpretación de Resultados
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Clusters Óptimos:</strong> Basado en el método de la silueta para minimizar la distancia intra-cluster</li>
                <li>• <strong>Distribución de Colores:</strong> Cada color representa un cluster asignado a un hospital</li>
                <li>• <strong>Ubicación Óptima (Hospitales):</strong> Punto geográfico ideal calculado para la ubicación de un hospital.</li>
                <li>• <strong>Vecindarios (círculos):</strong> Asignados al hospital más cercano</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;