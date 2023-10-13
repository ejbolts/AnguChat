const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
const { expect } = chai;

chai.use(chaiHttp);

describe("Update Route Tests", () => {
  let testUserId;

  before((done) => {
    // Create a test user
    const testUser = {
      username: "updatetestuser",
      email: "updatetestuser@email.com",
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
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id");
        testUserId = res.body._id; // Store the user ID for the update tests
        done();
      });
  });
  it("should update the role of an existing user", (done) => {
    chai
      .request(app)
      .put(`/update/${testUserId}/role`)
      .send({ role: "newRole" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .equal("User role updated!");
        done();
      });
  });

  it("should return error when role is not provided in request", (done) => {
    chai
      .request(app)
      .put(`/update/${testUserId}/role`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").equal("Role is required.");
        done();
      });
  });
  after((done) => {
    chai
      .request(app)
      .delete(`/remove/${testUserId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
