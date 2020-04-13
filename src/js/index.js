//Global App Controller
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import { elements, renderLoader, clearLoader } from "./views/base";

/**Global state of the app
 * -Search object
 * -Current recipe object
 * -shopping list
 * -liked recipes
 */
const state = {};
window.state = state;
//Search Controller

const controlSearch = async () => {
  //1 get query from view
  const query = searchView.getInput();
  if (query) {
    //2 New search object and add it to state
    state.search = new Search(query);

    //3 Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      //4 Search for recipes
      await state.search.getResults();

      //5 renderresults on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert("Something went wrong with the Search..");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

//Recipe Controller
const controlRecipe = async () => {
  //Get id from URL
  const id = window.location.hash.replace("#", "");
  console.log(id);
  if (id) {
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected recipe
    if (state.search) searchView.highlightSelected(id);

    //Create recipe object
    state.recipe = new Recipe(id);

    try {
      //Get reicpe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //Calculate time and servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      //render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (err) {
      alert("Error processing recipe");
    }
  }
};

//window.addEventListener("hashchange", controlRecipe);
//window.addEventListener("load", controlRecipe);
["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

/**
 * List Controller
 */
const controlList = () => {
  //create a new list if none is there
  if (!state.list) state.list = new List();

  //Add each ingredient to the list
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

//handling delete and add list items events\
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__list").dataset.itemid;

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from state
    state.list.deleteItem(id);
    //delete from UI
    listView.deleteItem(id);
  }
});

//handling recipe button clicks
elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease,.btn-decrease *")) {
    //Decrease button
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase,.btn-increase *")) {
    //Increase button
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  }
});

window.l = new List();
