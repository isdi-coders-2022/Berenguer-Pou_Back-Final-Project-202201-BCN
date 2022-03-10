require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../../db/models/User");
const encryptPassword = require("../utils/encryptPassword");
const { userLogin, userRegister } = require("./usersControllers");

describe("Given a userLogin controller", () => {
  describe("When it receives a response with invalid username Paquito", () => {
    test("Then it should call next with error 'User Paquito not found!'", async () => {
      const req = {
        body: {
          username: "Paquito",
          password: "1234",
        },
      };
      const next = jest.fn();
      const error = new Error(`User ${req.body.username} not found!`);

      User.findOne = jest.fn().mockResolvedValue(null);

      await userLogin(req, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("When it receives a response with invalid password", () => {
    test("Then it should call next with error 'Invalid password'", async () => {
      const req = {
        body: {
          username: "Simón",
          password: "12345",
        },
      };
      const next = jest.fn();
      const error = new Error("Invalid credentials!");
      const user = {
        username: "Simón",
        password:
          "$2b$10$7uqVZ5a5QmeinnPp098Us.09BLm2xUGbB7fC4P8I4lq7n5KWadpRO",
      };

      User.findOne = jest.fn().mockResolvedValue(user);

      await userLogin(req, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("When it receives a response with an error 'throw exception'", () => {
    test("Then it should call next with error 'throw exception'", async () => {
      const req = {
        body: {
          username: "Simón",
          password: "12345",
        },
      };
      const next = jest.fn();
      const error = new Error("throw exception");

      User.findOne = jest.fn().mockRejectedValue(error);

      await userLogin(req, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("When it receives request with valid username and password", () => {
    test("Then it should return a valid token", async () => {
      const req = {
        body: { username: "Pedrín", password: "asasas", name: "Pedro Pérez" },
      };
      const user = {
        name: "Pedro Pérez",
        username: "Pedrín",
        password:
          "$2b$10$vXpv46E7TEgM5sn/gPIb9uU0ITpMYwS07YJO1RZr8J1InWuDnfz0i",
        tracks: [],
        id: "6217c5e7450ed2448657abf8",
      };

      User.findOne = jest.fn().mockResolvedValue(user);

      const token = jwt.sign(user, process.env.JWT_SECRET);
      const res = {
        json: jest.fn().mockResolvedValue(token),
      };

      await userLogin(req, res, () => null);

      expect(res.json).toHaveBeenCalled();
    });
  });
});

describe("Given a userRegister controller", () => {
  describe("When it receives 'Pere', 'Pere8' and 'asasas' as name, username and password", () => {
    test("Then it should call status method with 201 and json method with message 'User registered with username: Pere'", async () => {
      const req = {
        body: { username: "Pere", password: "asasas", name: "Pere8" },
      };
      const encryptedPassword = await encryptPassword(req.body.password);
      const newUsername = {
        username: req.body.username,
        password: encryptedPassword,
        name: req.body.name,
      };
      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(newUsername);
      const expectedMessage = {
        message: `User registered with username: ${req.body.username}`,
      };
      const res = {
        json: jest.fn(),
        status: jest.fn(),
      };

      await userRegister(req, res, null);

      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe("When it receives an already taken username", () => {
    test("Then it should call next method wirth an error message 'Username Beren already exists!'", async () => {
      const req = {
        body: { username: "Beren", password: "asasas", name: "Pedro Pérez" },
      };
      await encryptPassword(req.body.password);
      User.findOne = jest.fn().mockResolvedValue(true);
      const error = new Error(`Username ${req.body.username} already exists!`);
      const next = jest.fn();

      await userRegister(req, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("When it receives an error 'throw exception'", () => {
    test("Then it should call next with error 'throw exception'", async () => {
      const req = {
        body: { username: "Beren", password: "asasas", name: "Pedro Pérez" },
      };
      const error = new Error(`Username ${req.body.username} already exists!`);

      await encryptPassword(req.body.password);
      User.findOne = jest.fn().mockRejectedValue(error);

      const next = jest.fn();

      await userRegister(req, null, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
