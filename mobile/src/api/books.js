import API from "./index";

export const getBooks = () => API.get("/books");
export const addBook = (data) => API.post("/books", data);
export const deleteBook = (id) => API.delete(`/books/${id}`);