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
            // Publicar evento de autor creado
            pubsub.publish("NEW_AUTHOR_CREATED", { newAuthorCreated: newAuthor });
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
            // Publicar evento de autor actualizado
            pubsub.publish('AUTHOR_UPDATED', { authorUpdated: authors[authorIndex] });
            return authors[authorIndex];
        },
        deleteAuthor: (parent, { id }) => {
            const authorIndex = authors.findIndex(author => author.id === id);
            if (authorIndex === -1) {
                throw new Error("Autor no encontrado");
            }
            const deletedAuthor = authors.splice(authorIndex, 1)[0];
            // Publicar evento de autor eliminado
            pubsub.publish('AUTHOR_DELETED', { authorDeleted: deletedAuthor });
            return deletedAuthor;
        },
        updateBook: (parent, { id, title, authorId, ISBN, publication }) => {
            const bookIndex = books.findIndex(book => book.id === id);
            if (bookIndex === -1) {
                throw new Error("Libro no encontrado");
            }
            books[bookIndex] = {
                id: id,
                title: title,
                authorId: authorId,
                ISBN: ISBN,
                publication: publication
            };
            // Publicar evento de libro actualizado
            pubsub.publish('BOOK_UPDATED', { bookUpdated: books[bookIndex] });
            return books[bookIndex];
        },
        createBook: (parent, { title, authorId, ISBN, publication }) => {
            const newBook = {
                id: String(books.length + 1),
                title,
                authorId,
                ISBN,
                publication
            };
            books.push(newBook);
            const author = authors.find(author => author.id === authorId);
            // Si se encuentra el autor, lo incluimos en el evento, de lo contrario, lo dejamos como null
            const bookAddedPayload = author ? { ...newBook, author } : newBook;
            pubsub.publish('BOOK_ADDED', { bookAdded: bookAddedPayload });
            return newBook;
        },
        deleteBook: (parent, { id }) => {
            const bookIndex = books.findIndex(book => book.id === id);
            if (bookIndex === -1) {
                throw new Error("Libro no encontrado");
            }
            const deletedBook = books.splice(bookIndex, 1)[0];
            // Publicar evento de libro eliminado
            pubsub.publish('BOOK_DELETED', { bookDeleted: deletedBook });
            return deletedBook;
        },
    },
    Subscription: {
        authorAdded: {
            subscribe: () => pubsub.asyncIterator(['NEW_AUTHOR_CREATED'])
        },
        authorDeleted: {
            subscribe: () => pubsub.asyncIterator(['AUTHOR_DELETED'])
        },
        authorUpdated: {
            subscribe: () => pubsub.asyncIterator(['AUTHOR_UPDATED'])
        },
        
        bookUpdated: {
            subscribe: () => pubsub.asyncIterator(['BOOK_UPDATED'])
        },
        bookDeleted: {
            subscribe: () => pubsub.asyncIterator(['BOOK_DELETED'])
        },
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
            resolve: (payload) => {
                // Aquí puedes procesar el payload de la suscripción
                // Por ejemplo, agregar información adicional, como el autor
                const book = payload.bookAdded;
                const author = authors.find(author => author.id === book.authorId);
                // Si se encuentra el autor, lo incluimos en el payload, de lo contrario, lo dejamos como null
                return author ? { ...book, author } : book;
            }
        }
    }
};

// Definir el servidor Apollo
const server = new ApolloServer({
    typeDefs: gql(schema),
    resolvers
});

// Iniciar el servidor
server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Servidor ejecutándose en ${url}`);
    console.log(`Servidor de suscripciones ejecutandose en ${subscriptionsUrl}`);
});