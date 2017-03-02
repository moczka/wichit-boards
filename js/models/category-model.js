var app = app || {};

(function(){

  app.Category = Backbone.Model.extend({

    defaults: {
      title: "Category Description",
      subtitle: "Subtitle if any",
      description: "Category description if any",
      warning: "Warning message if any",
      note: {
        "title": "Note title",
        "description": "Note description"
      }
    },

    hasItem: function has(itemName){

      //check if model has a truthy item.
      return this.get(itemName)? true : false;

    }

  });

})();
