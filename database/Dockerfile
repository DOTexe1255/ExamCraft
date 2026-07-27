# Use the official MySQL image as the base image
FROM mysql:9.4.0

# Set default environment variables
ENV MYSQL_ROOT_PASSWORD=password \
    MYSQL_DATABASE=examcraft

# Copy initialization SQL script
COPY Examcraft_db_proto.sql /docker-entrypoint-initdb.d/

# Expose MySQL port
EXPOSE 3306