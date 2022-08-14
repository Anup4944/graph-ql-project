const Post = require("../../models/Post");
const auth = require("../../utils/auth");
const { AuthenticationError } = require("apollo-server");

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
  },
};
