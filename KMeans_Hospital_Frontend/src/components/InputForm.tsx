import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital, Home, Grid3x3 } from "lucide-react";

interface InputFormProps {
  onSubmit: (hospitals: number, neighborhoods: number, planeSize: number) => void;
  isLoading?: boolean;
}

export const InputForm = ({ onSubmit, isLoading = false }: InputFormProps) => {
  const [hospitals, setHospitals] = useState<string>("3");
  const [neighborhoods, setNeighborhoods] = useState<string>("50");
  const [planeSize, setPlaneSize] = useState<string>("1000000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hospitals);
    const n = parseInt(neighborhoods);
    const p = parseInt(planeSize);

    if (h >= 1 && h <= 1000000 && n >= 2 && n <= 1000000 && p >= 1 && p <= 1000000) {
      onSubmit(h, n, p);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">
          Optimización de Hospitales
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Ingresa los parámetros para analizar la distribución óptima
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hospitals" className="flex items-center gap-2 text-foreground">
              <Hospital className="h-4 w-4 text-hospital" />
              Número de Hospitales
            </Label>
            <Input
              id="hospitals"
              type="number"
              min="1"
              max="1000000"
              value={hospitals}
              onChange={(e) => setHospitals(e.target.value)}
              className="bg-background border-border"
              placeholder="Ej: 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhoods" className="flex items-center gap-2 text-foreground">
              <Home className="h-4 w-4 text-medical-blue" />
              Número de Vecindarios
            </Label>
            <Input
              id="neighborhoods"
              type="number"
              min="2"
              max="1000000"
              value={neighborhoods}
              onChange={(e) => setNeighborhoods(e.target.value)}
              className="bg-background border-border"
              placeholder="Ej: 50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planeSize" className="flex items-center gap-2 text-foreground">
              <Grid3x3 className="h-4 w-4 text-primary" />
              Tamaño del Plano (m × m)
            </Label>
            <Input
              id="planeSize"
              type="number"
              min="1"
              max="1000000000000"
              value={planeSize}
              onChange={(e) => setPlaneSize(e.target.value)}
              className="bg-background border-border"
              placeholder="Ej: 1000000"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Analizando..." : "Analizar Distribución"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
