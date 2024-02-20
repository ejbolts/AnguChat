const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");

chai.use(chaiHttp);
chai.should();
const { expect } = chai;
describe("Channel API", () => {
  let testChannelId;

  // Test to create a channel
  it("should create a channel", (done) => {
    const body = {
      groupId: "65289ed8d38f8996ba8a3dc1",
      name: "testChannel",
      userId: "65259297c355df7316904a4d",
    };
    chai
      .request(app)
      .post("/api/channel")
      .send(body)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Channel created!");
        testChannelId = res.body._id;
        done();
      });
  });

  it("should fetch all channel", (done) => {
    chai
      .request(app)
      .get("/api/channel")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
  });

  it("should delete a channel", (done) => {
    chai
      .request(app)
      .delete(`/api/channel/${testChannelId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property("message")
          .equal("Channel deleted!");
        done();
      });
  });

});
