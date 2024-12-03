FROM node:20
WORKDIR /src
COPY package.json .

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

COPY . ./
ENV PORT=3000
EXPOSE $PORT
CMD ["node", "run", "app.js"]