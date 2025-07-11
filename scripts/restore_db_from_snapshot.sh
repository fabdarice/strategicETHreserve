#!/bin/bash

# === CONFIGURATION ===
DB_NAME="strategicethreserve"
DB_URI="postgresql://fabda@localhost:5432/$DB_NAME"

# === VALIDATE ARGUMENT ===
if [ -z "$1" ]; then
  echo "❌ Usage: $0 <path_to_sql_file>"
  exit 1
fi

DUMP_FILE="$1"

if [ ! -f "$DUMP_FILE" ]; then
  echo "❌ File not found: $DUMP_FILE"
  exit 1
fi

echo "Dropping all tables in database: $DB_NAME"

psql "$DB_URI" <<'EOF'
DO
$$
DECLARE
    r RECORD;
BEGIN
    EXECUTE 'SET session_replication_role = replica';

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    EXECUTE 'SET session_replication_role = DEFAULT';
END
$$;
EOF

echo "✔️ All tables dropped."
echo "Restoring dump from $DUMP_FILE..."

psql "$DB_URI" -f "$DUMP_FILE"

echo "✅ Restore complete."