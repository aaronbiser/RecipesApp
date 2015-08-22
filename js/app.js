
	// create our angular module and inject firebase
	var app = angular.module('recipesApp', ['firebase', 'angularFileUpload', 'ui.router', 'colorpicker.module', 'wysiwyg.module', 'ngSanitize']);
	
	// create our main controller and get access to firebase
	app.controller('mainController', ["$scope", "$firebaseObject", "$firebaseArray", "FileUploader",
	  function($scope, $firebaseObject, $firebaseArray, FileUploader) {
		
		//connect to firebase
		var ref = new Firebase("https://myrecipeapp.firebaseio.com/recipes");
		var recipesObject = $firebaseObject(ref);
		var recipesArray = $firebaseArray(ref);
		
		//three way data binding - removing this removes the data from the view
		//recipesObject.$bindTo($scope, 'recipes');
		$scope.recipesArray = $firebaseArray(ref);
		
		//Prevents button from displaying before image is uploaded
		$scope.imageUploaded = false;
		
		//Hide validation messages until submission
		$scope.showValidationMessages = false;
		
		//function to set default data
		$scope.pushData = function() {
			
		    ref.push({
	    		name: 'Tequila Lime Shrimp',
	    		picture: 'tequila-lime-shrimp.jpg',
	    		ingredients: 'Ingredients',
	    		directions: 'Directions',
	    		category: 'dinner'
		    });
			
		};
		
		//Sort data by selection
	    $scope.sortOptions = ["name", "created"];
	    $scope.sort = "created";
	    $scope.setSort = function(type) { 
	    	$scope.sort = type.toLowerCase();
	    };
	   
		
		//Reset Data
		$scope.resetData = function() {
	        ref.set({ });
		};
		
		//Add Recipe
		$scope.addRecipe = function(uploadedImage) {
			
			//Allow errors messages to be displayed
			$scope.showValidationMessages = true;
			
			ref.push({
				name: $scope.recipe.name,
				ingredients: $scope.recipe.ingredients,
				directions: $scope.recipe.directions,
				picture: $scope.uploadedImage,
				category: $scope.recipe.category,
				created: new Date().getTime()
			});
			
			//Clear form on submit and 
			$scope.recipe = {};
			//Empty wysiwyg fields
			$('.wysiwyg-textarea').empty();
			//Remove error messages
			$scope.showValidationMessages = false;
			
			//Close Modal
			$('#addNewModal').modal('hide');
			
			//Add recipe confirmation 
			var html = "<p><span class='glyphicon glyphicon-saved'></span>Recipe Saved</p>"
			popUpConfirmation(html);
			
		};
		
		$scope.removeRecipe = function(){
			//Get path to firebase data to remove
			var item = this.recipe.$id;
			var itemRef = new Firebase( "https://myrecipeapp.firebaseio.com/recipes/" + item );
			
		  	itemRef.remove(function(error) {
		  		if (error) {
		  		    console.log("Error:", error);
		  		  } else {
		  		  	var html = "<p><span class='glyphicon glyphicon-trash'></span>Recipe Deleted</p>"
		  		  	popUpConfirmation(html);
		  		  }
		  	});
		  	
		};
		
		$scope.editRecipe = function(uploadedImage){
			
			$scope.updateRecipeObj = {};
			angular.copy(this.recipe, $scope.updateRecipeObj);
			
		};
		
		//Update Recipe
		$scope.updateRecipe = function(uploadedImage, fileItem) {
				
			var item = this.recipe.$id;
			var refID = new Firebase( "https://myrecipeapp.firebaseio.com/recipes/" + item );
			
			var recipeIDObject = $firebaseObject(refID);
			
			//Allow errors messages to be displayed
			$scope.showValidationMessages = true;
			
			//Upload new data but check for uploaded image below
			refID.update({
				name: $scope.updateRecipeObj.name,
				ingredients: $scope.updateRecipeObj.ingredients,
				directions: $scope.updateRecipeObj.directions,
				category: $scope.updateRecipeObj.category,
				updated: new Date().getTime()
			});
			
			//Upload new image if attached
			if ( this.uploadedImage != undefined ) {
				refID.update({
					picture: this.uploadedImage
				});	
			}
			
			//Clear form on submit and remove error messages
			$scope.updateRecipeObj = {};
			$scope.showValidationMessages = false;
			
			//Close Modal
			$('#editModal').modal('hide');
			
			//Add recipe confirmation 
			var html = "<p><span class='glyphicon glyphicon-saved'></span>Recipe Updated</p>"
			popUpConfirmation(html);
			
		};
		
		//Global reusable popup
		function popUpConfirmation(html) {
			$('#popUpConfirmation').html(html).fadeIn(300);
			setTimeout(function(){ $('#popUpConfirmation').fadeOut(1000) }, 3000);
		};
		
		/////////////////////////////////
		//File Uploader
		var uploader = $scope.uploader = new FileUploader({
		    url: 'upload.php'
		});
				
		// FILTERS
		uploader.filters.push({
		    name: 'customFilter',
		    fn: function(item /*{File|FileLikeObject}*/, options) {
		        return this.queue.length < 10;
		    }
		});
		
		// CALLBACKS
		uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
		    console.info('onWhenAddingFileFailed', item, filter, options);
		};
		uploader.onAfterAddingFile = function(fileItem) {
		    console.info('onAfterAddingFile', fileItem);
		    
		    //Rewrites file name to random without spaces	
		    var fileExtension = '.' + fileItem.file.name.split('.').pop();
		    fileItem.file.name = Math.random().toString(36).substring(7) + new Date().getTime() + fileExtension;
		    
		};
		uploader.onAfterAddingAll = function(addedFileItems) {
		    console.info('onAfterAddingAll', addedFileItems);
		    //Add uploaded image to scope
		    $scope.uploadedImage = addedFileItems[0].file.name;
		    
		};
		uploader.onBeforeUploadItem = function(item) {
		    console.info('onBeforeUploadItem', item);
		};
		uploader.onProgressItem = function(fileItem, progress) {
		    console.info('onProgressItem', fileItem, progress);
		};
		uploader.onProgressAll = function(progress) {
		    console.info('onProgressAll', progress);
		};
		uploader.onSuccessItem = function(fileItem, response, status, headers) {
		    console.info('onSuccessItem', fileItem, response, status, headers);
		};
		uploader.onErrorItem = function(fileItem, response, status, headers) {
		    console.info('onErrorItem', fileItem, response, status, headers);
		};
		uploader.onCancelItem = function(fileItem, response, status, headers) {
		    console.info('onCancelItem', fileItem, response, status, headers);
		};
		uploader.onCompleteItem = function(fileItem, response, status, headers) {
		    console.info('onCompleteItem', fileItem, response, status, headers);
		    $scope.imageUploaded = true;
		    
		};
		uploader.onCompleteAll = function() {
		    console.info('onCompleteAll');
		};
				
	  }
	]);
	
	
	app.config(function($stateProvider, $urlRouterProvider) {

	  // For any unmatched url, redirect to /home
	  $urlRouterProvider.otherwise("/");
	
	  // Now set up the states
	  $stateProvider
        .state('home', {
            url: "/",
            templateUrl: 'partials/recipes-list.html'
        })
        .state('get-recipe', {
          url: '/recipe/:recipeId',
          templateUrl: 'partials/recipe.html',
          controller: function($scope, $stateParams, $firebaseObject) {
             
             //Display stateParams Object
             //$scope.stateParams = $stateParams;
             //console.log($scope.stateParams);
             
             var ref = new Firebase("https://myrecipeapp.firebaseio.com/recipes/" + $stateParams.recipeId);
             var recipeRefObject = $firebaseObject(ref);
             
             recipeRefObject.$bindTo($scope, 'recipe');
             
             //Scroll to the top on page load
             window.scrollTo(0,0);
             
          }
        })
        .state('get-category', {
            url: "/category/:categoryId",
            templateUrl: 'partials/category.html',
            controller: function($scope, $stateParams) {
               
               $scope.stateParams = $stateParams;
               
               var categoryId = $stateParams.categoryId;
               
               //console.log($stateParams.categoryId);
               
            }
        })
        
        //Select Category from left nav
        //Display new dynamic view with category items
        
        
	});
	
	
	app.filter('unique', function() {
	   return function(collection, keyname) {
	      var output = [], 
	          keys = [];
	
	      angular.forEach(collection, function(item) {
	          var key = item[keyname];
	          if(keys.indexOf(key) === -1) {
	              keys.push(key);
	              output.push(item);
	          }
	      });
	
	      return output;
	   };
	});
	
	
	//Directives
	
	//Background Images
	app.directive('backImg', function(){
	    return function(scope, element, attrs){
	        var url = attrs.backImg;
	        element.css({
	            'background-image': 'url(' + url +')',
	            'background-size' : 'cover'
	        });
	    };
	});
	
	//Confirm before continuing ng-click
	app.directive('ngConfirmClick', [
	  function(){
	    return {
	      priority: -1,
	      restrict: 'A',
	      link: function(scope, element, attrs){
	        element.bind('click', function(e){
	          var message = attrs.ngConfirmClick;
	          if(message && !confirm(message)){
	            e.stopImmediatePropagation();
	            e.preventDefault();
	          }
	        });
	      }
	    }
	  }
	]);
	
	//File input validation
	app.directive('validFile',function(){
	  return {
	    require:'ngModel',
	    link:function(scope,el,attrs,ngModel){
	      el.bind('change',function(){
	        scope.$apply(function(){
	          ngModel.$setViewValue(el.val());
	          ngModel.$render();
	        });
	      });
	    }
	  }
	});
	
		