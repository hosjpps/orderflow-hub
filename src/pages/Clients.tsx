import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    loadClients();
  }, [filters]);

  const loadClients = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("users")
        .select(`
          *,
          orders!inner(*)
        `)
        .order("created_at", { ascending: false });

      // Применяем фильтры
      if (filters.searchQuery) {
        query = query.or(
          `username.ilike.%${filters.searchQuery}%,first_name.ilike.%${filters.searchQuery}%,id.eq.${filters.searchQuery}`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Обрабатываем данные для таблицы
      const processedClients = data?.map((user: any) => {
        const userOrders = user.orders || [];
        const currentOrder = userOrders.find((o: any) => 
          ["new", "in_progress"].includes(o.status)
        );

        return {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          created_at: user.created_at,
          last_activity: user.last_activity,
          current_order: currentOrder,
          total_orders: userOrders.length,
          total_spent: user.total_spent,
          bonus_balance: user.bonus_balance,
        };
      }) || [];

      setClients(processedClients);
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список клиентов",
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Клиенты</h1>
            <p className="text-muted-foreground mt-1">
              Управление клиентами и их заказами
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить клиента
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FiltersPanel onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
            <ClientsTable clients={clients} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clients;
