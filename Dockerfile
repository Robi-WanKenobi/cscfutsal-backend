FROM node:alpine

# Create app directory
RUN mkdir /CSCFUTSAL-BACKEND
WORKDIR /CSCFUTSAL-BACKEND
COPY package.json /CSCFUTSAL-BACKEND
RUN cd /CSCFUTSAL-BACKEND

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

# Bundle app source
COPY . /CSCFUTSAL-BACKEND
RUN ng build

EXPOSE 3000
