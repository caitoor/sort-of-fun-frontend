# frontend Dockerfile
FROM node:22 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @rollup/rollup-linux-x64-gnu
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
