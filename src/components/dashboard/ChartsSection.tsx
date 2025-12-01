import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(270, 91%, 60%)'];

interface ChartsSectionProps {
  chartData: { date: string; count: number; amount: number }[];
  servicesData: any[];
}

export const ChartsSection = ({ chartData, servicesData }: ChartsSectionProps) => {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");

  // Фильтруем данные в зависимости от выбранного периода
  const filteredData = period === "7d" 
    ? chartData.slice(-7) 
    : chartData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* График активности клиентов */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Активность клиентов</CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="7d" className="text-xs">7д</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">30д</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredData}>
              <defs>
                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(215, 16%, 57%)"
                tick={{ fill: 'hsl(215, 16%, 57%)' }}
              />
              <YAxis 
                stroke="hsl(215, 16%, 57%)"
                tick={{ fill: 'hsl(215, 16%, 57%)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(217, 33%, 12%)', 
                  border: '1px solid hsl(217, 33%, 17%)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(217, 91%, 60%)" 
                strokeWidth={3}
                fill="url(#colorClients)"
                dot={{ fill: 'hsl(217, 91%, 60%)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* График выручки */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Выручка по дням</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(215, 16%, 57%)"
                tick={{ fill: 'hsl(215, 16%, 57%)' }}
              />
              <YAxis 
                stroke="hsl(215, 16%, 57%)"
                tick={{ fill: 'hsl(215, 16%, 57%)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(217, 33%, 12%)', 
                  border: '1px solid hsl(217, 33%, 17%)',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${value} ₽`}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(217, 91%, 60%)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Распределение услуг */}
      <Card className="bg-gradient-card border-border/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Распределение услуг</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="count"
              >
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(217, 33%, 12%)', 
                  border: '1px solid hsl(217, 33%, 17%)',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="middle" 
                align="right"
                layout="vertical"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
