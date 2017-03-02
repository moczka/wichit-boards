var app = app || {};

(function(){

  'use strict';

   var Categories = Backbone.Collection.extend({

     model: app.Category,

     url: '../../json/categories.json',

     parse: function(data){

       return data.boards;

     },

     localStorage: new Backbone.LocalStorage('wichit-categories'),

     getCategory: function(categoryName){

      return this.where({name: categoryName});

      },

      comparator: 'page'

   });

   app.Categories = new Categories();

})();
