const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const should = chai.should();

chai.use(chaiHttp);

// Test for logging in a user
describe("/POST login", () => {
  // Test for a successful login
  it("it should log in a user with valid credentials", (done) => {
    const user = {
      username: "Ethan",
      password: "Ethan123",
    };

    chai
      .request(server)
      .post("/login")
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Logged in successfully!");
        res.body.should.have.property("user");
        done();
      });
  });

  // Test for a failed login
  it("it should not log in a user with invalid credentials", (done) => {
    const user = {
      username: "invalidUser",
      password: "invalidPassword",
    };

    chai
      .request(server)
      .post("/login")
      .send(user)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property("message").eql("Invalid credentials!");
        done();
      });
  });
});
