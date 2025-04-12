FROM node:alpine as development

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY ecosystem.config.js ecosystem.config.js

RUN npm i

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

RUN npm install -g pm2

EXPOSE 3000

# CMD [ "npm", "run", "start:dev"]

CMD [ "pm2-runtime", "start", "ecosystem.config.js"]

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=development /usr/src/app/dist ./dist

CMD [ "node", "dist/main"]