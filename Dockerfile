FROM node:22-alpine3.21

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app/web

ENV BACKEND_API_URL=http://chat-studio-server:8080
ENV PORT=3000

COPY package.json .
COPY pnpm-lock.yaml .
COPY package-lock.json .

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY ./ /app/web/

COPY .env.example .env

RUN pnpm build

COPY docker/entrypoint.sh ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "./entrypoint.sh"]