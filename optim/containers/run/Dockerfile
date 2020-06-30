FROM oss-nomad-build-optim

ARG DEBIAN_FRONTEND=noninteractive

# Update the repository sources list
RUN apt-get update && apt-get install -y supervisor nginx php7.2-cli php7.2-fpm php7.2-curl php7.2-gd php7.2-pgsql php7.2-xsl php7.2-mbstring zip unzip && apt-get clean

# nginx config (for more details, check specialized websites)
RUN sed -i -e"s/keepalive_timeout\s*65/keepalive_timeout 2/" /etc/nginx/nginx.conf
RUN sed -i -e"s/keepalive_timeout 2/keepalive_timeout 2;\n\tclient_max_body_size 100m/" /etc/nginx/nginx.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Supervisor Configuration
ADD containers/run/supervisord.conf /etc/supervisord.conf

# Add composer
ADD containers/run/composer-setup.php /opt/composer-setup.php
RUN php /opt/composer-setup.php --install-dir=/usr/bin --filename=composer --disable-tls

# Run composer
ADD containers/run/composer.json /var/lib/
WORKDIR /var/lib
RUN composer update

# replace the nginx default configuration by our default configuration
ADD containers/run/nginx_default /etc/nginx/sites-available/default

# copy the web server source code
COPY src/www /var/www

# Grant rights to www-data user to the data directory
RUN groupadd data-nomad
RUN gpasswd -a www-data data-nomad
RUN chown -R root:data-nomad /var/www/data/
RUN chmod -R g+w /var/www/data/

VOLUME ["/var/www/docs"]
VOLUME ["/var/www/data"]

EXPOSE 80

ADD containers/run/start.sh /start.sh
RUN chmod +x /start.sh

## Set the working directory for the start script
WORKDIR /opt/nomad/src

CMD ["/bin/bash", "/start.sh"]
