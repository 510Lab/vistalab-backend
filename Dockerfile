FROM node:18-alpine

# 程序路径
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8181
CMD [ "node", "app.js" ]