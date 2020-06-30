FROM nomad_webapp

MAINTAINER ODO-VIA

COPY ./build /var/www/docs
COPY ./config /var/www/config

RUN chown -Rf www-data:www-data /var/www