var app = app || {};

(function(){

  'use strict';

  var Meals = Backbone.Collection.extend({

    model: app.Meal,

    localStorage: new Backbone.LocalStorage('wichit-meals'),

    url: '../../json/categories.json',

    parse: function(data){

      return data.meals;

    },

    getFrom: function(categoryName){

      this.where({from: categoryName});

    },

    comparator: 'page'

  });

  app.Meals = new Meals();

})();
