const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
const { expect } = chai;

chai.use(chaiHttp);

describe("Group Route Tests", () => {
  let testUserId = "65bcc4ecfd6567b3a70f5746";
  let createdGroupId;

  describe("POST /api/create", () => {
    it("should create a new group", (done) => {
      chai
        .request(app)
        .post("/api/group/create") // Assuming your route starts with '/groups'
        .send({
          name: "Test Group",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("Group created successfully!");
          expect(res.body).to.have.property("groupId");
          createdGroupId = res.body.groupId; // Store the group ID for future tests
          done();
        });
    });
  });

  describe("POST /api/:groupId/addUser", () => {
    it("should add a user to a group", (done) => {
      chai
        .request(app)
        .post(`/api/group/${createdGroupId}/addUser`)
        .send({
          userId: testUserId
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("User added to group!");
          done();
        });
    });
  });

  describe("GET /api/groups", () => {
    it("should fetch all groups", (done) => {
      chai
        .request(app)
        .get("/api/group") // Fetching all groups
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array"); // Ensure it returns an array
          done();
        });
    });
  });

  describe("group routes", () => {

    it("should fetch channels for a given group", (done) => {
      chai
        .request(app)
        .get(`/api/group/${createdGroupId}/channels`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });

    // Test for requesting to join a group
    it("should send a join request for a given group", (done) => {
      chai
        .request(app)
        .post(`/api/group/${createdGroupId}/join`)
        .send({ userId: "65bcc4ecfd6567b3a70f5747" }) // this is a pre existing user
        .end((err, res) => {
          console.log(res.body);
          console.log(res.status);
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Join request sent!");
          done();
        });
    });

    // Test for approving a user to join a group
    it("should approve a user for a given group", (done) => {
      chai
        .request(app)
        .post(`/api/group/${createdGroupId}/approveUser`)
        .send({ userId: "65bcc4ecfd6567b3a70f5747" }) // this is a pre existing user
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have
            .property("message")
            .eql("User approved and added to group!");
          done();
        });
    });

    // Test for removing a user from a group
    it("should remove the approved user from the group", (done) => {
      chai
        .request(app)
        .post(`/api/group/${createdGroupId}/removeUser`)
        .send({ userId: testUserId })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have
            .property("message")
            .eql("User removed from group!");
          done();
        });
    });

    it("should delete a group and its channels", (done) => {
      chai
        .request(app)
        .delete(`/api/group/${createdGroupId}`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("Group and its channels deleted successfully!");
          done();
        });
    });
  });
});
