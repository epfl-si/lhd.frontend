# pull official base image
FROM node:18

RUN yarn config set network-timeout 600000
# Install serve
RUN yarn global add serve

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN cd ..; git clone https://github.com/epfl-si/epfl-elements-react.git -b feature/addNewStories
# Installs all node packages
RUN yarn

# Copies everything over to Docker environment
COPY . ./
# Build production version of app
RUN yarn && yarn build

EXPOSE 3000
# start app
# CMD ["./docker-entrypoint.sh"]
