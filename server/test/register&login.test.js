const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

const expect = chai.expect;
chai.use(chaiHttp);
let testUserId;

const testUser = {
  username: "Ethan",
  email: "ethan123@email.com",
  password: "Ethan123",
  role: "groupAdmin",
  groups: [],
  isOnline: false,
};
describe("test creation and login of user", () => {
  // need to create a user first to check if the login works
  it("should register a new user", function (done) {
    chai
      .request(app)
      .post("/api/authentication")
      .send(testUser)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("User registered!");
        expect(res.body).to.have.property("_id");
        testUserId = res.body._id; // Store the user ID for future tests
        done();
      });
  });
  // Test for a successful login
  it("it should log in a user with valid credentials", (done) => {
    chai
      .request(app)
      .post("/api/authentication/login")
      .send(testUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Logged in successfully!");
        res.body.should.have.property("user");
        done();
      });
  });

  // Test for a failed login
  it("it should not log in a user with invalid password", (done) => {
    const invalidUser = {
      username: "Ethan",
      email: "ethan123@email.com",
      password: "invalidPassword",
      role: "groupAdmin",
      groups: [],
      isOnline: false,
    };

    chai
      .request(app)
      .post("/api/authentication/login")
      .send(invalidUser)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property("message").eql("Invalid credentials");
        done();
      });
  });
});
describe("validate register and remove user Tests", () => {
  it("should not register a user with existing username", function (done) {
    chai
      .request(app)
      .post("/api/authentication")
      .send(testUser)
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .equal("Username already exists.");
        done();
      });
  });

  it("should delete a user by a valid ID", (done) => {
    chai
      .request(app)
      .delete(`/api/remove/${testUserId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("User and their group and channel memberships removed!");
        done();
      });
  });


  it("should return an error for an invalid ID format", (done) => {

    const invalidChannelId = "123";

    chai
      .request(app)
      .delete(`/api/channel/${invalidChannelId}/removeUser`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Invalid ID format");
        done();
      });
  });


  it("should return an error for a non-existent user ID", (done) => {
    // Use an ID that does not exist in your database.
    const nonExistentUserId = "nonExistentUserId";

    chai
      .request(app)
      .delete(`/api/remove/${nonExistentUserId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Invalid ID format");
        done();
      });
  });
});
