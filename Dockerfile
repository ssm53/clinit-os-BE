FROM node:18-buster-slim

RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates

WORKDIR /

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm install

COPY . /app

RUN --mount=type=secret,id=db_secret \
  DATABASE_URL="$(cat ./secrets/postgres_connection_string)" \
  npx prisma migrate deploy \
  && npx prisma generate

CMD [ "npm", "run", "start" ]