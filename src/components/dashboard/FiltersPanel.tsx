import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FiltersPanelProps {
  onFilterChange: (filters: any) => void;
}

export const FiltersPanel = ({ onFilterChange }: FiltersPanelProps) => {
  const [services, setServices] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchQuery, setSearchQuery] = useState("");

  const servicesList = [
    "Консультация",
    "Проверка работы",
    "Решение задач",
    "Подготовка к экзамену",
    "Написание реферата",
  ];

  const statusesList = [
    { value: "new", label: "Новый" },
    { value: "in_progress", label: "В работе" },
    { value: "completed", label: "Завершен" },
    { value: "paid", label: "Оплачен" },
    { value: "cancelled", label: "Отменен" },
  ];

  const handleServiceToggle = (service: string) => {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleStatusToggle = (status: string) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      services,
      statuses,
      dateRange,
      priceRange,
      searchQuery,
    });
  };

  const resetFilters = () => {
    setServices([]);
    setStatuses([]);
    setDateRange({});
    setPriceRange([0, 10000]);
    setSearchQuery("");
    onFilterChange({});
  };

  return (
    <Card className="bg-gradient-card border-border/50 sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Фильтры</span>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Поиск */}
        <div className="space-y-2">
          <Label>Поиск</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Имя, ID, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Фильтр по услугам */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Услуги</Label>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() =>
                setServices(
                  services.length === servicesList.length ? [] : servicesList
                )
              }
            >
              {services.length === servicesList.length
                ? "Снять все"
                : "Выбрать все"}
            </Button>
          </div>
          <div className="space-y-2">
            {servicesList.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={services.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <label
                  htmlFor={service}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Фильтр по статусу */}
        <div className="space-y-3">
          <Label>Статус заказа</Label>
          <div className="space-y-2">
            {statusesList.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={statuses.includes(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                />
                <label
                  htmlFor={status.value}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Фильтр по дате */}
        <div className="space-y-3">
          <Label>Период</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setDateRange({ from: today, to: today });
              }}
            >
              Сегодня
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                setDateRange({ from: weekAgo, to: today });
              }}
            >
              Неделя
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                setDateRange({ from: monthAgo, to: today });
              }}
            >
              Месяц
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd.MM.yyyy", { locale: ru })} -{" "}
                      {format(dateRange.to, "dd.MM.yyyy", { locale: ru })}
                    </>
                  ) : (
                    format(dateRange.from, "dd.MM.yyyy", { locale: ru })
                  )
                ) : (
                  <span>Выберите даты</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange(range || {})}
                locale={ru}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Фильтр по сумме */}
        <div className="space-y-3">
          <Label>Сумма заказа</Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full"
            />
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="space-y-2 pt-4">
          <Button className="w-full" onClick={applyFilters}>
            Применить фильтры
          </Button>
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Сбросить все
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
