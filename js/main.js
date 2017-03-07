window.onload = function(){

    var ID = 0;

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    var $app = $('#app'),
        jsonData,
        ajax = $.get('json/categories.json');

    var templates = {
        category: _.template($('#categoryTemplate').html()),
        meal: _.template($('#mealTemplate').html()),
        option: _.template($('#optionTemplate').html())
    };

    window.getJSON = exportData;

    ajax.then(function(){
      jsonData = ajax.responseJSON;
      attach();
    });

    function getData(){

      var data = {
        meals: []
      };

      for(var meal in localStorage){
        if(localStorage.hasOwnProperty(meal)){
          data.meals.push(JSON.parse(localStorage[meal]));
        }
      }

      return JSON.stringify(data);


    }

    function attach(){

      var categoryData = jsonData.boards[0];

      console.log(categoryData);
      window.responseData = jsonData;

      $app.empty();

      var $category = $(templates.category(categoryData));

      $category.find('.category-meals').delegate('.meal', 'dblclick keydown', handleInteraction);

      _.each(categoryData.category.meals, function(mealData){

        var $meal = $(templates.meal(mergeProps(mealData)));

          _.each(mealData.meal.options, function(optionData){


              var $option = $(templates.option(optionData))

              console.log($option);

              $meal.find('.meal-options').append($option);

          });

            $category.find('.category-meals').append($meal);

      });

      $app.append($category);

      $app.delegate('.category', 'dblclick keydown', handleInteraction);

    }

    function mergeProps(obj){

      var savedProps = JSON.parse(localStorage.getItem(obj.meal.title));

      Object.assign(obj.meal, savedProps);

      return obj;

    }

    function exportData(){

      _.each(jsonData.boards, function(category){

        var savedCategory = localStorage.getItem(category.category.name);

        savedCategory = savedCategory? JSON.parse(savedCategory) : {};

        Object.assign(category.category, savedCategory);

      });

      _.each(jsonData.meals, function(meal){

        var savedMeal = localStorage.getItem(meal.meal.title);

        savedMeal = savedMeal? JSON.parse(savedMeal) : {};

        Object.assign(meal.meal, savedMeal);

      });

      return jsonData;

    }

    function handleInteraction(e){

      var $el = $(this),
          elClass = /(\w+)/i.exec($el.attr('class'))[0],
          editClass = "is-"+elClass+"-editing",
          hasClass = $el.hasClass(editClass),
          keyCode = e.keyCode;

      if(!hasClass){
        $el.addClass(editClass);
      }else if(keyCode === 13 || keyCode === 27 || !keyCode){
        $el.removeClass(editClass);
        saveData($el, elClass);
      }

    }

    //this will save the data for each
    function saveData(el, elClass){

      var archiveObject = {

        meal: function saveMeal(){

          //get input values from the user and cache elements
          var title = el.find('.meal-edit-title').val(),
              description = el.find('.meal-edit-description').val(),
              $title = el.find('h3.meal-title'),
              $description = el.find('p.meal-description'),
              json = {
                title: title? title.toLowerCase() : '',
                description: description? description.toLowerCase() : ''
              };

          //mark meal as deleted if removed by user
          if(!title && !description){
            json.name = $title.html();
            json.removed = true;
            el.remove();
          }else{
            //update DOM elements to reflect new values
            $title.html(title);
            $description.html(description);
          }

          //save to local storage.
          console.log('when item is saved!');
          window.localStorage.setItem(json.title, JSON.stringify(json));

        },
        category: function saveCategory() {

          var title = el.find('.category-edit-title').val(),
              description = el.find('.category-edit-description').val(),
              subtitle = el.find('.category-edit-subtitle').val(),
              $title = el.find('h2.category-title'),
              $subtitle = el.find('h3.category-subtitle'),
              $description = el.find('p.category-description'),
              json = {
                title: title? title.toLowerCase() : '',
                description: description? description.toLowerCase() : '',
                subtitle: subtitle? subtitle.toLowerCase() : ''
              };

            //if item was deleted remove from DOM
            if(!title && !description && !subtitle){
              json.removed = true;
              json.name = $title.html();
              el.remove();
            }else{
              // update elements
              $title? $title.html(title) : '';
              $description? $description.html(description) : '';
              $subtitle? $subtitle.html(subtitle): '';
            }

            //save to local storage.
            console.log('when item is saved!');
            window.localStorage.setItem(json.title, JSON.stringify(json));

        }

      };

      archiveObject[elClass]();


    }












};
