import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Point, Hospital } from "@/types/kmeans";

interface ScatterPlotProps {
  neighborhoods: Point[];
  hospitals?: Hospital[];
  title: string;
  showClusters?: boolean;
  planeSize: number;
}

const CLUSTER_COLORS = [
  "hsl(var(--cluster-1))",
  "hsl(var(--cluster-2))",
  "hsl(var(--cluster-3))",
  "hsl(var(--cluster-4))",
  "hsl(var(--cluster-5))",
];

export const ScatterPlot = ({ neighborhoods, hospitals, title, showClusters = false, planeSize }: ScatterPlotProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(num));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-semibold text-foreground">
            {data.type === "hospital" ? "🏥 Hospital" : "🏘️ Vecindario"} #{data.id}
          </p>
          <p className="text-xs text-muted-foreground">
            X: {formatNumber(data.x)}, Y: {formatNumber(data.y)}
          </p>
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

  const neighborhoodData = neighborhoods.map((n) => ({
    ...n,
    type: "neighborhood",
  }));

  const hospitalData = hospitals?.map((h) => ({
    ...h,
    type: "hospital",
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
            label={{ value: "Coordenada X", position: "bottom", fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, planeSize]}
            stroke="hsl(var(--foreground))"
            tickFormatter={formatAxisTick}
            label={{ value: "Coordenada Y", angle: -90, position: "left", fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical"         
                  align="right"             
                  verticalAlign="middle"    
                  wrapperStyle={{      
                  paddingLeft: "20px"    
                  }}
            />
          
          {/* Vecindarios */}
          <Scatter
            name="Vecindarios"
            data={neighborhoodData}
            shape="circle"
          >
            {neighborhoodData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={showClusters && entry.cluster !== undefined
                  ? CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]
                  : "hsl(var(--medical-blue))"}
                opacity={0.8}
              />
            ))}
          </Scatter>

          {/* Hospitales */}
          {hospitals && hospitals.length > 0 && (
            <Scatter
              name="Hospitales"
              data={hospitalData}
              shape="diamond"
              fill="hsl(var(--hospital-red))"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};