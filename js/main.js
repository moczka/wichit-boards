window.onload = function(){

    var ID = new Date().getTime();

    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

    var currentPage = 1,
        currentCategory = "default title";

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
          currentCategory = categoryData.category.name;

      //synchronize with local saved data
      synchronizeData(categoryData);

      //clear old meals
      category.$meals.empty();

      window.responseData = jsonData;

      var headerHTML = templates.categoryHeader(categoryData);
      category.$header.attr('data-id', categoryData.category.id);
      category.$header.html(headerHTML);
      category.$note.html(templates.categoryNote(categoryData));
      category.$warning.html(templates.categoryWarning(categoryData));

      _.each(categoryData.category.meals, function(mealData){

        var mealAddClass = mealData.meal.noBorder ? 'noBorder' : '';
        var $meal = $(`<li class="meal ${mealAddClass}"></li>`);
        $meal.attr('data-id', mealData.meal.id);
        var mealHTML = templates.meal(mealData);
        //if meal was removed, do not append
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

    function synchronizeData(data) {

      var categoryNS = data.category.name+"-category-"+data.category.id,
          localValues = JSON.parse(localStorage.getItem(categoryNS)),
          matcher = new RegExp("^"+data.category.name+"-meal-", "i"),
          meals = data.category.meals,
          matchedMealsMap = {};

      //update category json values
      mergeProps(data.category, localValues);

      for(var item in localStorage){

        if(localStorage.hasOwnProperty(item)){

          if(matcher.test(item)){

            var localMeal = JSON.parse(localStorage[item]);
            matchedMealsMap[item] = localMeal;

          }

        }

      }

      for(var i=0; i<meals.length; i++){

        var currentMeal = meals[i],
            namespace = data.category.name+"-meal-"+currentMeal.meal.id,
            savedMeal = matchedMealsMap[namespace];

          if(savedMeal != undefined){

            mergeProps(currentMeal.meal, savedMeal);
            delete matchedMealsMap[namespace];

          }
      }

      //merge in all new added meals not found in original json
      for(var meal in matchedMealsMap){

        if(matchedMealsMap.hasOwnProperty(meal)){

          meals.push({meal: matchedMealsMap[meal]});

        }

      }

      return true;

    }

    function downloadData(e){

      //synchronize all boards with local storage before exporting
      _.each(jsonData.boards, function(category){

        synchronizeData(category);

      });

      var el = $(this),
          jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {type: "application/json"}),
          currentDate = (new Date()).toLocaleDateString(),
          jsonDataURL = URL.createObjectURL(jsonBlob);

          currentDate.replace('/', '-');
          
      el.attr('href', jsonDataURL);

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

      currentPage = (currentPage < 0)? jsonData.boards.length -1 : currentPage;

      currentPage %= jsonData.boards.length;

      attach(currentPage);

    }

    function addMeal() {

      var data = {
        title: "Title Here",
        description: "Description Here",
        from: currentCategory,
        id: (ID += 1)
      };

      var namespace = currentCategory+"-meal-"+data.id;

      var newMeal = $('<li class="meal is-meal-editing"></li>');
          newMeal.attr('data-id', data.id);
          newMeal.html(templates.meal({meal: data}));

          category.$meals.append(newMeal);

      saveToLocalStorage(namespace, data);

    }

    function mergeProps(host, giver){

      return Object.assign(host, giver);

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
    function saveToLocalStorage(namespace, json){

      window.localStorage.setItem(namespace, JSON.stringify(json));
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
                id: Number(el.attr('data-id'))
              },
              namespace = namespace = currentCategory+"-meal-"+json.id;

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
          saveToLocalStorage(namespace, json);

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
                id: Number(el.attr('data-id'))
              },
              namespace = currentCategory+"-category-"+json.id;

            //if item was deleted remove from DOM
            if(!title && !description && !subtitle){
              json.removed = true;
              el.remove();
            }else{
              // update elements
              el.html(templates.categoryHeader({category: json}));
            }
            //save to local storage
            saveToLocalStorage(namespace, json);

        }

      };

      archiveObject[elClass]();


    }

};
