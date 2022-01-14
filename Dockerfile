FROM node:latest

WORKDIR /opt/app

COPY package.json /app

RUN npm install

COPY . .

CMD ["npm", "start"]

