
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("push", function(request, response) {
	var query = new Parse.Query(Parse.Installation);
	var userQuery = new Parse.Query(Parse.User);

	var senderQuery = new Parse.Query(Parse.User);

	userId = request.params.targetUserId;
	senderId = request.params.senderId;
	senderPhone = request.params.senderPhone;
	senderUsername = request.params.senderUsername

	senderQuery.equalTo('objectId', senderId);
	senderQuery.find({
		success: function(result) {
			console.log('ayy lmao'+result);
			var sender = result[0];
			sender.increment('nudgeCount');
			sender.save();
		},
		error: function(error) {
			result.error("Problem!!" + error.message);p
		}
	})

	userQuery.equalTo('objectId', userId);
 
	query.matchesQuery('owner', userQuery);

	Parse.Push.send({
	  where: query, // Set our Installation query
	  data: {
	    alert: senderUsername + " nudged you!",
	    senderId: senderId,
	    senderPhone: senderPhone,
	    senderUsername: senderUsername,
	  }
	}, {
	  success: function() {
	    response.success('all good');
	  },
	  error: function(error) {
	    throw "Got an error " + error.code + " : " + error.message; error
	  }
	});
});

Parse.Cloud.job("eventDeletion", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();
	query = new Parse.Query("event");

  var d = new Date();
  var todaysDate = new Date(d.getTime()); 

	query.lessThanOrEqualTo('endTime', todaysDate );

	query.find({
	  success: function(results) {
	    // Do something with the returned Parse.Object values
	    for (var i = 0; i < results.length; i++) { 
	      var object = results[i];
	      object.destroy({
				  success: function(object) {
				    // The object was deleted from the Parse Cloud.
					    alert('DESTROYED!!!' + object);
				  },
				  error: function(myObject, error) {
				    // The delete failed.
				    // error is a Parse.Error with an error code and message.
				  }
				});
	    }
	  },
	  error: function(error) {
	    alert("Error: " + error.code + " " + error.message);
	  }
	}),
	{
		success:function() {
			response.success('all good');
	},
		error: function(error) {
			throw "Error!!" + error.message; error
	}
}
});

Parse.Cloud.define('errorLog', function(request, response) {
		var error = request.params.issue;
		console.log(error);
	}, {
		success: function() {
			response.success('good');
		},
		error: function() {
			response.success('bad');
		}
	}
);

Parse.Cloud.define('friendAddNotify', function(request, response) {
	var senderId = request.params.userId;
	var senderUsername = request.params.username;
	var toUserId = request.params.targetId;
	var userQuery = new Parse.Query(Parse.User);
	var installationQuery = new Parse.Query(Parse.Installation);

	userQuery.equalTo('objectId', toUserId);
	installationQuery.matchesQuery('owner', userQuery);

	Parse.Push.send({
	  where: installationQuery, // Set our Installation query
	  data: {
	    alert: senderUsername + " friended you!",
	    senderId: senderId,
	    senderUsername: senderUsername,
	  }
	}, {
	  success: function() {
	    response.success('all good');
	  },
	  error: function(error) {
	    throw "Got an error " + error.code + " : " + error.message; error
	  }
	});
})

Parse.Cloud.afterSave("event", function(request, response) {
	var user = request.object.get('user');
	user.increment('eventCount');
	user.save();

	var dimensions = {
	  locaton: String(request.object.get('location')),
	  user: String(request.object.get('user')),
	  friends: String(request.object.get('canSee')),
	  blurb: String(request.object.get('blurb'))
	};

	// Send the dimensions to Parse along with the 'search' event
	Parse.Analytics.track('eventCreateCloud', dimensions);

});

Parse.Cloud.afterSave('Group', function(request, response) {
	var group = request.object;
	var user = request.object.get('creator');
	var relation = user.relation("group");
	relation.add(group);
	user.save();
});

Parse.Cloud.beforeSave("event", function(request, response) {
	query = new Parse.Query("event");
	query.equalTo('owner', request.object.get('user'));

	query.find({
		success: function(results) {
	    for (var i = 0; i < results.length; i++) { 
	      var object = results[i];
	      object.destroy({
				  success: function(object) {
				    // The object was deleted from the Parse Cloud.
					    alert('DESTROYED!!!' + object);
				  },
				  error: function(myObject, error) {
				    // The delete failed.
				    // error is a Parse.Error with an error code and message.
				  }
				});
	    }
		}
	});

	response.success();
});
