goInstruction();
var initialized = false;
function get_info(){
    let participant_name = document.getElementById('particpant-name').value;
    participant_name = participant_name.replace('_','');
    let participant_age = document.getElementById('particpant-age').value;
    participant_age = participant_age.replace('_','');
    let participant_nationality = document.getElementById('particpant-nationality').value;
    participant_nationality = participant_nationality.replace('_','');
    let participant_workerid = document.getElementById('particpant-workerid').value;
    participant_workerid = participant_workerid.replace('_','');
    var ret = {'name': participant_name, 'age': participant_age, 'nationality': participant_nationality, 'workerid': participant_workerid};
    return ret;
}

function goTask(){
    let initial = document.getElementById("initial-space");
    let workspace = document.getElementById("workspace");
    let name = document.getElementById("particpant-name");
    let age = document.getElementById("particpant-age");
    let nationality = document.getElementById("particpant-nationality");
    let workerid = document.getElementById("particpant-workerid");
    if(!name.value || !age.value || !nationality.value || !workerid.value)
    {
        alert("情報を入力してください!");
        return;
    }
    var qs_res = get_bigfive();
    var keys = Object.keys(qs_res);
    for(var i = 0; i < keys.length; i++)
        if(typeof(qs_res[keys[i]]) == 'undefined')
        {
            alert("アンケートにお答えください!");
            return;
        }
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    initial.style.display = "None";
    workspace.style.display = "";
    if (initialized == false)
    {
        initialized = true;
        canvas_init();
        brush();
        s3upload_info();
        s3upload_questionnaire();
    }
   
    clear_canvas();
}

function goInstruction(){
    let initial = document.getElementById("initial-space");
    let workspace = document.getElementById("workspace");
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    initial.style.display = "";
    workspace.style.display = "None";
}

function get_bigfive(){
    var ans1 = $('input[name=Q1]:checked').val();
    var ans2 = $('input[name=Q2]:checked').val();
    var ans3 = $('input[name=Q3]:checked').val();
    var ans4 = $('input[name=Q4]:checked').val();
    var ans5 = $('input[name=Q5]:checked').val();
    var ans6 = $('input[name=Q6]:checked').val();
    var ans7 = $('input[name=Q7]:checked').val();
    var ans8 = $('input[name=Q8]:checked').val();
    var ans9 = $('input[name=Q9]:checked').val();
    var ans10 = $('input[name=Q10]:checked').val();
    var res = {'1': ans1,
    '2': ans2,
    '3': ans3,
    '4': ans4,
    '5': ans5,
    '6': ans6,
    '7': ans7,
    '8': ans8,
    '9': ans9,
    '10': ans10
    };
    return res;
}