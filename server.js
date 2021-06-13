const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const axios =require('axios');
const server=express();
require('dotenv').config()
const PORT=process.env.PORT; 

server.use(cors());
server.use(express.json());

mongoose.connect('mongodb://localhost:27017/training',{ useNewUrlParser: true, useUnifiedTopology: true });
const recipeSchema= new mongoose.Schema({
    label:String,
    image:String,
    healthLabels:Array,

})
const recipeModel = mongoose.model('recipe',recipeSchema)
server.get('/test',testHandler)
server.get('/getrecipes',recipesHandler)
server.post('/saverecipes',saveRecipeHandler)
server.get('/getmyrecipes',myrecipesHandler)
server.delete('/deleterecipes/:id',deleteRecipesHandler)
server.put('/updaterecipes/:id',updateRecipesHandler)

function recipesHandler(req,res){
    let ingredient=req.query.ingredient
    axios.get(`https://api.edamam.com/api/recipes/v2?q=${ingredient}&app_key=${process.env.API_KEY}&_cont=CHcVQBtNNQphDmgVQntAEX4BYldtBAcHQGRGAGcRa1F3BgAPUXlSADZGYld7AVBSF2VIUjAVYFx6AAIAQTZDAmZHZFRyUgEVLnlSVSBMPkd5BgMbUSYRVTdgMgksRlpSAAcRXTVGcV84SU4%3D&type=public&app_id=f26a2e68`).then(result=>{
        let RecipeArray=result.data.hits.map(item=>{
            return new Recipe(item)


        })

        res.send(RecipeArray);
    })

}
class Recipe {
    constructor(item){
        this.label=item.recipe.label
        this.image=item.recipe.image
        this.healthLabels=item.recipe.healthLabels
    }
}
function saveRecipeHandler(req,res){
    let recipe=req.body;
    let newRecipe= new recipeModel({
        label:recipe.label,
        image:recipe.image,
        healthLabels:recipe.healthLabels,
    })
    newRecipe.save();
    console.log(newRecipe)


    
}

function testHandler(req,res){
    res.send('this is atest raasdoute')
}
function myrecipesHandler(req,res){
    recipeModel.find({},(error,result)=>{
        res.send(result);
        
    })
}
function deleteRecipesHandler(req,res){
    let id=req.params.id;
    console.log(id)
    recipeModel.remove({_id:id},(error,result)=>{
        recipeModel.find({},(error,data)=>{
            res.send(data)
        })
    })
}
function updateRecipesHandler(req,res){
    let id=req.params.id;
    let recipe=req.body;
    console.log(id,recipe)
    recipeModel.findOne({_id:id},(error,result)=>{
        result.label=recipe.label
        result.image=recipe.image
        result.save()
        recipeModel.find({},(error,data)=>{
            res.send(data)
        })

    })
}


server.listen(PORT,()=>{
    console.log('I am active')
})