import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

import { Point, Hospital } from "@/types/kmeans";
import HospitalIcon from "./ui/hospitalIcon";

// Paleta estática de colores CSS (opcional, se usará el generador dinámico si k > 5)
const CLUSTER_COLORS = [
  "hsl(var(--cluster-1))",
  "hsl(var(--cluster-2))",
  "hsl(var(--cluster-3))",
  "hsl(var(--cluster-4))",
  "hsl(var(--cluster-5))",
];

interface ScatterPlotProps {
  neighborhoods: Point[];
  hospitals?: Hospital[];
  title: string;
  showClusters?: boolean;
  planeSize: number;
}

// 1. FUNCIÓN DE GENERACIÓN DINÁMICA DE COLORES
// Esto asegura que cada cluster (hospital) tenga un color único, incluso si k > 5.
const generateClusterColor = (clusterIndex: number, k: number): string => {
  if (k === 0) return "gray";

  // Distribuye los colores uniformemente a lo largo de la rueda de color (360 grados).
  const hue = (clusterIndex * (360 / k)) % 360;

  // Asignamos una saturación y luminosidad constante para un buen contraste.
  const saturation = 70;
  const lightness = 60;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// 2. FUNCIÓN DE MAPEO DE PESO A TAMAÑO DE BURBUJA
// Esto convierte el 'weight' (población) en un tamaño de radio 'z' visible en el gráfico.
const mapWeightToSize = (weight: number) => {
  // Usamos raíz cuadrada para escalar grandes diferencias de población y +5 para visibilidad.
  return Math.sqrt(weight) / 15 + 5;
};

export const ScatterPlot = ({
  neighborhoods,
  hospitals,
  title,
  showClusters = false,
  planeSize,
}: ScatterPlotProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES").format(Math.round(num));
  };

  // 3. OBTENER K DINÁMICAMENTE
  const k = hospitals?.length || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-semibold text-foreground">
            {data.type === "hospital" ? "🏥 Hospital" : "🏘️ Vecindario"} #
            {data.id}
          </p>
          <p className="text-xs text-muted-foreground">
            X: {formatNumber(data.x)}, Y: {formatNumber(data.y)}
          </p>
          {data.type === "neighborhood" && (
            <p className="text-xs font-medium text-[hsl(var(--medical-blue))] mt-1">
            </p>
          )}
          {showClusters && data.cluster !== undefined && (
            <p className="text-xs text-muted-foreground">
              Cluster: {data.cluster + 1}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // 4. PREPARAR DATOS (Añadir 'z' para el tamaño de la burbuja)
  const neighborhoodData = neighborhoods.map((n) => ({
    ...n,
    type: "neighborhood",
    z: 10,
  }));

  const hospitalData =
    hospitals?.map((h) => ({
      ...h,
      type: "hospital",
      z: 10, // Tamaño fijo para el icono del hospital
    })) || [];

  const formatAxisTick = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="w-full h-[500px] bg-card rounded-lg p-4 shadow-lg border border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, planeSize]}
            stroke="hsl(var(--foreground))"
            tickFormatter={formatAxisTick}
            label={{
              value: "Coordenada X",
              position: "bottom",
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, planeSize]}
            stroke="hsl(var(--foreground))"
            tickFormatter={formatAxisTick}
            label={{
              value: "Coordenada Y",
              angle: -90,
              position: "left",
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              paddingLeft: "20px",
            }}
          />

          {/* Vecindarios (Burbujas Ponderadas) */}
          <Scatter
            name="Vecindarios"
            data={neighborhoodData}
            dataKey="z" // Usa 'z' para el tamaño de la burbuja
            fill="#8884d8"
          >
            {neighborhoodData.map((entry, index) => {
              let cellFillColor = "hsl(var(--medical-blue))";

              if (showClusters && entry.cluster !== undefined && k > 0) {
                // Usar paleta CSS estática para k <= 5, si está definida.
                // Usar generación dinámica para k > 5 o si se prefiere.
                if (k <= CLUSTER_COLORS.length) {
                  cellFillColor = CLUSTER_COLORS[entry.cluster];
                } else {
                  cellFillColor = generateClusterColor(entry.cluster, k);
                }
              }

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={cellFillColor}
                  opacity={0.8}
                />
              );
            })}
          </Scatter>

          {/* Hospitales */}
          {hospitals && hospitals.length > 0 && (
            <Scatter
              name="Hospitales"
              data={hospitalData}
              shape={<HospitalIcon size={30} imagePath="/public/hospital.png" />}
              fill="hsl(var(--hospital-red))"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
