function AliasesController($scope, $location, $timeout) {
	$scope.aliases = null;
	$scope.new_index = {};
	$scope.pagination= new AliasesPagination(1, []);

	$scope.addAlias=function() {
		try {
			$scope.new_alias.validate();
			// if alias already exists, check if its already associated with index
			if (isDefined($scope.aliases.info[$scope.new_alias.alias])) { 
				var aliases = $scope.aliases.info[$scope.new_alias.alias];
				$.each(aliases,function(i, alias) {
					if (alias.index === $scope.new_alias.index) {
						throw "Alias is already associated with this index";
					} 
				});
			} else { 
				$scope.aliases.info[$scope.new_alias.alias] = [];
			}
			$scope.aliases.info[$scope.new_alias.alias].push($scope.new_alias);
			$scope.new_alias = new Alias();
			$scope.pagination.setResults($scope.aliases.info);
			$scope.setAlert(null);
		} catch (error) {
			$scope.setAlert(new ErrorAlert(error ,null));
		}
	}
	
	$scope.removeAlias=function(alias) {
		delete $scope.aliases.info[alias];
		$scope.pagination.setResults($scope.aliases.info);
	}
	
	$scope.removeAliasFromIndex=function(index, alias_name) {
		var aliases = $scope.aliases.info[alias_name];
		var removeIndex = null;
		for (var i = 0; i < aliases.length; i++) {
			if (alias_name === aliases[i].alias) {
				removeIndex = i;
			}
		}
		if (removeIndex != null) {
			$scope.aliases.info[alias_name].splice(removeIndex,1);
		}
	}
	
	$scope.mergeAliases=function() {
		var deletes = [];
		var adds = [];
		Object.keys($scope.aliases.info).forEach(function(alias_name) {
			var aliases = $scope.aliases.info[alias_name];
			aliases.forEach(function(alias) {
				// if alias didnt exist, just add it
				if (!isDefined($scope.originalAliases.info[alias_name])) { 
					adds.push(alias);
				} else { 
					var originalAliases = $scope.originalAliases.info[alias_name];
					var addAlias = true;
					for (var i = 0; i < originalAliases.length; i++) {
						if (originalAliases[i].equals(alias)) {
							addAlias = false;
							break;
						}
					}
					if (addAlias) {
						adds.push(alias);
					}
				} 
			});
		});
		Object.keys($scope.originalAliases.info).forEach(function(alias_name) {
			var aliases = $scope.originalAliases.info[alias_name];
			aliases.forEach(function(alias) {
				if (!isDefined($scope.aliases.info[alias.alias])) {
					deletes.push(alias);
				} else {
					var newAliases = $scope.aliases.info[alias_name];
					var removeAlias = true;
					for (var i = 0; i < newAliases.length; i++) {
						if (alias.index === newAliases[i].index && alias.equals(newAliases[i])) {
							removeAlias = false;
							break;
						}
					}
					if (removeAlias) {
						deletes.push(alias);
					}
				}
			});
		});
		$scope.client.updateAliases(adds,deletes, 
			function(response) {
				$scope.loadAliases();
				$scope.setAlert(new SuccessAlert("Aliases were successfully updated",response));
			},
			function(error) {
				$scope.setAlert(new ErrorAlert("Error while updating aliases",error));
			}
		);
	}
	
	$scope.loadAliases=function() {
		$scope.new_alias = new Alias();
		$scope.client.fetchAliases(
			function(aliases) {
				$scope.originalAliases = aliases;
				$scope.aliases = jQuery.extend(true, {}, $scope.originalAliases);
				$scope.pagination.setResults($scope.aliases.info);
			},
			function(error) {
				$scope.setAlert(new ErrorAlert("Error while fetching aliases",error));		
			}
		);
	}
	
	$scope.$on('hostChanged',function() {
		$scope.loadAliases();
	});
	
    $scope.$on('loadAliasesEvent', function() {
		$scope.loadAliases();
    });

}