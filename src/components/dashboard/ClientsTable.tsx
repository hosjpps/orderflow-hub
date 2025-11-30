import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Copy, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderDetailsDialog } from "./OrderDetailsDialog";

interface Client {
  id: number;
  username: string;
  first_name: string;
  created_at: string;
  last_activity: string;
  current_order?: {
    id: string;
    service_type: string;
    status: string;
    total_price: number;
    payment_url?: string;
  };
  total_orders: number;
  total_spent: number;
  bonus_balance: number;
}

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-status-new/20 text-status-new border-status-new/30";
    case "in_progress":
      return "bg-status-inProgress/20 text-status-inProgress border-status-inProgress/30";
    case "completed":
      return "bg-status-completed/20 text-status-completed border-status-completed/30";
    case "paid":
      return "bg-status-paid/20 text-status-paid border-status-paid/30";
    case "cancelled":
      return "bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: "Новый",
    in_progress: "В работе",
    completed: "Завершен",
    paid: "Оплачен",
    cancelled: "Отменен",
  };
  return labels[status] || status;
};

export const ClientsTable = ({ clients, loading }: ClientsTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-card animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-foreground">ID</TableHead>
              <TableHead className="text-foreground">Имя / Username</TableHead>
              <TableHead className="text-foreground">Регистрация</TableHead>
              <TableHead className="text-foreground">Последняя активность</TableHead>
              <TableHead className="text-foreground">Услуга</TableHead>
              <TableHead className="text-foreground">Статус</TableHead>
              <TableHead className="text-foreground text-right">Сумма</TableHead>
              <TableHead className="text-foreground text-center">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                className={cn(
                  "border-border/50 transition-colors hover:bg-muted/50",
                  client.current_order && getStatusColor(client.current_order.status).replace("text-", "hover:bg-")
                )}
              >
                <TableCell className="font-mono text-sm">{client.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{client.first_name}</div>
                    <div className="text-sm text-muted-foreground">@{client.username}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(client.created_at).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(client.last_activity).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-sm">
                  {client.current_order?.service_type || "-"}
                </TableCell>
                <TableCell>
                  {client.current_order ? (
                    <Badge variant="outline" className={cn("border", getStatusColor(client.current_order.status))}>
                      {getStatusLabel(client.current_order.status)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {client.current_order 
                    ? `${client.current_order.total_price.toLocaleString()} ₽`
                    : "-"
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => client.current_order && setSelectedOrder(client.current_order.id)}
                      disabled={!client.current_order}
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Изменить статус"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {client.current_order?.payment_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(client.current_order?.payment_url || "")}
                        title="Копировать ссылку на оплату"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://t.me/${client.username}`, "_blank")}
                      title="Написать в Telegram"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog
          orderId={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        />
      )}
    </>
  );
};
