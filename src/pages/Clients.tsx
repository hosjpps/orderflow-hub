import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    id: "",
    username: "",
    first_name: "",
  });

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

  const handleAddClient = async () => {
    try {
      if (!newClient.id || !newClient.username) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля (Telegram ID и Username)",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("users").insert([
        {
          id: parseInt(newClient.id),
          username: newClient.username,
          first_name: newClient.first_name || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Клиент добавлен",
      });

      setIsAddDialogOpen(false);
      setNewClient({ id: "", username: "", first_name: "" });
      loadClients();
    } catch (error) {
      console.error("Ошибка добавления клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить клиента",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Экспорт",
      description: "Функция экспорта в разработке",
    });
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
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить клиента
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить нового клиента</DialogTitle>
                  <DialogDescription>
                    Введите данные клиента из Telegram
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="telegram-id">Telegram ID *</Label>
                    <Input
                      id="telegram-id"
                      type="number"
                      placeholder="123456789"
                      value={newClient.id}
                      onChange={(e) =>
                        setNewClient({ ...newClient, id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="@username"
                      value={newClient.username}
                      onChange={(e) =>
                        setNewClient({ ...newClient, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Имя</Label>
                    <Input
                      id="first-name"
                      placeholder="Иван"
                      value={newClient.first_name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, first_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddClient}>Добавить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
