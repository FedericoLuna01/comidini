FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN pnpm add -g turbo@2.4.2
WORKDIR /app
COPY . .
ARG APP_NAME=shop
RUN turbo prune --scope=${APP_NAME} --docker

FROM base AS installer
ARG APP_NAME=shop
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm turbo build --filter=${APP_NAME}...

FROM nginx:alpine AS runner
ARG APP_NAME=shop
COPY --from=installer /app/apps/${APP_NAME}/dist /usr/share/nginx/html
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
