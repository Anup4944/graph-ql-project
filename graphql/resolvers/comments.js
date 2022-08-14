const { UserInputError } = require("apollo-server");
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
  },
};
