/** User class for message.ly */

const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { DB, SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // save to db
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) 
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) 
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return results.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const results = await db.query(
      `SELECT username, password 
      FROM users
      WHERE username = $1`, [username]);

    const user = results.rows[0];
    if (user) {
      const user_valid = await bcrypt.compare(password, user.password)
      return user_valid;
    }
    throw new ExpressError("Invalid username/password", 400);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const results = await db.query(
      `UPDATE users 
      SET last_login_at = current_timestamp 
      WHERE username = $1`, [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(
    `SELECT username, first_name, last_name, phone 
    FROM users`);

    if (results.rows.length === 0) {
      throw new ExpressError("No users", 404)
    }
    return results.rows
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at 
      FROM users
      WHERE username = $1`, [username]);

      if (!results.rows[0]) {
        throw new ExpressError("User not found", 404)
      }
      return results.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;