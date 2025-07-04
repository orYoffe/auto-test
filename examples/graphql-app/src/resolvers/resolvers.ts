export interface Book {
  id: string;
  title: string;
  authorId: string;
  genre?: string;
  publishedYear?: number;
  rating?: number;
  description?: string;
  isAvailable: boolean;
}

export interface Author {
  id: string;
  name: string;
  birthYear?: number;
  nationality?: string;
}

// Mock database
let books: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    authorId: '1',
    genre: 'Classic',
    publishedYear: 1925,
    rating: 4.2,
    isAvailable: true
  },
  {
    id: '2',
    title: '1984',
    authorId: '2',
    genre: 'Dystopian',
    publishedYear: 1949,
    rating: 4.5,
    isAvailable: true
  }
];

let authors: Author[] = [
  {
    id: '1',
    name: 'F. Scott Fitzgerald',
    birthYear: 1896,
    nationality: 'American'
  },
  {
    id: '2',
    name: 'George Orwell',
    birthYear: 1903,
    nationality: 'British'
  }
];

// Resolvers
export const resolvers = {
  Query: {
    books: () => books,
    book: (_: any, { id }: { id: string }) => {
      return books.find(book => book.id === id);
    },
    authors: () => authors,
    author: (_: any, { id }: { id: string }) => {
      return authors.find(author => author.id === id);
    }
  },
  
  Mutation: {
    addBook: (_: any, args: Omit<Book, 'id'> & { id?: string }) => {
      const newBook: Book = {
        id: args.id || String(books.length + 1),
        title: args.title,
        authorId: args.authorId,
        genre: args.genre,
        publishedYear: args.publishedYear,
        rating: args.rating,
        description: args.description,
        isAvailable: args.isAvailable !== undefined ? args.isAvailable : true
      };
      
      books.push(newBook);
      return newBook;
    },
    
    updateBook: (_: any, args: Partial<Book> & { id: string }) => {
      const index = books.findIndex(book => book.id === args.id);
      if (index === -1) return null;
      
      books[index] = {
        ...books[index],
        ...args
      };
      
      return books[index];
    },
    
    deleteBook: (_: any, { id }: { id: string }) => {
      const initialLength = books.length;
      books = books.filter(book => book.id !== id);
      return books.length < initialLength;
    },
    
    addAuthor: (_: any, args: Omit<Author, 'id'> & { id?: string }) => {
      const newAuthor: Author = {
        id: args.id || String(authors.length + 1),
        name: args.name,
        birthYear: args.birthYear,
        nationality: args.nationality
      };
      
      authors.push(newAuthor);
      return newAuthor;
    },
    
    updateAuthor: (_: any, args: Partial<Author> & { id: string }) => {
      const index = authors.findIndex(author => author.id === args.id);
      if (index === -1) return null;
      
      authors[index] = {
        ...authors[index],
        ...args
      };
      
      return authors[index];
    },
    
    deleteAuthor: (_: any, { id }: { id: string }) => {
      const initialLength = authors.length;
      authors = authors.filter(author => author.id !== id);
      return authors.length < initialLength;
    }
  },
  
  Book: {
    author: (parent: Book) => {
      return authors.find(author => author.id === parent.authorId);
    }
  },
  
  Author: {
    books: (parent: Author) => {
      return books.filter(book => book.authorId === parent.id);
    }
  }
};
