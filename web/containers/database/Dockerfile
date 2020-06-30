############################################################
# Dockerfile to build ODO-VIA database container image
############################################################

FROM ubuntu:18.04

MAINTAINER ODO-VIA

#RUN apt-get update && apt-get -y install locales locales-all && apt-get clean

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y postgresql-10 postgresql-10-postgis-2.4 postgresql-10-postgis-scripts && apt-get clean

# Handle access right
RUN echo "host    all             all             0.0.0.0/0               md5" >> /etc/postgresql/10/main/pg_hba.conf
RUN service postgresql start && /bin/su postgres -c "createuser -d -s -r -l oss" && /bin/su postgres -c "psql postgres -c \"ALTER USER oss WITH ENCRYPTED PASSWORD 'LeCaireRio117'\"" && service postgresql stop

RUN echo "listen_addresses = '*'" >> /etc/postgresql/10/main/postgresql.conf
RUN echo "port = 5434" >> /etc/postgresql/10/main/postgresql.conf

# Create Database and load Data
ADD db.sql /db.sql
ADD db_custom.sql /db_custom.sql
ADD db_data_prod.sql /db_data_prod.sql
ADD db_data_test.sql /db_data_test.sql

ADD loaddata.sh /opt/loaddata.sh
RUN chmod +x /opt/loaddata.sh
RUN service postgresql start && /opt/loaddata.sh && service postgresql stop

# DB schema update to version 1.0.1
ADD alter-db-1.0.1.sql /alter-db-1.0.1.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.1.sql" && service postgresql stop

# DB schema update to version 1.0.2
ADD alter-db-1.0.2.sql /alter-db-1.0.2.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.2.sql" && service postgresql stop

# DB schema update to version 1.0.3
ADD alter-db-1.0.3.sql /alter-db-1.0.3.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.3.sql" && service postgresql stop

# DB schema update to version 1.0.4
ADD alter-db-1.0.4.sql /alter-db-1.0.4.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.4.sql" && service postgresql stop

# DB schema update to version 1.0.5
ADD alter-db-1.0.5.sql /alter-db-1.0.5.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.5.sql" && service postgresql stop

# DB schema update to version 1.0.6
ADD alter-db-1.0.6.sql /alter-db-1.0.6.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.6.sql" && service postgresql stop

# DB schema update to version 1.0.7
ADD alter-db-1.0.6.sql /alter-db-1.0.7.sql
RUN service postgresql start &&   su postgres sh -c "psql -U postgres -d oss -f /alter-db-1.0.7.sql" && service postgresql stop


EXPOSE 5434

ADD start.sh /start.sh
RUN chmod 0755 /start.sh

CMD ["/start.sh"]