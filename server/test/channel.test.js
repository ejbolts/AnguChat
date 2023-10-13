const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

chai.use(chaiHttp);
chai.should();

describe("Channel API", () => {
  let testChannelId;

  // Test to create a channel
  it("should create a channel", (done) => {
    const body = {
      groupId: "65289ed8d38f8996ba8a3dc1", // <-- Adjust with a valid group ID
      name: "testChannel",
      userId: "65259297c355df7316904a4d", // <-- Adjust with a valid user ID
    };
    chai
      .request(app)
      .post("/channel")
      .send(body)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Channel created!");
        testChannelId = res.body._id; // assuming the channel id is returned in the response
        done();
      });
  });

  // Test to fetch all channel
  it("should get all channel", (done) => {
    chai
      .request(app)
      .get("/channel")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
  });
});
