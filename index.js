const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');

// Lee el esquema GraphQL desde el archivo
const schema = fs.readFileSync('./schema.graphql', 'utf8');

// Arreglo con los autores
let authors = [
    { id: "1", name: "Douglas Adams", nationality: "British" },
    { id: "2", name: "George Orwell", nationality: "British" },
    { id: "3", name: "Harper Lee", nationality: "American" },
    { id: "4", name: "J.D. Salinger", nationality: "American" },
    { id: "5", name: "F. Scott Fitzgerald", nationality: "American" },
    { id: "6", name: "Herman Melville", nationality: "American" },
    { id: "7", name: "Jane Austen", nationality: "British" },
    { id: "8", name: "J.R.R. Tolkien", nationality: "British" },
    { id: "9", name: "J.K. Rowling", nationality: "British" },
    { id: "10", name: "Fyodor Dostoevsky", nationality: "Russian" }
];

// Arreglo con los libros
let books = [
    { id: "1", title: "The Hitchhiker's Guide to the Galaxy", authorId: "1", ISBN: 9780345391803, publication: "1979-10-12" },
    { id: "2", title: "1984", authorId: "2", ISBN: 9780451524935, publication: "1949-06-08" },

];

// Arreglo con los préstamos
let loans = [
    { id: "1", bookId: "1", user: "John Doe", loanDate: "2024-03-20", returnDate: "2024-04-20" },

];

const resolvers = {
    Query: {
        allBooks: () => books,
        bookById: (parent, { id }) => books.find(book => book.id === id),
        allAuthors: () => authors,
        allLoans: () => loans
    },
    Mutation: {
        createAuthor: (parent, { name, nationality }) => {
            const newAuthor = {
                id: String(authors.length + 1),
                name: name,
                nationality: nationality
            };
            authors.push(newAuthor);
            return newAuthor;
        },
        updateAuthor: (parent, { id, name, nationality }) => {
            const authorIndex = authors.findIndex(author => author.id === id);
            if (authorIndex === -1) {
                throw new Error("Autor no encontrado");
            }
            authors[authorIndex] = {
                id: id,
                name: name,
                nationality: nationality
            };
            return authors[authorIndex];
        }
    }
};

// Definir el servidor Apollo
const server = new ApolloServer({
    typeDefs: gql(schema),
    resolvers
});

// Iniciar el servidor
server.listen().then(({ url }) => {
    console.log(`Servidor ejecutándose en ${url}`);
});