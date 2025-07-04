import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: Author!
    genre: String
    publishedYear: Int
    rating: Float
    description: String
    isAvailable: Boolean!
  }
  
  type Author {
    id: ID!
    name: String!
    birthYear: Int
    nationality: String
    books: [Book!]
  }
  
  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
    author(id: ID!): Author
  }
  
  type Mutation {
    addBook(
      title: String!
      authorId: ID!
      genre: String
      publishedYear: Int
      rating: Float
      description: String
      isAvailable: Boolean
    ): Book!
    
    updateBook(
      id: ID!
      title: String
      authorId: ID
      genre: String
      publishedYear: Int
      rating: Float
      description: String
      isAvailable: Boolean
    ): Book
    
    deleteBook(id: ID!): Boolean!
    
    addAuthor(
      name: String!
      birthYear: Int
      nationality: String
    ): Author!
    
    updateAuthor(
      id: ID!
      name: String
      birthYear: Int
      nationality: String
    ): Author
    
    deleteAuthor(id: ID!): Boolean!
  }
`;
