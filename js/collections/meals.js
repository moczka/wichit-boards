var app = app || {};

(function(){

  'use strict';

  var Meals = Backbone.Collection.extend({

    model: app.Meal,

    localStorage: new Backbone.LocalStorage('wichit-meals'),

    url: '../../json/categories.json',

    parse: function(data){

      //compress all meals into one array from the JSON data
      var meals = data.boards.reduce(function(accum, current){

        return accum.concat(current.category.meals);

      }, data.boards[0].category.meals);

      return meals;

    },

    getFrom: function(categoryName){

      this.where({from: categoryName});

    },

    comparator: 'page'

  });

  app.Meals = new Meals();

})();
