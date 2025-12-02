FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

# Use node directly for production instead of nodemon
CMD ["node", "-r", "dotenv/config", "src/index.js"]
