# Use the official Node.js image as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy the rest of the application code to the working directory
COPY . .

# Clean and install inside the image
RUN npm clean-install


# Expose the port the app runs on
EXPOSE 5173

# Command to run the application
CMD ["npm", "run", "dev"]