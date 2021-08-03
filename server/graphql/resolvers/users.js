import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInputError } from "apollo-server";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../../util/validators.js";

// Generate new token that is valid for 1hr
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
};

const usersResolvers = {
  Mutation: {
    // Handling Login functionality
    async login(parent, { username, password }, context, info) {
      const { valid, errors } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      // Finding user
      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      // Trying to match the credentials
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Credentials";
        throw new UserInputError("Wrong Credentials", { errors });
      }

      const token = generateToken(user);

      // Returning the user data
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    // Handling the register functionality
    async register(
      parent,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      // Checking if username is unique or not
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is Taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }

      // Hashing the password for security
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      // Getting the data of registered user
      const res = await newUser.save();

      const token = generateToken(res);

      // Returning the user data
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};

export default usersResolvers;
