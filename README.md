# Dolce Nuve Sistema

This project uses Supabase to store data. Before running the application make sure
all SQL migrations found in `supabase/migrations` have been applied to your
Supabase project. If you are using the Supabase CLI, the migrations can be
applied with:

```sh
supabase db push
```

Applying these migrations creates the `sales` table, the `monthly_sales` view and
all required foreign key relationships. The application relies on these
structures to load sales information correctly.
