const { GraphQLError } = require("graphql");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("books");
      }
      throw new GraphQLError("You need to be logged in!", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new GraphQLError("No profile with this email found!", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new GraphQLError("Incorrect password!", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { bookId }, context) =>  {
  console.log(context.user);
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: context.user._id },
      { $addToSet: { savedBooks: {...bookId} } },
      { new: true, runValidators: true }
    );
    return res.json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
},

    // GraphQL? Route
    // addThought: async (parent, { thoughtText }, context) => {
    //   if (context.user) {
    //     const thought = await Thought.create({
    //       thoughtText,
    //       thoughtAuthor: context.user.username,
    //     });

    //     await User.findOneAndUpdate(
    //       { _id: context.user._id },
    //       { $addToSet: { thoughts: thought._id } }
    //     );

    //     return thought;
    //   }
    //   throw new GraphQLError("You need to be logged in!", {
    //     extensions: {
    //       code: "UNAUTHENTICATED",
    //     },
    //   });
    // },
    // *****************************************
    // removeBook
        // My code
        // deleteBook: async 

    //Api Route \/ 
    // async deleteBook({ user, params }, res) {
    //   const updatedUser = await User.findOneAndUpdate(
    //     { _id: user._id },
    //     { $pull: { savedBooks: { bookId: params.bookId } } },
    //     { new: true }
    //   );
    //   if (!updatedUser) {
    //     return res.status(404).json({ message: "Couldn't find user with this id!" });
    //   }
    //   return res.json(updatedUser);
    // },
    // // from mini project
    // //GraphQL? Route
    // removeBook: async (parent, { thoughtId }, context) => {
    //   if (context.user) {    
    //     //     \/ need to change \/ these
    //     const thought = await Thought.findOneAndDelete({
    //       _id: thoughtId, // need to change this?
    //       thoughtAuthor: context.user.username, // need to change this?
    //     });

    //     await User.findOneAndUpdate(
    //       { _id: context.user._id },
    //       { $pull: { thoughts: thought._id } }
    //     );

    //     return thought;
    //   }
    //   throw new GraphQLError("You need to be logged in!", {
    //     extensions: {
    //       code: "UNAUTHENTICATED",
    //     },
    //   });
    // },

  },
};

module.exports = resolvers;