############################################################
# Dockerfile to build ODO-VIA webapp container image
############################################################

FROM ubuntu:18.04

MAINTAINER ODO-VIA

# Update the repository sources list
RUN apt-get update && apt-get install -y supervisor nginx php7.2-cli php7.2-fpm php7.2-curl php7.2-gd php7.2-pgsql php7.2-xsl php7.2-mbstring zip unzip && apt-get clean

# nginx config (for more details, check specialized websites)
RUN sed -i -e"s/keepalive_timeout\s*65/keepalive_timeout 2/" /etc/nginx/nginx.conf
RUN sed -i -e"s/keepalive_timeout 2/keepalive_timeout 2;\n\tclient_max_body_size 100m/" /etc/nginx/nginx.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# PHP memory limit
RUN sed -i 's/memory_limit = .*/memory_limit = 256M/' /etc/php/7.2/fpm/php.ini

# Supervisor Configuration
ADD ./supervisord.conf /etc/supervisord.conf

# Add composer
ADD ./composer-setup.php /opt/composer-setup.php
RUN php /opt/composer-setup.php --install-dir=/usr/bin --filename=composer --disable-tls

# Run composer
ADD ./composer.json /var/lib/
WORKDIR /var/lib
RUN composer update

# replace the nginx default configuration by our default configuration
ADD ./nginx_default /etc/nginx/sites-available/default

# PHP FPM Configuration - allow access to environment variable from php
RUN echo "clear_env = no" >> /etc/php/7.2/fpm/php-fpm.conf

# Create folders
RUN mkdir /var/www/data
RUN mkdir /var/www/data/logs
RUN mkdir /var/www/docs
RUN mkdir /var/www/config

# Generate self signed certificate
ADD ./self_ssl.conf /opt/self_ssl.conf
RUN mkdir /etc/nginx/certs
RUN mkdir /etc/nginx/certs/live
RUN mkdir /etc/nginx/certs/live/nomad.odo-via.com
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/live/nomad.odo-via.com/privkey.pem -out /etc/nginx/certs/live/nomad.odo-via.com/fullchain.pem -config /opt/self_ssl.conf


##################### INSTALLATION END #####################

VOLUME ["/var/www/docs"]
VOLUME ["/var/www/data"]

EXPOSE 80

ADD ./start.sh /start.sh
CMD ["/bin/bash", "/start.sh"]