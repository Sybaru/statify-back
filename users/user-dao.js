import userModel from './user-model.js';
export const findUser = () => userModel.find();
export const createUser = (user) => userModel.create(user);
export const deleteUser = (userid) => userModel.deleteOne({_id: userid});
export const updateUser = (userid, user) => userModel.updateOne({_id: userid}, {$set: user});
export const linkSpotify = (userid, spotify) => userModel.updateOne({_id: userid}, {$set: spotify});
export const makeAdmin = (userid) => userModel.updateOne({_id: userid}, {$set: {admin: true}});