  #!/bin/sh

  su postgres sh -c "createdb -U postgres -E UTF8 -O postgres oss"
  su postgres sh -c "psql -U postgres -d oss -c 'CREATE EXTENSION postgis;'"
  su postgres sh -c "psql -U postgres -d oss -c 'CREATE EXTENSION postgis_topology;'"
  su postgres sh -c "psql -U postgres -d oss -c 'CREATE EXTENSION pgcrypto;'"
  su postgres sh -c "psql -U postgres -d oss -c 'CREATE EXTENSION \"uuid-ossp\";'"
  su postgres sh -c "psql -U postgres -d oss -f /db.sql"
  su postgres sh -c "psql -U postgres -d oss -f /db_custom.sql"
  su postgres sh -c "psql -U postgres -d oss -f /db_data_prod.sql"
  su postgres sh -c "psql -U postgres -d oss -f /db_data_test.sql"