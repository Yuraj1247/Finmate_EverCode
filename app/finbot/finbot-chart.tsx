"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface FinBotChartProps {
  data: {
    type: "bar" | "line" | "pie"
    data: any[]
    config?: {
      xKey?: string
      yKey?: string
      dataKey?: string
      nameKey?: string
      colors?: string[]
    }
  }
}

export function FinBotChart({ data }: FinBotChartProps) {
  const { type, data: chartData, config } = data

  // Default colors
  const defaultColors = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#84cc16", // lime-500
  ]

  const colors = config?.colors || defaultColors

  // Render appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config?.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={config?.yKey || "value"} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config?.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={config?.yKey || "value"} stroke="#3b82f6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={config?.dataKey || "value"}
                nameKey={config?.nameKey || "name"}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Unsupported chart type</div>
    }
  }

  return renderChart()
}
