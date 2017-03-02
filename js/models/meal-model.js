var app = app || {};

(function(){

  app.Meal = Backbone.Model.extend({

    defaults: {
      title: "",
      description: "",
      from: "0",
      order: 0
    }

  });

})();
