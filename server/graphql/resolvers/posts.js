import Post from "../../models/Post.js";
import { checkAuth } from "../../util/checkAuth.js";
import { AuthenticationError, UserInputError } from "apollo-server";

const postsResolvers = {
  Query: {
    async getPosts() {
      try {
        // Trying to get all Posts
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getPost(parent, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createPost(parent, { body }, context) {
      const user = checkAuth(context);

      if (body.trim() === "") {
        throw new Error("Post Body Must not be empty");
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      return post;
    },

    async deletePost(parent, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action Not Allowed");
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async likePost(parent, { postId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // post already liked so unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // post not liked so like it
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};

export default postsResolvers;
