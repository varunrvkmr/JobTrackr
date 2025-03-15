# Use Node.js 18 as the base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage Docker cache)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install TypeScript and type definitions for React
RUN npm install --save-dev typescript @types/react @types/react-dom

# Copy the entire frontend source code into the container
COPY . .

# Build the frontend (TypeScript will compile TSX to JS)
RUN npm run build

# Expose the port React runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
