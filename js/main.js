window.onload = function(){


    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    var $app = $('#app'),
        jsonData,
        ajax = $.get('json/categories.json');

    var templates = {
        category: _.template($('#categoryTemplate').html()),
        meal: _.template($('#mealTemplate').html()),
        option: _.template($('#optionTemplate').html())
    };

    ajax.then(function(){
      jsonData = ajax.responseJSON;
      attach();
    });

    function attach(){

      var categoryData = jsonData.boards[3];

      console.log(categoryData);

      $app.empty();

      var $category = $(templates.category(categoryData));


      $category.delegate('.meal', 'dblclick keydown', function(e){

        var $el = $(this)
            hasClass = $el.hasClass('is-meal-editing'),
            keyCode = e.keyCode;

        console.log('double click is working', hasClass);

        if(!hasClass){
          $el.addClass('is-meal-editing');
        }else if(keyCode === 13 || keyCode === 27 || !keyCode){
          $el.removeClass('is-meal-editing');
        }

      });

      _.each(categoryData.category.meals, function(mealData){

        var $meal = $(templates.meal(mealData));

        console.log(mealData, 'meal data object');

          _.each(mealData.meal.options, function(optionData){


              var $option = $(templates.option(optionData))

              console.log($option);

              $meal.find('.meal-options').append($option);

          });

            $category.find('.category-meals').append($meal);

      });

      $app.append($category);

    }












};
