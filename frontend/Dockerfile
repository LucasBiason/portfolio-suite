# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_DEFAULT_EMAIL
ARG VITE_DEFAULT_PASSWORD

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DEFAULT_EMAIL=$VITE_DEFAULT_EMAIL
ENV VITE_DEFAULT_PASSWORD=$VITE_DEFAULT_PASSWORD

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

