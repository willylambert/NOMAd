# NOMAd

## Pré-requis

La solution NOMAd est packagée dans des containers Docker.

Pour une utilisation en production, les pré-requis suivants sont nécessaires :

### Sur le serveur hébergeant l'application web :

* docker 

### Sur l'environnement de build

* docker
* angular CLI version 8 ou supérieur
* yarn

### Sur des serveurs indépendants :

* Un serveur de base de données PostgreSQL en version 10 avec les extensions PostGIS
* Un serveur de log GrayLog ou compatible (téléchargement et instructions : https://www.graylog.org/downloads)
* Un serveur Nominatim (téléchargement et instructions : http://nominatim.org/)
* Un serveur OSRM
* Le serveur d'optimisation : https://gitlab.odo-via.com/nomad/optim

### Accès aux services SAAS :

* Une clé d'accès Mapbox (Compte à créer sur https://www.mapbox.com) 
* Une clé d'accès TomTom (Compte à créer sur https://developer.tomtom.com)
* Un utilisateur Amazon Web Services SNS pour l'envoi de SMS (Compte à créer sur https://aws.amazon.com/)

## Production

### Base de données

Activer sur le serveur PostgreSQL les extensions suivantes:

* postgis
* postgis_topology
* pgcrypto
* uuid-ossp

Puis exécuter les scripts de création de base suivants :

* `containers/database/db.sql`
* `containers/database/db_custom.sql`
* `containers/database/db_data_prod.sql`
* `containers/database/alter-db-1.0.X.sql`

En complément, exécuter le script `containers/database/db_data_test.sql` pour charger des données de tests.

### Application web

Sur le serveur destiné à heberger la solution :

1 : cloner l'intégralité du repository dans un répertoire du serveur de production.

2 : Définir les variables d'environnements :

   * DB_HOST : IP du serveur PostgreSQL
   * DB_PORT  : port du serveur PostgresQL
   * DB_NAME  : Nom de la base de données
   * DB_USER  : Utilisateur de base de donnnées
   * DB_PASSWD : Mot de passe de la base de données
   * MAPBOX_KEY : Clé d'accès à MapBox
   * TOMTOM_KEY : Clé d'accès à TomTom
   * NOMINATIM_URL : IP du serveur Nominatim
   * SNS_AWS_KEY : Utilsateur AWS
   * SNS_AWS_SECRET : Clé secrète de l'utilisateur AWS
   * SNS_AWS_REGION : Région AWS
   * OPTIM_HOST_URL : IP du serveur d'optimisation
   * OPTIM_PORT : PORT du serveur d'optimisation
   * GRAYLOG_SERVER : IP du serveur GrayLog
   * GRAYLOG_UDP_PORT : Port du serveur GrayLog

3 : Lancer le script `build.sh` qui va générer une image docker nommée `oss-nomad-webapp-prod`.

4 : Lancer le serveur web de l'application :

````
docker run  -p 80:80 \
            -e "DB_HOST=$DB_HOST"  \
            -e "DB_PORT=$DB_PORT"  \
            -e "DB_NAME=$DB_NAME"  \
            -e "DB_USER=$DB_USER"  \
            -e "DB_PASSWD=$DB_PASSWD"  \
            -e "MAPBOX_KEY=$MAPBOX_KEY"  \
            -e "TOMTOM_KEY=$TOMTOM_KEY"  \
            -e "NOMINATIM_URL=$NOMINATIM_URL"  \
            -e "SNS_AWS_KEY=$SNS_AWS_KEY"  \
            -e "SNS_AWS_SECRET=$SNS_AWS_SECRET"  \
            -e "SNS_AWS_REGION=$SNS_AWS_REGION"  \
            -e "OPTIM_HOST_URL=$OPTIM_HOST_URL"  \
            -e "GRAYLOG_SERVER=$GRAYLOG_SERVER" \
            -e "GRAYLOG_UDP_PORT=$GRAYLOG_UDP_PORT" oss-nomad-webapp-prod
````

L'application est alors accessible en local sur le port 80. Configurer un reverse Proxy (NGINX...) en amont pour ajouter un accès en SSL/TLS.
Par défaut, le compte demo associé au mot de passe demo permet d'accéder à l'application.
Une fois un deuxième compte admin créé, désactiver le compte demo.

## Environnement de développement

L'environnement de développement intègre un conteneur postgreSQL.
Il est en revanche nécessaire de disposer d'un serveur Nominatim, GrayLog et de tokens Mapbox et TomTom.

1 : Installer les pré-requis :

* Angular CLI en version 8
* yarn

2 : Cloner le repository Nomad

3 : dans le répertoire `src/webapp/src` exécuter la commande `yarn install` pour installer les dépendances javascript.

4 : démarrer les containers `webapp` et `database` en exécutant la commande `docker-compose up -d`

5 : lancer le build de l'application angular avec la commande `ng serve`

6 : l'application est accessible à l'adresse `http://localhost:4200`

7 : les identifiants par défaut sont les suivants :

* identifiant : demo
* mot de passe : demo
