FROM node:18-alpine
ENV NODE_ENV=development

WORKDIR /app

COPY ["package.json", "yarn.lock", "tsconfig.json", "./"]
RUN yarn install

COPY . ./

EXPOSE 3000
CMD ["yarn", "run", "start:dev"]
