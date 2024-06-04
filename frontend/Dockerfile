FROM node:14

WORKDIR /.

RUN npx create-react-app app

WORKDIR /app/

RUN npm install bootstrap@5
RUN npm install react-bootstrap
RUN npm install react-router-dom
RUN npm install axios
RUN npm install crypto-js
RUN npm install react-datepicker
RUN npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
#RUN npm install react-pdf pdf-lib
#RUN npm install @react-pdf/renderer
#RUN npm install @react-pdf/fontkit 
#RUN npm install react-dnd react-dnd-html5-backend
RUN npm install react-select
RUN npm install react-switch
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

RUN npm install @mui/material @emotion/react @emotion/styled
RUN npm install @fontsource/roboto
RUN npm install @mui/icons-material


# Copy the entire application code to the container
COPY . .

CMD ["npm", "start"]

