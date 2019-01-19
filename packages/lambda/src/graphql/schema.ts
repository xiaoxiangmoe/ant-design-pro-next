import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  directive @isAuthenticated on FIELD | FIELD_DEFINITION
  directive @hasRole(role: String) on FIELD | FIELD_DEFINITION
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String!
    title: String!
    group: String!
    tags: [Tag]!
    city: City!
    age: Int!
    country: Country!
    address: String!
    phone: String!
  }
  type Tag {
    id: ID!
    label: String!
  }
  # ISO 3166-1
  type Country {
    # ISO 3166-1 numeric
    id: ID!
    # GB/T 2659-2000 世界各国和地区名称代码
    name: String!
    # ISO 3166-1 alpha-2
    alpha2: String!
    # ISO 3166-1 alpha-3
    alpha3: String!
  }
  # 中华人民共和国行政区划代码(GB/T 2260-2007)
  # see http://www.mca.gov.cn/article/sj/xzqh/2018/201804-12/20181101021046.html
  type Province {
    id: ID!
    name: String!
  }
  type City {
    id: ID!
    name: String!
    province: Province!
  }
  type Query {
    me: User @isAuthenticated
  }
  schema {
    query: Query
  }
`;

export default typeDefs;
