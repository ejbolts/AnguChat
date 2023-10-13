const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
const { expect } = chai;

chai.use(chaiHttp);

describe("Group Route Tests", () => {
  let testUserId = "65259297c355df7316904a4d"; // Use a test user's ID if you have one
  let anotherUserId = "ANOTHER_USER_ID_HERE";
  let createdGroupId;

  describe("POST /create", () => {
    it("should create a new group", (done) => {
      chai
        .request(app)
        .post("/group/create") // Assuming your route starts with '/groups'
        .send({
          name: "Test Group",
          userId: testUserId,
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

  describe("POST /:groupId/addUser", () => {
    it("should add a user to a group", (done) => {
      chai
        .request(app)
        .post(`/group/${createdGroupId}/addUser`)
        .send({
          userId: anotherUserId, // Use another test user's ID or a dummy one
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

  describe("GET /groups", () => {
    it("should fetch all groups", (done) => {
      chai
        .request(app)
        .get("/group") // Fetching all groups
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array"); // Ensure it returns an array
          done();
        });
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a group and its channels", (done) => {
      chai
        .request(app)
        .delete(`/group/${createdGroupId}`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("Group and its channels deleted successfully!");
          done();
        });
    });

    describe("POST /:groupId/channel", () => {
      it("should create a channel in a group", (done) => {
        chai
          .request(app)
          .post(`/group/${createdGroupId}/channel`)
          .send({ name: "TestChannel" })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(500);
            done();
          });
      });
    });

    it("should fetch channels for a given group", (done) => {
      const groupId = "65289ed8d38f8996ba8a3dc1"; // a valid group ID
      chai
        .request(app)
        .get(`/group/${groupId}/channels`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });

    // Test for requesting to join a group
    it("should send a join request for a given group", (done) => {
      const groupId = "65289ed8d38f8996ba8a3dc1"; //  a valid group ID
      chai
        .request(app)
        .post(`/group/${groupId}/join`)
        .send({ userId: anotherUserId })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Join request sent!");
          done();
        });
    });

    // Test for approving a user to join a group
    it("should approve a user for a given group", (done) => {
      const groupId = "65289ed8d38f8996ba8a3dc1"; // a valid group ID
      chai
        .request(app)
        .post(`/group/${groupId}/approveUser`)
        .send({ userId: anotherUserId })
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
      const groupId = "65289ed8d38f8996ba8a3dc1"; // a valid group ID
      chai
        .request(app)
        .post(`/group/${groupId}/removeUser`)
        .send({ userId: anotherUserId })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have
            .property("message")
            .eql("User removed from group!");
          done();
        });
    });
  });
});
