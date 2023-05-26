#!/bin/sh

set -e

# Enable timescaledb extension and set hypertable
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="$POSTGRES_DB" <<-EOSQL
	CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
	SELECT create_hypertable('deviceStats','time');
EOSQL
