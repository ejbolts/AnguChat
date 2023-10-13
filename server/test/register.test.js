const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
const { connect, db, close } = require("../routes/app.js");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Register Route Tests", function () {
  before(async function () {
    // Connect to the database once before all tests
    await connect();
  });

  after(async function () {
    // Close the connection once after all tests
    await close();
  });

  it("should register a new user", function (done) {
    chai
      .request(app)
      .post("/register")
      .send({
        username: "newtestuser",
        email: "testuser@email.com",
        password: "testpassword",
        role: "user",
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("User registered!");
        expect(res.body).to.have.property("_id");
        done();
      });
  });

  it("should not register a user with existing username", function (done) {
    chai
      .request(app)
      .post("/register")
      .send({
        username: "newtestuser",
        email: "testuser@email.com",
        password: "testpassword",
        role: "user",
      })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .equal("Username already exists.");
        done();
      });
  });
});
