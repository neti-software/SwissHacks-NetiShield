FROM node:23.8.0 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV REACT_APP_API_URL="https://neti-shield-api.test.neti-soft.com"
ENV API_URL="https://neti-shield-api.test.neti-soft.com"
ENV REACT_APP_XRPL_NETWORK="testnet"

RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html

# Create custom nginx config with proper SPA routing
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]