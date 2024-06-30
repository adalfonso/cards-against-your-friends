
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable
RUN corepack prepare pnpm@9.4.0 --activate
RUN pnpm i
COPY . .
EXPOSE 4201
CMD ["pnpm","start"]