import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PromoCode = () => {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: 0,
    max_usage: 0,
    is_active: true,
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Ошибка загрузки промокодов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить промокоды",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPromoCode = async () => {
    try {
      const { error } = await supabase.from("promo_codes").insert([formData]);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Промокод создан",
      });

      setDialogOpen(false);
      setFormData({
        code: "",
        discount_percent: 0,
        max_usage: 0,
        is_active: true,
      });
      loadPromoCodes();
    } catch (error) {
      console.error("Ошибка создания промокода:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать промокод",
        variant: "destructive",
      });
    }
  };

  const togglePromoCode = async (code: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: !isActive })
        .eq("code", code);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: `Промокод ${!isActive ? "активирован" : "деактивирован"}`,
      });

      loadPromoCodes();
    } catch (error) {
      console.error("Ошибка обновления промокода:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить промокод",
        variant: "destructive",
      });
    }
  };

  const deletePromoCode = async (code: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот промокод?")) return;

    try {
      const { error } = await supabase
        .from("promo_codes")
        .delete()
        .eq("code", code);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Промокод удален",
      });

      loadPromoCodes();
    } catch (error) {
      console.error("Ошибка удаления промокода:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить промокод",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Промокоды</h1>
            <p className="text-muted-foreground mt-1">
              Управление промокодами и скидками
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать промокод
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Новый промокод</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Код промокода</Label>
                  <Input
                    id="code"
                    placeholder="SALE20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Процент скидки</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="20"
                    value={formData.discount_percent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_percent: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_usage">Максимальное использование</Label>
                  <Input
                    id="max_usage"
                    type="number"
                    placeholder="100"
                    value={formData.max_usage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_usage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Активен</Label>
                </div>
                <Button className="w-full" onClick={createPromoCode}>
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Список промокодов</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Код</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Использовано</TableHead>
                    <TableHead>Максимум</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.code} className="border-border/50">
                      <TableCell className="font-mono font-medium">
                        {promo.code}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {promo.discount_percent}%
                      </TableCell>
                      <TableCell>{promo.usage_count}</TableCell>
                      <TableCell>
                        {promo.max_usage || "Без ограничений"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            promo.is_active
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-muted/20 text-muted-foreground border-muted/30"
                          }
                        >
                          {promo.is_active ? "Активен" : "Неактивен"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(promo.created_at).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={promo.is_active}
                            onCheckedChange={() =>
                              togglePromoCode(promo.code, promo.is_active)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deletePromoCode(promo.code)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PromoCode;
