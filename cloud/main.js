
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("push", function(request, response) {
	var query = new Parse.Query(Parse.Installation);
	var userQuery = new Parse.Query(Parse.User);

	userId = request.params.targetUserId;
	senderId = request.params.senderId;
	senderPhone = request.params.senderPhone;
	senderUsername = request.params.senderUsername

	userQuery.equalTo('objectId', userId);
 
	query.matchesQuery('owner', userQuery);

	Parse.Push.send({
	  where: query, // Set our Installation query
	  data: {
	    alert: "Someone nudged you!",
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
	});
});