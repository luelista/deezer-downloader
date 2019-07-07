$(document).ready(function() {

    function search_track() {
        $.post(deezer_downloader_api_root + '/search', 
            JSON.stringify({ type: "track", query: $('#query').val() }),
            function(data) {
                $("#results > tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    drawTableEntry(data[i], "track");
                }
        });
    }

    function search_album() {
        $.post(deezer_downloader_api_root + '/search', 
            JSON.stringify({ type: "album", query: $('#query').val() }),
            function(data) {
                $("#results > tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    drawTableEntry(data[i], "album");
                }
        });
    }

    $("#search_track").click(function() {
        search_track();
    });

    $("#search_album").click(function() {
        search_album();
    });


});

var bbody = document.getElementById('body');
bbody.onkeydown = function (event) {
    if (event.key !== undefined) {
       if (event.key === 'Enter' && event.altKey) {
         $.post(deezer_downloader_api_root + '/search', 
            JSON.stringify({ type: "album", query: $('#query').val() }),
            function(data) {
                $("#results > tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    drawTableEntry(data[i], "album");
                }
         });
       }  else if (event.key === 'Enter' ) {
          $.post(deezer_downloader_api_root + '/search', 
              JSON.stringify({ type: "track", query: $('#query').val() }),
              function(data) {
                  $("#results > tbody").html("");
                  for (var i = 0; i < data.length; i++) {
                      drawTableEntry(data[i], "track");
                  }
          });
       } else if (event.key === 'm' && event.ctrlKey) {
          $("#query").val("");
          $("#query").focus();
       } else if (event.key === 'b' && event.ctrlKey) {
          window.location = "/";
       }
    }
};
