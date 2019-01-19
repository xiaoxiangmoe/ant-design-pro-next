// tslint:disable: no-class no-non-null-assertion
import {
  ApolloClient,
  ApolloLink,
  fromPromise,
  HttpLink,
  InMemoryCache,
} from 'apollo-boost';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import Foo from './pages/Foo';
const httpLink = new HttpLink({ uri: 'http://localhost:9000/graphql' });

const getAccessToken = async () => {
  return localStorage.getItem('access_token')!;
};

const authMiddleware = new ApolloLink((operation, forward) =>
  fromPromise(getAccessToken()).flatMap(token => {
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return forward!(operation);
  }),
);

const client = new ApolloClient({
  link: authMiddleware.concat(httpLink),
  cache: new InMemoryCache(),
});
const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Foo />
      </Router>
    </ApolloProvider>
  );
};

export default App;
