FROM node:24.13.0-alpine3.23 AS backend-base
WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

ENTRYPOINT [ "npm", "run" ]

FROM backend-base AS backend-dev

CMD [ "start:dev" ]

FROM backend-base AS test

CMD [ "test:e2e" ]
