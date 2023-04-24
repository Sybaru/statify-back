import mongoose from 'mongoose';
const schema = mongoose.Schema({
  username: String,
  password: String,
  spotify: String,
  admin: Boolean,
}, {collection: 'users'});
export default schema; 