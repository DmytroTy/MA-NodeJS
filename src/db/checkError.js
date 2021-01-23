const PG_CODE_NOT_NULL_CONSTRAINT_WAS_VIOLATED = '23502';

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
  if (err.code === PG_CODE_NOT_NULL_CONSTRAINT_WAS_VIOLATED) {
    return new DatabaseError(`ERROR: This ${err.column.slice(0, -3)} not exist`);
  }

  if (err.constraint === 'users_username_unk') {
    return new DatabaseError('ERROR: A user with the same username is already registered!');
  }

  return err;
}

module.exports = { checkError, DatabaseError };
