-- Deploy fresh database tables / Order matters if tables depend on each other
\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'

\i '/docker-entrypoint-initdb.d/seed/seed.sql'