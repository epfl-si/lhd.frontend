# pull official base image
FROM node:20-alpine

# Enable and activate Corepack (ships with Node 20)
RUN corepack enable
RUN corepack prepare yarn@4.0.2 --activate

# Install serve globally (use npm, since Yarn 4 doesn't support global installs)
RUN npm install -g serve

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
# Installs all node packages
RUN yarn

# Copies everything over to Docker environment
COPY . ./
# Build production version of app
RUN yarn && yarn build

EXPOSE 3000
# start app
CMD ["./docker-entrypoint.sh"]
