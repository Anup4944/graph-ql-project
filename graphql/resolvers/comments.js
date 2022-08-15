const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const auth = require("../../utils/auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = auth(context);

      if (body.trim() === "") {
        throw new UserInputError("Commants cannot be empty", {
          errors: {
            body: "Commants cannot be empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });

        await post.save();

        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = auth(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("You can only delete your comment");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
