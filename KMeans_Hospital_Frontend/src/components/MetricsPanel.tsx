import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, MapPin } from "lucide-react";

interface MetricsPanelProps {
  optimalClusters: number;
  totalNeighborhoods: number;
  totalHospitals: number;
}

export const MetricsPanel = ({ optimalClusters, totalNeighborhoods, totalHospitals }: MetricsPanelProps) => {
  const avgNeighborhoodsPerHospital = Math.round(totalNeighborhoods / totalHospitals);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Clusters Óptimos
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-primary">
            {optimalClusters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Número recomendado según el análisis
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Cobertura Promedio
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-secondary">
            {avgNeighborhoodsPerHospital}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vecindarios por hospital
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-medical-green/10 to-medical-green/5 border-medical-green/20">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            Eficiencia
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-medical-green">
            {totalHospitals >= optimalClusters ? "Alta" : "Media"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Distribución de recursos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
