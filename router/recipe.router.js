const express = require('express');
const authenticate = require('../middleware/auth');
const {createRecipe , updateRecipe , deleteRecipe , viewRecipes , searchRecipes , filterRecipes , sortRecipes , uploadphoto} = require('../controller/recipe.controller');

const recipeRouter = express.Router();



recipeRouter.post('/create-recipe' ,  authenticate  , uploadphoto ,createRecipe);
recipeRouter.put('/update-recipe/:id' , authenticate , updateRecipe);
recipeRouter.delete('/delete-recipe/:id' , authenticate , deleteRecipe);
recipeRouter.get('/view-recipes' , authenticate ,  viewRecipes);
recipeRouter.get('/search-recipes' , authenticate ,  searchRecipes);
recipeRouter.get('/filter-recipes' , authenticate , filterRecipes);
recipeRouter.get('/sort' , authenticate , sortRecipes);




module.exports = recipeRouter;


