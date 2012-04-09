var main = angular.module('Main', []);

ItemsController.$inject = ['$scope', 'ItemsRepository', 'ConfirmService', '$filter'];
function ItemsController($scope, repository, confirm, $filter){
	$scope.editing = false;
	$scope.items = repository.load();
	$scope.$watch('items', 'checkedItems = (items | filter:{checked:true})', true);

	$scope.add = function(){
		$scope.items.unshift({text:$scope.newItemText,checked:false});
		repository.save($scope.items);
		$scope.newItemText = '';
	};
	$scope.remove = function(itemToRemove){
		var event = window.event || window.evt;
		event.preventDefault();
		confirm(
			'Remove item',
			'Ok to remove item:\n' + itemToRemove.text,
			function(){
				$scope.items = $filter('filter')($scope.items, function(item){ return !angular.equals(item, itemToRemove); });
				repository.save($scope.items);
				$scope.$eval();
			}
		);
	};
	$scope.removeChecked = function(){
		confirm(
			'Remove checked items',
			'Ok to remove checked items?',
			function(){
				$scope.items = $filter('filter')($scope.items, {checked:false});
				repository.save($scope.items);
			}
		);
	};
	$scope.toggle = function(){
		repository.save($scope.items);
	};
	$scope.toggleChecked = function(){
		angular.forEach($scope.items, function(item){ item.checked = false; });
		repository.save($scope.items);
	};

	$scope.editStart = function(){
		$scope.editing = true;
	};
	$scope.editCancel = function(){
		$scope.editing = false;
		$scope.items = repository.load();
	};
	$scope.editSave = function(){
		$scope.editing = false;
		repository.save($scope.items);
	};
};

main.factory('ItemsRepository', function(){
	var example = [{text:'example', checked:false}];
	return {
		load: function(){
			var items = JSON.parse(localStorage.getItem('items') || JSON.stringify(example));
			return items;
		},
		save: function(items){
			localStorage.setItem('items', JSON.stringify(items));
		},
		clear: function(){
			localStorage.removeItem('items', '');
		}
	};
});


main.factory('ConfirmService', function($window){
	return function(titleText, promptText, callback){
		if(navigator && navigator.notification && navigator.notification.confirm){
			navigator.notification.confirm(
				promptText,
				function(buttonIndex){
					if(buttonIndex === 1){
						callback();
					}
				},
				titleText,
				'OK,Cancel'
			);
		} else {
			if($window.confirm(promptText)){
				callback();
			}
		}
	};
});



main.directive('touchHold', ['$document', function($document){
	var compiler = this;
	var startEvents = 'touchstart mousedown';
	var stopEvents = 'touchend mouseup mouseleave';
	var cancelEvents = 'touchcancel mousecancel';
	return function(scope, element, attributes){
		function clearEvents(){
			element.unbind(startEvents);
			element.unbind(stopEvents);
			$document.unbind(cancelEvents);
		}
		
		element.bind(startEvents, function(event){
			var timer;

			element.bind(stopEvents, function(event){
				console.log('touchHold:', 'stop');
				clearEvents();
				clearTimeout(timer);
			});
			$document.bind(cancelEvents, function(event){
				console.log('touchHold:', 'cancel');
				clearEvents();
				clearTimeout(timer);
			});

			timer = setTimeout(function(){
				console.log('touchHold:', 'fire!');
				clearEvents();
				scope.$apply(attributes.touchHold);
			}, 750);

		});
	};
}]);
