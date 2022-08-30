# pull official base image
FROM node:16
# Install serve
RUN yarn global add serve

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
# Installs all node packages
RUN yarn install
# Build production version of app
RUN yarn build

# Copies everything over to Docker environment
COPY . ./
EXPOSE 3000
# start app
CMD ["serve", "-s", "build"]