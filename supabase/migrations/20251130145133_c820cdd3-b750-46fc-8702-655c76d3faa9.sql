-- Исправление функций с добавлением search_path для безопасности

-- Обновляем функцию update_updated_at_column с правильным search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Обновляем функцию calculate_cashback с правильным search_path
CREATE OR REPLACE FUNCTION calculate_cashback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;