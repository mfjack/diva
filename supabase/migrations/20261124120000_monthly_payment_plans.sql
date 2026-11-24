alter type public.payment_plan rename value 'monthly' to 'monthly_before';

alter type public.payment_plan add value 'monthly_after';
