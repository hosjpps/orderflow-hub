-- Таблица пользователей (клиентов бота)
CREATE TABLE public.users (
  id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  bonus_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица заказов
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  parameters JSONB,
  total_price NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  bonus_used NUMERIC(10, 2) DEFAULT 0,
  final_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  payment_url TEXT,
  payment_id TEXT,
  promo_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE
);

-- Таблица промокодов
CREATE TABLE public.promo_codes (
  code TEXT PRIMARY KEY,
  discount_percent NUMERIC(5, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица бонусных транзакций
CREATE TABLE public.bonus_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица услуг
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_bonus_transactions_user_id ON public.bonus_transactions(user_id);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Функция для начисления бонусов после оплаты заказа
CREATE OR REPLACE FUNCTION calculate_cashback()
RETURNS TRIGGER AS $$
DECLARE
    cashback_amount NUMERIC(10, 2);
BEGIN
    -- Если статус изменился на 'paid', начисляем 5% кэшбэка
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        cashback_amount := NEW.final_price * 0.05;
        
        -- Добавляем транзакцию
        INSERT INTO public.bonus_transactions (user_id, order_id, amount, transaction_type)
        VALUES (NEW.user_id, NEW.id, cashback_amount, 'cashback');
        
        -- Обновляем баланс пользователя
        UPDATE public.users
        SET bonus_balance = bonus_balance + cashback_amount,
            total_spent = total_spent + NEW.final_price,
            last_activity = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического начисления бонусов
CREATE TRIGGER trigger_calculate_cashback
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid')
EXECUTE FUNCTION calculate_cashback();

-- RLS политики (публичный доступ для дашборда, в реальном проекте нужна авторизация)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Временные политики для разработки (разрешают все операции)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bonus_transactions" ON public.bonus_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- Вставка тестовых данных для услуг
INSERT INTO public.services (name, description, base_price, parameters) VALUES
('Консультация', 'Онлайн консультация с преподавателем', 1000.00, '{"duration": "60 min", "format": "video"}'),
('Проверка работы', 'Детальная проверка учебной работы', 1500.00, '{"pages": 10, "complexity": "medium"}'),
('Решение задач', 'Помощь в решении задач', 800.00, '{"quantity": 5, "subject": "math"}'),
('Подготовка к экзамену', 'Индивидуальная подготовка', 3000.00, '{"sessions": 5, "duration": "90 min"}'),
('Написание реферата', 'Написание реферата под ключ', 2500.00, '{"pages": 15, "deadline": "7 days"}');

-- Вставка тестовых промокодов
INSERT INTO public.promo_codes (code, discount_percent, max_usage) VALUES
('SALE20', 20.00, 100),
('FIRST10', 10.00, 50),
('VIP30', 30.00, 20);