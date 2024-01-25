// user.model.js

module.exports = class User {
  constructor(
    id,
    username,
    password,
    role,
    profilePic,
    groups,
    isOnline,
  ) {
    this._id = id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.profilePic = profilePic;
    this.groups = groups || [];
    this.isOnline = isOnline;
  }
};
