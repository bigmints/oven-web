FROM node:24-slim
WORKDIR /app
COPY collector/server.mjs collector/server.mjs
COPY site/analytics-validation.mjs site/analytics-validation.mjs
COPY catalog/apps.json catalog/apps.json
USER node
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "collector/server.mjs"]
