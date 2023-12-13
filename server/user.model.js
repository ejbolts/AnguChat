// user.model.js

module.exports = class User {
  constructor(
    id,
    username,
    email,
    password,
    role,
    profilePic,
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
    this.profilePic = profilePic;
    this.groups = groups || [];
    this.reported = reported || false;
    this.bannedChannels = bannedChannels || [];
    this.pendingGroups = pendingGroups || [];
  }
};
