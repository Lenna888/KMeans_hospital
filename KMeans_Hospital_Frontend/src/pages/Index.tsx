import { useState } from "react";
import { InputForm } from "@/components/InputForm";
import { ScatterPlot } from "@/components/ScatterPlot";
import { MetricsPanel } from "@/components/MetricsPanel";
import { simulateKMeans } from "@/utils/kmeansSimulation";
import { KMeansResult } from "@/types/kmeans";
import { toast } from "sonner";
import { Activity } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<KMeansResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputParams, setInputParams] = useState<{ hospitals: number; neighborhoods: number; planeSize: number } | null>(null);

  const handleSubmit = async (hospitals: number, neighborhoods: number, planeSize: number) => {
    setIsLoading(true);
    setInputParams({ hospitals, neighborhoods, planeSize });
    
    toast.info("Ejecutando algoritmo K-means...");

    // Simular procesamiento
    setTimeout(() => {
      try {
        const kmeansResult = simulateKMeans(neighborhoods, hospitals, planeSize);
        setResult(kmeansResult);
        toast.success("¡Análisis completado exitosamente!");
      } catch (error) {
        toast.error("Error al procesar los datos");
      } finally {
        setIsLoading(false);
      }
    }, 1500);
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
                <li>• <strong>Clusters Óptimos:</strong> Basado en el método del codo para minimizar la distancia intra-cluster</li>
                <li>• <strong>Distribución de Colores:</strong> Cada color representa un cluster asignado a un hospital</li>
                <li>• <strong>Hospitales (diamantes rojos):</strong> Ubicados en el centroide de cada cluster</li>
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