class CustomError {
  constructor(message, codes, error) {
    (this.error = error), (this.message = message), (this.codes = codes);
  }
}
module.exports = CustomError;
