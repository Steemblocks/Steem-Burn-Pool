# ---------- Builder Stage ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --silent

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine
LABEL maintainer=""

# Remove default static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# ✅ FIX: Corrected config path
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
