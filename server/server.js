const express = require('express');
// Import the ApolloServer class
// ApolloServer can be set up on its own , but when adding to express here we
// are integrating it into our express server using middleware.  
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
// not using path with graphql?
const path = require('path'); 

// This is an ApolloServer package to ensure our express server will shutdown correctly
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const http = require("http");

const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes);

// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

  // set up the route to handle graphql requests
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  db.once("open", () => {
    // start the web server
    httpServer.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start everything up
startApolloServer(typeDefs, resolvers);
