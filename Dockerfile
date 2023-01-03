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

# Copies everything over to Docker environment
COPY . ./
RUN sed -i 's+//localhost:3001+https://lhdv3.epfl.ch/graphql+g' src/components/Table/AppTable.js
RUN sed -i 's+http://localhost:8080/realms/LHD+https://tkgi-satosa.epfl.ch+g' src/components/RoomTable.js
RUN sed -i 's+http://localhost:3000+https://lhdv3.epfl.ch+g' src/components/RoomTable.js
# Build production version of app
RUN yarn build
EXPOSE 3000
# start app
CMD ["serve", "-s", "build"]