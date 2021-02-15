class DatabaseError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }

    this.name = 'DatabaseError';
  }
}

function checkError(err) {
  if (err.table === 'products') {
    if (err.column === 'color_id') {
      return new DatabaseError('ERROR: Such color not exist');
    }
    if (err.column === 'type_id') {
      return new DatabaseError('ERROR: Such product type not exist');
    }
  }

  if (err.constraint === 'users_username_unk') {
    return new DatabaseError('ERROR: A user with the same username is already registered!');
  }

  if (err.constraint === 'products_quantity_check') {
    return new DatabaseError('ERROR: Such products are not enough in stock for this order!');
  }

  return err;
}

module.exports = { checkError, DatabaseError };
