# Môi trường phát triển Laravel (PHP 8.4 + pdo_mysql + Composer)
FROM php:8.4-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libzip-dev \
    && docker-php-ext-install pdo_mysql zip bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000

# Cài vendor (nếu thiếu) -> chạy migrate + seed -> khởi động server
CMD ["sh", "-c", "composer install --no-interaction && php artisan migrate --seed --force && php artisan serve --host=0.0.0.0 --port=8000"]
