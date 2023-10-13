const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Remove & Register Route Tests", () => {
  let testUserId;

  it("should register a new user", function (done) {
    const testUser = {
      username: "testuser123",
      email: "test123@email.com",
      password: "testpassword123",
      role: "groupAdmin",
      groups: [],
      reported: false,
      bannedChannels: [],
      pendingGroups: [],
    };

    chai
      .request(app)
      .post("/register")
      .send(testUser)
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("User registered!");
        expect(res.body).to.have.property("_id");
        testUserId = res.body._id; // Store the user ID for future tests
        done();
      });
  });

  it("should not register a user with existing username", function (done) {
    chai
      .request(app)
      .post("/register")
      .send({
        username: "testuser123",
        email: "test123@email.com",
        password: "testpassword123",
        role: "groupAdmin",
      })
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body)
          .to.have.property("message")
          .equal("Username already exists.");
        done();
      });
  });

  after((done) => {
    // Cleanup the test user
    chai
      .request(app)
      .delete(`/remove/${testUserId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should delete a user by a valid ID", (done) => {
    chai
      .request(app)
      .delete(`/remove/${testUserId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .eql("User and their group memberships removed!");
        done();
      });
  });

  it("should return an error for an invalid ID format", (done) => {
    chai
      .request(app)
      .delete("/remove/invalid_id")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Invalid ID format");
        done();
      });
  });

  it("should return an error for a non-existent user ID", (done) => {
    // Use an ID that does not exist in your database.
    const nonExistentUserId = "1234";

    chai
      .request(app)
      .delete(`/remove/${nonExistentUserId}`)
      .end((err, res) => {
        // Here, we're assuming that MongoDB will just not find the user and not throw an error.
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").eql("Invalid ID format");
        done();
      });
  });
});
