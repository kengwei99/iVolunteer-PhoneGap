var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
    $(document).ready(function(){
      // To set minimum and maximum for the date picker in order to make it more logic.
      // So that can prevent user from doing mistake like choosing past date or choose thousands of years
      var maxdate = new Date();
      var mindate = new Date();
      maxdate.setDate(maxdate.getDate() + 90);
      maxdate = declaredate(maxdate);
	  mindate.setDate(mindate.getDate() - 90);
      mindate = declaredate(mindate);

      $( "#input_activity_date" ).attr("max",maxdate);
      $( "#input_activity_date" ).attr("min",mindate);
      
      // Search input
      $('#advancesearch').on('change', viewActivity);
      $('#screenView').on('input', '#myFilter', viewActivity);
    
      
      // Declare & set function to run for each Button & ListView
      
      $("#screenHome").on('click', '#btn-delete', deleteActivity); 
      
      $("#screenHome").on('click', '#btn_view', viewActivity); 
      
      $("#screenAdd").on('click', '#btn_confirm', validationActivity); 
      
      // This from the confirmation confirm add button.
      $("#dialog_confirm_activity").on('click', '#btn_add', addActivity); 
      
      // When user tap for particular activity, it will run this and store the value in global variables called activityid
      // Then pass it to Details Activity, so that it can get for particular's activity id and fetch query then display it
      $("#listActivity").on("click", ".liActivity", function(){
        activityid = $(this).find('[id = "listAID"]').html();
        viewDetailsActivity();
      });
      
      $("#screenViewDetails").on('click', '#btn_addreport', addReport); 
      
      $("#screenViewDetails").on('click', '#btn_delete_specific', deleteSpecificActivity); 
      
      // When user tap for particular report, it will run this and store the value in global variables called reportid
      // Then pass it to delete report function 
      $('#viewreports').on('click', '.liReport', function(){
        reportid = $(this).find('[id = "hiddenreportID"]').html();
        deleteReport();
      });
    });
    
    // Open SQLITE Database
    db = window.sqlitePlugin.openDatabase({name:'ivolunteer.db', location:'default'});
    
    // After Database open then create database table
    db.sqlBatch([
      'CREATE TABLE IF NOT EXISTS `activity` (`activity_id` INTEGER PRIMARY KEY, `activity_name` TEXT, `activity_location` TEXT, `activity_date` TEXT, `activity_time` TEXT, `volunteer_name` TEXT)',
      'CREATE TABLE IF NOT EXISTS `report` (`report_id` INTEGER PRIMARY KEY, `report_desc` TEXT, `activity_id` INTEGER, `report_date` TEXT)'
    ], function() {
      console.log('Populated database OK');
    }, function(errs) {
      alert('Populate table error: ' + errs.message);
      console.log('Populate table error: ' + errs.message);
    });
  }
};

app.initialize();

// Declare the date in order to set min and max for the input type of date. 
function declaredate(val){
var dd = val.getDate();
var mm = val.getMonth()+1; //Default month is 0, so I change it to +1
var yyyy = val.getFullYear();
 if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    }


val = yyyy+'-'+mm+'-'+dd;
return val;
}

// For encoding HTML ENTITIES from each listview data in order to avoid user key in html entity, such as "<!--"
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Delete all activity along with report
function deleteActivity(){
  if (confirm("Are you confirm to delete all activity at once?")) {  
    db.sqlBatch([
      'DELETE FROM activity',
      'DELETE FROM report'
    ], function() {
      alert('You have successfully deleted all the activities with reports!');
    }, function(errs) {
      alert('Transaction ERROR: ' + errs.message);
    });
  }
}

// Validation for add activity
function validationActivity() {
  
  // Declare all the input variables and set the value from html input
  var inputActivityName = $('#input_activity_name').val();
  var inputActivityLocation = $('#input_activity_location').val();
  var inputActivityDate = $('#input_activity_date').val();
  var inputActivityTime = $('#input_activity_time').val();
  var inputVolunteerName = $('#input_volunteer_name').val();
  
  // Get for past 3 month date and set to minimum date
  var mindate = new Date();
  mindate.setDate(mindate.getDate() - 90);
  mindate = declaredate(mindate);
  
  // Get for next 3 months date and set to maximum date
  var limitdate = new Date();
  limitdate.setDate(limitdate.getDate() + 90);
  limitdate = declaredate(limitdate);
  
  
  // To avoid user input blank activity name
  if(!inputActivityName)
  {
    alert("Please enter activity name!");
  }
    //To avoid user input spacing as an activity name
    else if (!inputActivityName.trim())
  {
    alert("Please enter meaningful activity name, intead of spacing activity name.");
  }
    //To avoid user input blank date
    else if(!inputActivityDate)
  {
    alert("Empty Date is not allow!");
  }
    //To avoid user input blank date
    else if(inputActivityDate < mindate || inputActivityDate > limitdate)
  {
    alert("Date cannot be out of past 3 months as well as cannot out of next 3 months.");
  }
    //To avoid user input blank volunteer name
    else if(!inputVolunteerName)
  {
    alert("Please enter your name!");
  }
    //To avoid user input spacing as volunteer name
    else if (!inputVolunteerName.trim())
  {
    alert("Please enter character, intead of Spacing Volunteer Name");
  }
    //Else All validation passed then start this function
  else
  {
    //Execute SQL for check is there is any existed same activity name
    db.transaction(function(tx) {
      tx.executeSql(
        'SELECT * FROM `activity` WHERE lower(`activity_name`) = ?',
        [$('#input_activity_name').val().toLowerCase()],
        //If Existed pop alert message, else go to validation function to do more further validation.
        function(tx, validationresult) {
          if(validationresult.rows.length>0){
            alert("This activity name is already existed! Please try another name!");
          }else{
            // If passed all the duplicate validation then set value for all text view from dialog page
            // To avoid html entities issues, I will use the htmlEntities function to solve it.
            $('#txt_activity_name').html(htmlEntities(inputActivityName));
            $('#txt_activity_location').html(htmlEntities(inputActivityLocation));
            $('#txt_activity_date').html(htmlEntities(inputActivityDate));
            $('#txt_activity_time').html(htmlEntities(inputActivityTime));
            $('#txt_volunteer_name').html(htmlEntities(inputVolunteerName));
            
            // Pop up the confirmation dialog along with the value that key in by user.
            // The confirm add button is already declare in onDeviceReady function there.
            window.location.href = "#dialog_confirm_activity";
          }
        },
        function(errs) {
          alert('Query or WebSQL Connection Error: '+errs.message+' Please Contact Admin!');
        }
      );
    })
  }
}

// Add Activity into SQLite Database
function addActivity() {
  
  //Declare all the input value
  var inputActivityName = $('#input_activity_name').val();
  var inputActivityLocation = $('#input_activity_location').val();
  var inputActivityDate = $('#input_activity_date').val();
  var inputActivityTime = $('#input_activity_time').val();
  var inputVolunteerName = $('#input_volunteer_name').val();
  
  //validate for database create and connection
  if (db==null) {
    alert('Database Error: There is no any database. Please contact admin!');
    return;
  }

  // To avoid user adding empty value by using the back button from real device(Android Phone).
  // This validation is help to solve empty value input insert into database.

  if(!inputActivityName||!inputActivityDate||!inputVolunteerName){
    alert("Please do not make unethical behavior!");
    window.location.href = "#screenAdd";
  }

  //Once all validation is passed then goes to this add function process
  else
  {
    db.transaction(function(tx) {
      tx.executeSql(
        'INSERT INTO `activity` (`activity_name`,`activity_location`,`activity_date`,`activity_time`,`volunteer_name`) VALUES (?,?,?,?,?)', // This Insert Activity Query Statement
        [inputActivityName, inputActivityLocation, inputActivityDate, inputActivityTime, inputVolunteerName],
        function(tx, resultadded) { // Once successfully added will go this function
          if (resultadded.rowsAffected==1){
            console.log('Congratulation! You have successfully added an activity!');
            
            //Refresh the activity list view data, to keep updating new data record
            viewActivity();
      
            //Change page to view screen
            $.mobile.changePage("#screenView");
          }
        },
        function(errs) { // If errors then go this function
          alert('Query or WebSQL Connection errors: '+errs.message+' Please Contact Admin!');
        }
      );
    })
    
    //Clear Activity Textboxes
    
    $('#input_activity_name').val('');
    $('#input_activity_location').val('');
    $('#input_activity_date').val('');
    $('#input_activity_time').val('');
    $('#input_volunteer_name').val('');
    
  }
}  

// All the activity in a search screen
function viewActivity() {
  //If database is not created pop error and stop function.
  if (db==null) {
    alert('Error: Database is null.');
    return;
  }
  
  //Empty ListView
  $('#listActivity').empty();
  
  // When drop down list selected, get the id value and store in this variable
  var searchoption = $("#advancesearch option:selected").attr("id");
  // Declare searchby variable
  // This variable is use to identify which attribute of activity table is selected
  var searchby = '';
  
  // if user selected activity name
  if(searchoption == 'a_name'){
    // store the activity_name column from activity table
    searchby = 'activity_name';
  }else if(searchoption == 'a_location'){
    // store the activity_location column from activity table
    searchby = 'activity_location';
  }else if(searchoption == 'a_date'){
    // store the activity_date column from activity table
    searchby = 'activity_date';
  }else if(searchoption == 'a_time'){
    // store the activity_time column from activity table
    searchby = 'activity_time';
  }else if(searchoption == 'v_name'){
    // store the volunteer_name column from activity table
    searchby = 'volunteer_name';
  }
  //Execute SQL for generating information inside Listview
  db.transaction(function(tx) {
    tx.executeSql(
    'SELECT `activity_id`, `activity_name`, `activity_location`, `activity_date`, `activity_time`, `volunteer_name` FROM `activity` WHERE ("'+searchby+'" LIKE ?) ORDER BY `activity_id` ASC',
    ['%'+$('#myFilter').val()+'%'],
    function(tx, listresult) {
      var length = listresult.rows.length;
      for(var i=0; i<length; i++) {
      //Inside listview <li> it will show ID of Activity inside <text>, so that allow once clicked the system will know which activity they selecting
      $('#listActivity').append('<li class="liActivity"><a href="#screenViewDetails" data-transition="slide"><p><strong id="item_activity">Activity Name: '+htmlEntities(listresult.rows.item(i).activity_name)+'</strong></p><p><strong id="item_location">Activity Location: '+htmlEntities(listresult.rows.item(i).activity_location)+'</strong></p><p><strong id="item_location">Volunteer Name: '+htmlEntities(listresult.rows.item(i).volunteer_name)+'</strong></p><p><strong id="item_location">Date & Time: '+htmlEntities(listresult.rows.item(i).activity_date)+' @ '+htmlEntities(listresult.rows.item(i).activity_time)+'</strong></p></a><text id="listAID" hidden>'+htmlEntities(listresult.rows.item(i).activity_id)+'</text></li>');
      }
      
      //Refresh ListView
      $("#listActivity").listview( "refresh" );
    },
    function(errs) {
      alert('Query or WebSQL Connection errors: '+errs.message+' Please Contact Admin!');
    }
    );
    
  })
}

// View for particular activity 
function viewDetailsActivity() {
  //If database is not created pop error and stop function.
  if (db==null) {
    alert('Error: Database is null.');
    return;
  }
  
  //Empty ListView
  $('#viewdetails').empty();
  
  //Execute SQL for generating information inside Listview
  db.transaction(function(tx) {
    tx.executeSql(
    'SELECT `activity_name`, `activity_location`, `activity_date`, `activity_time`, `volunteer_name` FROM `activity` WHERE `activity_id` = ?',
    [activityid],
    function(tx, listresult) {
      //Inside listview <li> it will show ID of Activity inside <text>, so that allow once clicked the system will know which activity they selecting
      $('#viewdetails').append('<li><p><strong id="viewdetails">Activity Name: </strong>'+htmlEntities(listresult.rows.item(0).activity_name)+'</p></li>');
      $('#viewdetails').append('<li><p><strong id="viewdetails">Activity Location: </strong>'+htmlEntities(listresult.rows.item(0).activity_location)+'</p></li>');
      $('#viewdetails').append('<li><p><strong id="viewdetails">Activity Date: </strong>'+htmlEntities(listresult.rows.item(0).activity_date)+'</p></li>');
      $('#viewdetails').append('<li><p><strong id="viewdetails">Activity Time: </strong>'+htmlEntities(listresult.rows.item(0).activity_time)+'</p></li>');
      $('#viewdetails').append('<li><p><strong id="viewdetails">Volunteer Name: </strong>'+htmlEntities(listresult.rows.item(0).volunteer_name)+'</p></li>');
      //Refresh ListView
      $("#viewdetails").listview( "refresh" );
    },
    function(errs) {
      alert('Query or WebSQL Connection errors: '+errs.message+' Please Contact Admin!');
    }
    );
    
    //Generate All report for selected activity inside listview 
    $("#viewreports").empty();
    
    tx.executeSql(
    'SELECT `report_id`, `report_desc`, `report_date` FROM `report` WHERE `activity_id` = ? ORDER BY `report_id` ASC',
    [activityid],
    function(tx, reportresult) {
      if(reportresult.rows.length>0){
        for(var i=0; i<reportresult.rows.length; i++) {
        $('#viewreports').append('<li class="liReport"><p>'+htmlEntities(reportresult.rows.item(i).report_desc)+'</p><p> Time Stamp:'+htmlEntities(reportresult.rows.item(i).report_date)+'</p><text id="hiddenreportID" hidden>'+htmlEntities(reportresult.rows.item(i).report_id)+'</text></li>');
        }
      }else{
        $('#viewreports').append('<p>No reports/rewards in this activity yet.</p>');
      }
      $("#viewreports").listview( "refresh" );
    },
    function(error) {
      alert('Error: '+error.message);
    }
    );
  })
}

// Delete for particular Activity
function deleteSpecificActivity(){
  if (confirm("Are you confirm to delete this activity?")) {
    // Delete activity along with the report by activity id
    db.sqlBatch([
      ['DELETE FROM activity WHERE activity_id = ?', [activityid]],
      ['DELETE FROM report WHERE activity_id = ?', [activityid]]
    ], function() {
      alert('You have successfully deleted this activity with reports!');
      //Refresh the activity list view data, to keep updating new data record
      viewActivity();
      //After successfully delete and refresh then go back to activity list view page.
      $.mobile.changePage("#screenView");
    }, function(errs) {
      alert('Transaction ERROR: ' + errs.message);
    });

  }
}

// Add Report into SQLITE Database
function addReport() {
  
  var inputReportDesc = $('#reportinput').val();
  // Get today Date
  var currentdate = new Date(); 
  // Set for date & time format
  var datetime =  currentdate.getDate() + "/"
          + (currentdate.getMonth()+1)  + "/" 
          + currentdate.getFullYear() + " @ Time: "  
          + currentdate.getHours() + ":"  
          + currentdate.getMinutes() + ":" 
          + currentdate.getSeconds();
  
  if(!inputReportDesc)
  {
    //To avoid user input empty report
    alert("Please enter report description!");
  }
    //To avoid user input spacing as an report
    else if (!inputReportDesc.trim())
  {
    alert("Please enter meaningful report description, intead of spacing.");
  }
    //Else All validation passed then run this function
  else
  {
    //validate for database create and connection
    if (db==null) {
      alert('Database Error: There is no any database. Please contact admin!');
      return;
    }

    //Once all validation is passed then goes to this add function process
    else
    {
      db.transaction(function(tx) {
        tx.executeSql(
          'INSERT INTO `report` (`report_desc`, `activity_id`, `report_date`) VALUES (?,?,?)', // This Insert Report Query Statement
          [inputReportDesc, activityid, datetime],
          function(tx, resultaddreport) { // Once successfully added will go this function
            if (resultaddreport.rowsAffected==1)
              console.log('Congratulation! You have successfully added report into this actitvity!');
            
              //Refresh the report list view data, to keep updating new data record
              viewDetailsActivity();
          },
          function(errs) { // If errors then go this function
            alert('Query or WebSQL Connection errors: '+errs.message+' Please Contact Admin!');
          }
        );
      })
      
      //Clear Report Textboxes
      
      $('#reportinput').val('');
      
      //Refreshing report's listview
      
      $("#viewreports").listview( "refresh" );
    }
  }
}  

// Delete for particular report once tapped it.
function deleteReport(){
  if (confirm("Are you confirm to delete this report?")) {
    db.transaction(function(tx) {
      tx.executeSql(
        'DELETE FROM report WHERE report_id = ?', // This Insert Activity Query Statement
        [reportid],
        function(tx, deletereport) { // Once successfully added will go this function
          //Refresh the report list view data, to keep updating new data record
          viewDetailsActivity();
        },
        function(errs) { // If errors then go this function
          alert('Query or WebSQL Connection errors: '+errs.message+' Please Contact Admin!');
        }
      );
    })
  }
}

// Set to global variables, in order to pass the id value to each page.
var activityid = '';
var reportid = '';








