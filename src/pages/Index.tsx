import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { Users, ShoppingCart, DollarSign, TrendingUp, Star, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    activeOrders: 0,
    revenueMonth: 0,
    avgCheck: 0,
    conversionRate: 0,
    newToday: 0,
  });

  // Генерация данных для графиков (30 дней)
  const generateChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      data.push({
        date: dateStr,
        count: Math.floor(Math.random() * 20) + 10,
        amount: Math.floor(Math.random() * 30000) + 40000,
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  const servicesData = [
    { name: "Консультация", count: 45, percent: 30 },
    { name: "Проверка работы", count: 35, percent: 23 },
    { name: "Решение задач", count: 40, percent: 27 },
    { name: "Подготовка", count: 20, percent: 13 },
    { name: "Реферат", count: 10, percent: 7 },
  ];

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Загружаем метрики из базы данных
      const { count: totalClients } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { count: activeOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "in_progress"]);

      // Выручка за текущий месяц
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders } = await supabase
        .from("orders")
        .select("final_price")
        .eq("status", "paid")
        .gte("created_at", startOfMonth.toISOString());

      const revenueMonth = monthlyOrders?.reduce((sum, order) => sum + Number(order.final_price), 0) || 0;

      // Средний чек
      const { data: paidOrders } = await supabase
        .from("orders")
        .select("final_price")
        .eq("status", "paid");

      const avgCheck = paidOrders?.length 
        ? paidOrders.reduce((sum, order) => sum + Number(order.final_price), 0) / paidOrders.length 
        : 0;

      // Конверсия
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const conversionRate = totalOrders ? ((paidOrders?.length || 0) / totalOrders) * 100 : 0;

      // Новые клиенты сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: newToday } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      setMetrics({
        totalClients: totalClients || 0,
        activeOrders: activeOrders || 0,
        revenueMonth: revenueMonth,
        avgCheck: avgCheck,
        conversionRate: conversionRate,
        newToday: newToday || 0,
      });
    } catch (error) {
      console.error("Ошибка загрузки метрик:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            title="Всего клиентов"
            value={metrics.totalClients}
            change={15}
            icon={Users}
            trend="up"
            loading={loading}
          />
          <MetricsCard
            title="Активные заказы"
            value={metrics.activeOrders}
            change={8}
            icon={ShoppingCart}
            trend="up"
            loading={loading}
          />
          <MetricsCard
            title="Выручка за месяц"
            value={`${Math.round(metrics.revenueMonth).toLocaleString()} ₽`}
            change={23}
            icon={DollarSign}
            trend="up"
            loading={loading}
          />
          <MetricsCard
            title="Средний чек"
            value={`${Math.round(metrics.avgCheck).toLocaleString()} ₽`}
            change={-5}
            icon={TrendingUp}
            trend="down"
            loading={loading}
          />
          <MetricsCard
            title="Конверсия"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            change={12}
            icon={Activity}
            trend="up"
            loading={loading}
          />
          <MetricsCard
            title="Новые за сегодня"
            value={metrics.newToday}
            icon={Star}
            loading={loading}
          />
        </div>

        {/* Графики */}
        <ChartsSection
          chartData={chartData}
          servicesData={servicesData}
        />
      </main>
    </div>
  );
};

export default Index;
