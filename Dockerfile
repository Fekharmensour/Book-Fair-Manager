# Use Node.js as the base image
FROM node:20-slim AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set the working directory
WORKDIR /app

# Copy the workspace configuration and package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/book-fair/package.json ./artifacts/book-fair/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the required libraries and the api-server
RUN pnpm --filter @workspace/api-spec run codegen
RUN pnpm --filter @workspace/api-server run build

# Expose the port the app runs on
EXPOSE 8080

# Set environment variable for the port
ENV PORT=8080

# Start the application
CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]
