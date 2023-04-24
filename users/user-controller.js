import * as userDao from "./user-dao.js";

const createUser = async (req, res) => {
  const user = req.body;
  user.admin = false;
  const status = await userDao.createUser(user);
  res.json(status);
};

const findUser = async (req, res) => {
  const users = await userDao.findUser();
  res.json(users);
};

const updateUser = async (req, res) => {
  const user = req.body;
  const userId = req.params.uid;
  const status = await userDao.updateUser(userId, user);
  res.json(status);
};

const deleteUser = async (req, res) => {
  const userId = req.params.uid;
  const status = await userDao.deleteUser(userId);
  res.json(status);
};

export default (app) => {
  app.post("/api/users", createUser);
  app.get("/api/users", findUser);
  app.put("/api/users/:uid", updateUser);
  app.delete("/api/users/:uid", deleteUser);
};
