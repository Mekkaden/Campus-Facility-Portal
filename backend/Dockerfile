FROM node:20-alpine

#in the app directory
WORKDIR /app

#any file starting with package and ending with json
COPY package*.json ./

#install dependencies ci means clean install meaning only update the changed fiels
RUN npm ci 

#copy the code and stuff
COPY . . 

#labelling this is the port
EXPOSE 5001

#run this command
CMD ["node", "src/server.js"]
