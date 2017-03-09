window.onload = function(){

    var ID = 1000;

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    var currentPage = 0;

    var $app = $('#app'),
        jsonData,
        ajax = $.get('json/categories.json');

    var toolbar = {
        $nav: $('.toolbar-nav'),
        $save: $('.toolbar-save'),
        $configureTools: $('.toolbar-configure')
    };

    var category = {
        $header: $app.find('.category-header'),
        $meals: $app.find('.category-meals'),
        $note: $app.find('.category-note'),
        $warning: $app.find('.food-warning')
    };

    var templates = {
        categoryHeader: _.template($('#category-header-template').html()),
        meal: _.template($('#meal-template').html()),
        option: _.template($('#meal-option-template').html()),
        categoryNote: _.template($('#category-note-template').html()),
        categoryWarning: _.template($('#category-warning-template').html())
    };

    window.getJSON = addId;

    ajax.then(function(){
      jsonData = ajax.responseJSON;
      attach(currentPage);
    });

    //add listeners

    toolbar.$save.delegate('a', 'click', downloadData);
    toolbar.$configureTools.delegate('a','click', onConfigureTool);
    toolbar.$nav.delegate('a', 'click', onNavigate);
    category.$header.on('dblclick keydown', handleInteraction);
    category.$meals.delegate('.meal', 'dblclick keydown', handleInteraction);

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

    function attach(page){

      var categoryData = jsonData.boards[page];

      window.responseData = jsonData;

      var headerHTML = templates.categoryHeader(mergeProps(categoryData, 'category'));
      category.$header.attr('data-id', categoryData.category.id);
      category.$header.html(headerHTML);
      category.$note.html(templates.categoryNote(categoryData));
      category.$warning.html(templates.categoryWarning(categoryData));


      _.each(categoryData.category.meals, function(mealData){

        var $meal = $('<li class="meal"></li>');
        $meal.attr('data-id', mealData.meal.id);
        var mealHTML = templates.meal(mergeProps(mealData, 'meal'));
        if(mealData.meal.removed) return;
        $meal.html(mealHTML);

        /*
          _.each(mealData.meal.options, function(optionData){

              var $option = $(templates.option(optionData))

              console.log($option);

              $meal.find('.meal-options').append($option);

          });

          */

            category.$meals.append($meal);


      });



    }

    function downloadData(e){

      var el = $(this),
          jsonBlob = new Blob([JSON.stringify(exportData(jsonData), null, 2)], {type: 'application/json'}),
          dataURL = URL.createObjectURL(jsonBlob),
          currentDate = (new Date()).toLocaleDateString();

          currentDate.replace('/', '-');

      el.attr('download', currentDate+"-wichit-boards");
      el.attr('href', dataURL);

    }

    function onConfigureTool(e){

      var $el = $(this),
          role = $el.attr('data-role');

      if(role === "add"){
         addMeal();
      }

    }

    function onNavigate(e){

      var $el = $(this),
          direction = $el.attr('data-direction');

      (direction === "next")? currentPage += 1 : currentPage -= 1;

      currentPage %= jsonData.boards.length;

      attach(currentPage);


    }

    function addMeal() {

      var data = {
        title: "Title Here",
        description: "Description Here",
        id: (ID + 1)
      };

      var newMeal = $('<li class="meal is-meal-editing"></li>');
          newMeal.attr('data-id', data.id);
          newMeal.html(templates.meal({meal: data}));

          category.$meals.append(newMeal);

      saveToLocalStorage(data);

    }

    function mergeProps(obj, prop){

      var savedProps = JSON.parse(localStorage.getItem(obj[prop].id));

      Object.assign(obj[prop], savedProps);

      return obj;

    }

    //temp
    function addId(){

      var data = jsonData;

      _.each(data.boards, function(category){

          category.category.id = (ID += 1);

          _.each(category.category.meals, function(meal){

            meal.meal.id = (ID += 1);
            meal.meal.from = category.category.name;

          });

      });

      return JSON.stringify(data, null, 2);

    }

    function exportData(jsonData){

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
          elClasses = $el.attr('class'),
          elClass = /(?:\w-?)+/i.exec(elClasses)[0],
          editClass = "is-"+elClass+"-editing",
          hasClass = $el.hasClass(editClass),
          keyCode = e.keyCode;

      if(!hasClass){
        $el.addClass(editClass);
      }else if(keyCode === 13 || keyCode === 27 || !keyCode){
        $el.removeClass(editClass);
        updateComponent($el, elClass);
      }

    }

    //this will save it to local storage
    function saveToLocalStorage(json){

      window.localStorage.setItem(json.id, JSON.stringify(json));
      return true;

    }

    //this will update the DOM for the component
    function updateComponent(el, elClass){

      var archiveObject = {

        "meal": function saveMeal(){

          //get input values from the user and cache elements
          var title = el.find('.meal-edit-title').val(),
              description = el.find('.meal-edit-description').val(),
              $title = el.find('h3.meal-title'),
              $description = el.find('p.meal-description'),
              json = {
                title: title? title.toLowerCase() : '',
                description: description? description.toLowerCase() : '',
                id: el.attr('data-id')
              };

          //mark meal as deleted if removed by user
          if(!title && !description){
            json.name = $title.html();
            json.removed = true;
            el.remove();
          }else{
            //update DOM elements to reflect new values
            el.html(templates.meal({meal: json}));
          }

          //save to local storage.
          saveToLocalStorage(json);

        },
        "category-header": function saveCategory() {

          var title = el.find('.category-edit-title').val(),
              description = el.find('.category-edit-description').val(),
              subtitle = el.find('.category-edit-subtitle').val(),
              $title = el.find('h2.category-title'),
              $subtitle = el.find('h3.category-subtitle'),
              $description = el.find('p.category-description'),
              json = {
                title: title? title.toLowerCase() : '',
                description: description? description.toLowerCase() : '',
                subtitle: subtitle? subtitle.toLowerCase() : '',
                id: el.attr('data-id')
              };

            //if item was deleted remove from DOM
            if(!title && !description && !subtitle){
              json.removed = true;
              el.remove();
            }else{
              // update elements
              el.html(templates.categoryHeader({category: json}));
            }
            //save to local storage
            saveToLocalStorage(json);

        }

      };

      archiveObject[elClass]();


    }

};
