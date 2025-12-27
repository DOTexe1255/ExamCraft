# Use the official MySQL image as the base image
FROM mysql:9.4.0

# Set the default environment variables
ENV MYSQL_ROOT_PASSWORD=root \
    MYSQL_DATABASE=examcraft \
    MYSQL_USER=examuser \
    MYSQL_PASSWORD=exampass

# Copy the initialization SQL script to the container
COPY Examcraft_db_proto.sql /docker-entrypoint-initdb.d/

# Expose the default MySQL port
EXPOSE 3306