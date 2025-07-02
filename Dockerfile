# Build stage
FROM node:22.15-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "pnpm-lock.yaml", "./"]

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Set production environment
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 5050

# Command to run the application
CMD ["pnpm", "start"] 