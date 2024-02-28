const Recipe = require('../model/recipe.model');
const jwt = require('jsonwebtoken');
const multer = require('multer');


/**
 * Create Recipe   
 * @param {*} req 
 * @param {*} res 
 */
async function createRecipe(req,res){
       
        const { title, description , ingredients , difficultyLevel , tags } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'title is required' });
        }
        if (!description) {
            return res.status(400).json({ error: 'description is required' });
        }    
        if (!ingredients) {
            return res.status(400).json({ error: 'ingredients is required' });
        }
        if (!difficultyLevel) {
            return res.status(400).json({ error: 'difficulty level is required' });
        }
        if (!tags) {
            return res.status(400).json({ error: 'tags is required' });
        }
    
        const userId = getCurrentUserId(req);
        const recipe = new Recipe({
            title: title,
            description : description,
            recipeimage: req.file.filename,
            ingredients: ingredients,
            difficultyLevel: difficultyLevel,
            tags: tags,
            userId: userId,
        });
    
        await recipe.save();
        res.status(201).json({ message: 'Recipe created successfully', recipe: recipe , userId: userId }); 
    
}


/**
 *  Update Recipe 
 * @param {*} req 
 * @param {*} res 
 * 
 */
async function updateRecipe(req,res){
        const recipeId = req.params.id;
        const updatedData = req.body;
        
        if(!recipeId){
            return res.status(400).json({
                message:"Recipe id is required",
            });
        }


        if(!updatedData){
            return res.status(400).json({
                message:"Recipe not found",
            });
        }

        await Recipe.findByIdAndUpdate(recipeId , updatedData);


        res.status(201).json({
            message: 'Recipe Updated Successfully',
            
        })
}

/**
 * Delete Recipe
 * @param {*} req 
 * @param {*} res 
 * 
 */
async function deleteRecipe(req,res){
          const recipeId = req.params.id;
          if(!recipeId){
            return res.status(400).json({
                message: "Recipe Id is required",
            })
          }
          const recipe = await Recipe.findOne({_id:recipeId});
          if(!recipe){
            return res.status(400).json({
                message: "Recipe is already deleted",
            })
          }
          await recipe.deleteOne();
          res.status(201).json({
            message: 'Recipe Deleted Successfully',
            recipeId: recipeId,
        })

}

/**
 *  View Recipes
 * @param {*} req 
 * @param {*} res 
 * 
 */
async function viewRecipes(req,res){
        const currrentUserId = getCurrentUserId(req);

        const recipes = await Recipe.find({userId:currrentUserId});

        res.status(200).json({
            "Recipes": recipes,
        })
}


/**
 * Search Recipes based on title
 * @param {*} req 
 * @param {*} res 
 */
async function searchRecipes(req,res){
         const currentUserId = getCurrentUserId(req);
         let query = {};
         query = {
            userId: currentUserId
         }
         if(req.query.q){
            const regex = new RegExp(req.query.q, 'i');
            query.$or = [ { title: regex }, {ingredients : regex } ];
         }
         
         const recipes = await Recipe.find(query);
         
         res.json(recipes);   
}

/**
 * Filter Recipes based on difficultylevel
 * @param {*} req 
 * @param {*} res 
 */
async function filterRecipes(req,res){
        const currentUserId = getCurrentUserId(req);
        let level = {};
        level = {
            userId: currentUserId
        }
        if(req.query.level){
            const regex = new RegExp('\\b' + req.query.level + '\\b', 'i');
            level.$or = [ {difficultyLevel: regex} , {tags: regex}];  
        }

        const recipes = await Recipe.find(level);
        res.json(recipes);
}

/**
 * Sort the Recipes
 * @param {*} req 
 * @param {*} res 
 */
async function sortRecipes(req,res){
        const currentUserId = getCurrentUserId(req);
        const recipes = await Recipe.find({userId:currentUserId}).sort({title: -1});
        res.status(200).json({
            "Recipes": recipes,
        });
}




/**
 *  fetch current user id
 * @param {token} req 
 * @returns Object
 */
function getCurrentUserId(req){
    const token = req.cookies.token;
    if(!token){
       return null;
    }
    try {
     const decoded = jwt.verify(token, 'WHAT-WAS'); 
     const userId = decoded.userId;

     return userId;
 } catch (error) {
     console.error('Error decoding token:', error);
     return null;
 }
}


/**
 *  Set Folder Path to store the recipe image
 */
const multerStorage = multer.diskStorage({
    destination: (req,file , cb) =>{
       cb(null , 'public/image/recipe');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null  , `user-${getCurrentUserId(req)}-${Date.now()}. ${ext}`);
    }
});

/**
 *   It's check the file type image or not  
 *
 */
const multerfilter = (req, file , cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }
    else{
        cb(new AppError('Not Image , Please upload only image' , 400),false);
    }
};

const upload = multer( {
    storage: multerStorage,
    fileFilter: multerfilter
});
const uploadphoto = upload.single('recipeimage')


module.exports = {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    viewRecipes,
    searchRecipes,
    filterRecipes,
    sortRecipes,   
    uploadphoto 
}
