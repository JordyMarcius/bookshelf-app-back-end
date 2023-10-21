const { nanoid } = require('nanoid');
const booksDetails = require('./books');

const saveBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  let finished = false;
  if (pageCount === readPage) {
    finished = true;
  }
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  booksDetails.push(newBook);

  const response = h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id,
    },
  });
  response.code(201);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  // query: ?name
  if (name !== undefined && reading === undefined && finished === undefined) {
    const nameLowerCase = name.toLowerCase();
    const bookWithSpecificNameDetails = booksDetails.filter((book) => book.name.toLowerCase().includes(`${nameLowerCase}`));

    const books = bookWithSpecificNameDetails.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

    if (books.length > 0) {
      const response = h.response({
        status: 'success',
        message: `Berhasil mendapatkan buku dengan nama '${name}'`,
        data: {
          books,
        },
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: 'fail',
      message: `Buku dengan nama '${name}' tidak ditemukan`,
    });
    response.code(404);
    return response;
  }

  // query: ?reading
  if (name === undefined && reading !== undefined && finished === undefined) {
    const checkReadingValue = (book) => {
      if (reading === '0') {
        return book.reading === false;
      }
      if (reading === '1') {
        return book.reading === true;
      }
      return book;
    };

    const booksWithSpecificReadDetails = booksDetails.filter(checkReadingValue);

    const books = booksWithSpecificReadDetails.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

    if (reading === '0' || reading === '1') {
      const isReading = reading === '0' ? 'tidak sedang dibaca' : 'sedang dibaca';
      const response = h.response({
        status: 'success',
        message: `Berhasil mendapatkan buku yang ${isReading}`,
        data: {
          books,
        },
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Berhasil mendapatkan buku yang sedang dan tidak sedang dibaca',
      data: {
        books,
      },
    });
    response.code(200);
    return response;
  }

  // query: ?finished
  if (name === undefined && reading === undefined && finished !== undefined) {
    const checkFinishedValue = (book) => {
      if (finished === '0') {
        return book.finished === false;
      }
      if (finished === '1') {
        return book.finished === true;
      }
      return book;
    };

    const finishedBooksDetails = booksDetails.filter(checkFinishedValue);

    const books = finishedBooksDetails.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

    if (finished === '0' || finished === '1') {
      const isFinished = finished === '0' ? 'belum selesai' : 'sudah selesai';
      const response = h.response({
        status: 'success',
        message: `Berhasil mendapatkan buku yang ${isFinished} dibaca`,
        data: {
          books,
        },
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Berhasil mendapatkan buku yang belum dan sudah dibaca',
      data: {
        books,
      },
    });
    response.code(200);
    return response;
  }

  const books = booksDetails.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = booksDetails.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const { bookId } = request.params;
  const updatedAt = new Date().toISOString();

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = booksDetails.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    booksDetails[index] = {
      ...booksDetails[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = booksDetails.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    booksDetails.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  saveBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
