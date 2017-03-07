var app = app || {};

(function(){

  var app.MealView = Backbone.View.extend({

    tagName: 'li',
    className: 'meal',
    template: _.template($('#mealTemplate').html()),
    events: {
      'dblclick .meal-content': 'edit',
      'keyup .edit': 'onExitKey',
    },

    initialize: function () {

      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);

    },

    onExitKey: function(e) {

      if(e.keyCode === ENTER_KEY){
        this.$el.removeClass('is-meal-editing');
        this.updateModel();
      }else if(e.keyCode === ESC_KEY){
        this.revertOnEscape();
      }

    },

    revertOnEscape: function(){

      this.$el.removeClass('is-meal-editing');
      this.$inputTitle.val(this.model.get('title'));
      this.$inputDescription.html(this.model.get('description'));

    },

    updateModel: function () {

      //get new values
      var title = this.$inputTitle.val().trim(),
          description = this.$inputDescription.val().trim();

          //update model if values are truthy
          if(title && description){
            this.model.save({title: title, description: description});
          }else{
            this.clear();
          }

    },

    edit: function(){

      if(this.$el.hasClass('is-meal-editing')){
        return;
      }
      //changes the module state to editing
      this.$el.addClass('is-meal-editing');

    },

    clear: function() {

      //destroys model since all values were empty
      this.model.destroy();

    },

    render: function(){

        //prevent double reflow from backbone storage.
      if (this.model.changed.id !== undefined) {
        return;
      }

      this.$el.html(this.template(this.model.toJSON()));
      this.$inputTitle = this.$el.find('.meal-edit-title');
      this.$inputDescription = this.$el.find('.meal-edit-description');

      return this;

    }

  });

})();
