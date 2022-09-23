FROM node:18-alpine
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]
RUN yarn install

COPY . ./

EXPOSE 3000
CMD ["yarn", "start"]
