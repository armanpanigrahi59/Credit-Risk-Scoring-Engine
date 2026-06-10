FROM node:22-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci

COPY server/src ./src

EXPOSE 5000
CMD ["npm", "start"]
