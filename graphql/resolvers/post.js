const Post = require("../../models/Post");
const auth = require("../../utils/auth");
const { AuthenticationError, UserInputError } = require("apollo-server");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const post = await Post.find().sort({ createdAt: -1 });
        return post;
      } catch (error) {
        throw new Error(error);
      }
    },

    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);

        return post;
      } catch (err) {
        throw new Error("Post not found");
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = auth(context);

      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
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
    async deletePost(_, { postId }, context) {
      const user = auth(context);

      try {
        const post = await Post.findById(postId);

        if (user.username === post.username) {
          await post.delete();
          return "Post deleted";
        } else {
          throw new AuthenticationError("You can only deleted your post");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = auth(context);

      const post = await Post.findById(postId);

      if (post) {
        if (post.likes.find((like) => like.username)) {
          //  liked post, unlike post
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // not liked post, like post
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
