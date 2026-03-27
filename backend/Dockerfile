FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]
