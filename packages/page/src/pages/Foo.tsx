import gql from 'graphql-tag';
import * as React from 'react';
import { useQuery } from 'react-apollo-hooks';

const GET_ME = gql`
  {
    me {
      id
      name
      email
      avatar
      title
      group
      tags {
        id
        label
      }
      country {
        name
      }
      city {
        province {
          name
        }
        name
      }
    }
  }
`;
const Foo: React.FC = () => {
  const { data, error, loading } = useQuery(GET_ME, { suspend: false });

  return <>123123</>;
};

export default Foo;
