import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Send, Ban, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface OrderDetailsDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailsDialog = ({ orderId, open, onOpenChange }: OrderDetailsDialogProps) => {
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && orderId) {
      loadOrderDetails();
    }
  }, [open, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", orderData.user_id)
        .single();

      if (userError) throw userError;

      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", orderData.user_id);

      setOrder(orderData);
      setUser({ ...userData, total_orders: totalOrders });
    } catch (error) {
      console.error("Ошибка загрузки деталей:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить детали заказа",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Текст скопирован в буфер обмена",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-status-new/20 text-status-new",
      in_progress: "bg-status-inProgress/20 text-status-inProgress",
      completed: "bg-status-completed/20 text-status-completed",
      paid: "bg-status-paid/20 text-status-paid",
      cancelled: "bg-status-cancelled/20 text-status-cancelled",
    };
    return colors[status] || "bg-muted/20 text-muted-foreground";
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order || !user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl">Детали заказа</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Секция 1: Информация о клиенте */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold mb-4">Информация о клиенте</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Telegram ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{user.id}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(user.id.toString())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="font-medium">
                  {user.first_name} {user.last_name} (@{user.username})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="font-medium">{user.total_orders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Потрачено всего</p>
                <p className="font-medium">{user.total_spent.toLocaleString()} ₽</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Бонусный баланс</p>
                <p className="font-medium text-success">{user.bonus_balance.toLocaleString()} ₽</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://t.me/${user.username}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Открыть в Telegram
            </Button>
          </div>

          <Separator />

          {/* Секция 2: Текущий заказ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Текущий заказ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID заказа</p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Услуга</p>
                <p className="font-medium">{order.service_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата создания</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleString("ru-RU")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Срок выполнения</p>
                <p className="font-medium">
                  {order.deadline
                    ? new Date(order.deadline).toLocaleString("ru-RU")
                    : "Не указан"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Статус</p>
                <Badge className={cn("text-sm", getStatusColor(order.status))}>
                  {order.status}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Описание задачи</p>
                <p className="text-sm bg-muted/30 p-3 rounded">
                  {order.description || "Описание отсутствует"}
                </p>
              </div>
              {order.parameters && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Параметры калькулятора</p>
                  <pre className="text-xs bg-muted/30 p-3 rounded overflow-x-auto">
                    {JSON.stringify(order.parameters, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Разбивка цены */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Цена без скидки:</span>
                <span className="font-medium">{order.total_price.toLocaleString()} ₽</span>
              </div>
              {order.promo_code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Промокод {order.promo_code}:
                  </span>
                  <span className="font-medium text-warning">
                    -{order.discount_amount.toLocaleString()} ₽
                  </span>
                </div>
              )}
              {order.bonus_used > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Использовано бонусов:</span>
                  <span className="font-medium text-success">
                    -{order.bonus_used.toLocaleString()} ₽
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">К оплате:</span>
                <span className="font-bold text-primary">
                  {order.final_price.toLocaleString()} ₽
                </span>
              </div>
            </div>

            {order.payment_url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(order.payment_url)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Копировать ссылку на оплату
              </Button>
            )}
          </div>

          <Separator />

          {/* Секция 3: Действия */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Действия</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Отправить уведомление клиенту
                </label>
                <Textarea
                  placeholder="Введите текст сообщения..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mb-2"
                />
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Отправить
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-destructive">
                  <Ban className="h-4 w-4 mr-2" />
                  Заблокировать
                </Button>
                <Button variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Экспорт (JSON)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
