function checkStringConfig() {
  let element = $("#string_config");
  try {
    let json = JSON.parse(element.val());
    if (json && typeof json == "object") {
      element.get(0).setCustomValidity("");
    } else {
      console.log("Hey"); 
      element.get(0).setCustomValidity("Please provide a JSON representation");
    }
  } catch (e) {
    console.log("Ho"); 
    element.get(0).setCustomValidity("Please provide a JSON representation");
  }
}

function checkHostIp() {
  let element = $("#host_ip");
  let host_ip = element.val();
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(host_ip)) {
    element.get(0).setCustomValidity("");
  } else {
    element.get(0).setCustomValidity("No valid IP-address");
  }
}

function send() {
  let payload = {};
  payload.resource_type = $("#resource_type").val();
  payload.resource_model = $("#resource_model").val();
  payload.resource_adapter = $("#resource_adapter").val();
  payload.name = $("#name").val();
  payload.description = $("#description").val();
  payload.string_config = JSON.parse($("#string_config").val());
  payload.host_ip = $("#host_ip").val();

  let resource_uuid = $("#resource_uuid").val();
  if (resource_uuid !== "") {
    payload.resource_uuid = resource_uuid;
  }

  payload.auto_start = $("#auto_start_true").is(":checked");
  payload.keep_connected = $("#keep_connected_true").is(":checked");

  payload = JSON.stringify(payload);
  $.ajax({
    type: "POST",
    url: "/api/resources",
    data: payload,
    contentType: "application/json"
  }).done(function () {
    window.location = "/read_resources";
  }).fail(function (statusText) {
    let element = $("#errorDiv");
    element.html("<p>"+ statusText +"</p>");
    element.css("display", "block");
  });
}