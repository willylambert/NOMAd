#!/bin/bash

DATADIR="/var/lib/postgresql/10/main"
CONF="/etc/postgresql/10/main/postgresql.conf"
POSTGRES="/usr/lib/postgresql/10/bin/postgres"
INITDB="/usr/lib/postgresql/10/bin/initdb"

trap "echo \"Sending SIGTERM to postgres\"; killall -s SIGTERM postgres" SIGTERM

su postgres sh -c "$POSTGRES -D $DATADIR -c config_file=$CONF" &

wait $!