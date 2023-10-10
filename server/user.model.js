// user.model.js

module.exports = class User {
  constructor(
    id,
    username,
    email,
    password,
    role,
    groups,
    reported,
    bannedChannels,
    pendingGroups
  ) {
    this._id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.groups = groups || [];
    this.reported = reported || false;
    this.bannedChannels = bannedChannels || [];
    this.pendingGroups = pendingGroups || [];
  }
};
