var app = app || {};

(function(){

  app.MealModel = Backbone.Model.extend({

    defaults: {
      title: "",
      description: "",
      from: "0",
      order: 0
    }

  });

})();
