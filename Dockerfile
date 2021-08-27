FROM node:16-alpine AS builder

WORKDIR "/app"

COPY ./ ./

RUN npm install
RUN npm run build

FROM node:16-alpine AS server

ENV PORT 3000
ENV NODE_ENV "production"
EXPOSE ${PORT}

WORKDIR "/app"

COPY --from=builder /app/dist ./dist
COPY ./static ./static
COPY package.json package-lock.json ./

RUN npm install
CMD ["npm", "run", "start"]
