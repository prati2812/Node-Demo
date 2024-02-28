const  mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
      title:{
        type: String,
        required: [true, "Please enter the title"]
      },

      description:{
        type: String,
        required: [true, "Please enter the description"]
      },

      recipeimage: {
        type: String, 
        default: 'default.jpg'  
      },

      ingredients:{
        type:String,
        required: [true, "Please enter the ingredients"]
      },

      difficultyLevel:{
         type: String,
         required:[true , "Please enter the difficulty level"]
      },

      tags:{
        type:Array,
        required: [true , "Please enter the tag"]
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
      
});

module.exports = mongoose.model.RecipeSchema || mongoose.model("Recipe", RecipeSchema);