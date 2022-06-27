var eraser_flag = 0;
var mosaic_flag = 1;
let card_container = document.getElementById('card-container');
//card_container.style.zIndex = "10";
    //document.getElementById("finish").addEventListener('tap', s3upload());
function clear_canvas(){
    let ori_canvas = document.getElementById('ori');
    let mosaic_canvas = document.getElementById('mosaic');
    ori_canvas.getContext('2d').clearRect(0, 0, ori_canvas.width, ori_canvas.height);
    mosaic_canvas.getContext('2d').clearRect(0, 0, mosaic_canvas.width, mosaic_canvas.height);
    removeAllChildNodes(card_container);
    let card_creator = document.getElementById('card-creator');
    card_creator.classList.add('bg-danger');
}
function canvas_init () {
    let canvas_area = document.getElementById('canvas-area');
    const vw = canvas_area.offsetWidth;
    const vh = canvas_area.offsetHeight;
    console.log('canvas area\'s size is:', vw, vh);
    let ori_canvas = document.getElementById('ori');
    let mosaic_canvas = document.getElementById('mosaic');
    let card = document.getElementById('card-container');
    mosaic_canvas.width = vw;
    mosaic_canvas.height = vh;
    mosaic_canvas.style.width = String(vw) + 'px';
    mosaic_canvas.style.height = String(vh) + 'px';
    //canvas.mosaic_canvas.style.top = String(brother.offsetHeight) + 'px';
    ori_canvas.width = vw;
    ori_canvas.height = vh;
    ori_canvas.style.width = String(vw) + 'px';
    ori_canvas.style.height = String(vh) + 'px';
    document.getElementById('upload-input').addEventListener('change', function(e) {
        var file = document.getElementById('upload-input').files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
        clear_canvas();
        var _image = new Image();
            _image.onload = function() {
                var w = this.width;
                var h = this.height;
                var scale = 0.99;
                var max_w = scale * vw;
                var max_h = scale * vh;
                const ratio_w = w / max_w;
                const ratio_h = h / max_h;
                if ((w >= max_w && h < max_h) || (w >= max_w && ratio_w >= ratio_h)){
                    h = Math.round(max_w * h / w);
                    w = max_w;
                }
                else if ( (h >= max_h && w < max_w) ||(h >= max_h && ratio_h >= ratio_w) )
                {
                    w = Math.round(max_h * w / h);
                    h = max_h;
                }
                w = Math.round(w / 5 - 1) * 5;
                h = Math.round(h / 5 - 1) * 5;
                var start_x = 0.5 * (vw - w);
                var start_y = 0.5 * (vh - h);
            console.log('canvas width: ', w, 'canvas height: ', h);
            ori_canvas.getContext('2d').drawImage(_image, start_x, start_y, w, h);
            create_photo_info();
        }
        _image.src = e.target.result;
        }
    });
}
// adding mosaic
function brush() {
    eraser_flag = 0;
    mosaic_flag = 1;
    brush_init();
}
function eraser() {
    eraser_flag = 1;
    mosaic_flag = 0;
    brush_init();
}
function drawMosaic(index_x,index_y, x, y, value,size)
{
    var ori = document.getElementById("ori");
    var ctx = document.getElementById("mosaic").getContext('2d');
    //console.log(index_x,index_y, x, y, value,size, ori.offsetHeight, ori.offsetWidth);
    if( index_x >= 0 && index_x < ori.offsetWidth && index_y >= 0 && index_y < ori.offsetHeight && Math.sqrt((index_x - x) * (index_x - x) + (index_y - y) * (index_y - y)) <= value)
        {
            var ori_ctx = ori.getContext('2d');
            var image_data = ori_ctx.getImageData(index_x,index_y,1,1);
            var pix = image_data.data;
            var r = pix[0];
            var g = pix[1];
            var b = pix[2];
            var a = pix[3];
            ctx.fillStyle = 'rgba(' + String(r) + ',' + String(g) + ',' + String(b) + ',' + String(a) + ')';
            //ctx.fillStyle = 'blue';
            if(index_x+size > ori.width || index_y+size > ori.height)  ctx.fillRect(index_x, index_y, ori.width-index_x, ori.height-index_y);
            else ctx.fillRect(index_x, index_y, size, size);
            
        }
    return;
}

function brush_init() {
// when clicking the brush button
    var mosaic_canvas = document.getElementById("mosaic");
    mosaic_canvas.style.zIndex = 100;
    var isDrawing, lastPoint;
    function brush_down_function(e) {
        //console.log('down');
        isDrawing = true;
        var bounds = e.target.getBoundingClientRect();
        var x_ = e.pageX - bounds.left - scrollX;  // is window.scrollX same for Y
        var y_ = e.pageY - bounds.top - scrollY;   //
        //y_ = y_ + canvas.brother.offsetHeight;
        lastPoint = { x: x_, y: y_ };
    }
    function brush_move_function (e) {
        if (!isDrawing) return;
        var mosaic = document.getElementById('mosaic');
        var bounds = e.target.getBoundingClientRect();
        var x_ = e.pageX - bounds.left - scrollX;  // is window.scrollX same for Y
        var y_ = e.pageY - bounds.top - scrollY;   //
        //y_ = y_ + canvas.brother.offsetHeight;
        var currentPoint = { x: x_, y: y_ };
        var dist = distanceBetween(lastPoint, currentPoint);
        var angle = angleBetween(lastPoint, currentPoint);
        var value = Number(document.getElementById('brush-size').value);
        var size = Number(document.getElementById('mosaic-size').value);
        //var pix = ctx_ori.getImageData(x_-value, y_-value, 2*value, 2*value).data;
        
        for (var i = 0; i < dist; i+=5) {  
        var x = lastPoint.x + (Math.sin(angle) * i);
        var y = lastPoint.y + (Math.cos(angle) * i);
        if (eraser_flag){
            var ctx = mosaic.getContext('2d');
            ctx.fillStyle = "#fff";
            ctx.clearRect(x-value, y-value, 2*value, 2*value);
        }
        else if (mosaic_flag) {
            var index_x_start = Math.round((x-value)/size) * size;
            var index_y_start = Math.round((y-value)/size) * size;
            if(index_y_start <= 0) index_y_start = 0;
            if(index_x_start <= 0) index_x_start = 0;
            var index_x_end, index_y_end;
            index_x_end = index_x_start + 2 * value;
            index_y_end = index_y_start + 2 * value;
            if(index_x_end > mosaic_canvas.width) index_x_end = mosaic_canvas.width;
            if(index_y_end > mosaic_canvas.height) index_y_end = mosaic_canvas.height;
            for(var index_x = index_x_start; index_x < index_x_end; index_x+= size)
                for(var index_y = index_y_start; index_y < index_y_end; index_y+= size)
                {
                    drawMosaic(index_x,index_y, x, y, value, size);
                }
        }
            lastPoint = currentPoint;
        }
    }
    function  brush_up_function(e) {
        isDrawing = false;
        //create_card();
    }	
    function distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
    function angleBetween(point1, point2) {
        return Math.atan2( point2.x - point1.x, point2.y - point1.y );
    }   	
    mosaic_canvas.addEventListener('mousedown', brush_down_function);
    mosaic_canvas.addEventListener('mousemove', brush_move_function);
    mosaic_canvas.addEventListener('mouseup', brush_up_function);		
}
function create_card(){
    let card_creator = document.getElementById('card-creator');
    card_creator.classList.remove('bg-danger');
    let id = card_container.childNodes.length - 1;
    let card = document.createElement('div');
    card.id = "card-" + id;
    card.className = 'card border-dark mb-3';
    card.style = "width: 19rem;";
    //card.style.zIndex = "10";
    

    let card_body = document.createElement('div');
    card_body.id = 'cardheader-' + id;
    card_body.className = 'card-header col-12';
    card_body.innerHTML = "<strong>Annotation Box</strong>";
    let del = document.createElement('div');
    del.className = 'container';
    let del_row = document.createElement('div');
    del_row.className = 'row';
    let del_text = document.createElement('div');
    del_text.className = 'card-text col-10';
    del_text.innerHTML = '<p style = "font-size: 14px;" class="text-danger">Click the right icon to delete.</p>';
    let del_icon = document.createElement('div');
    del_icon.className = 'card-text col-2';
    //del.innerHTML = '<p class="text-danger">Delete this annotation.</p>';
    del_icon.style = 'background-image: url("./icons/bin.png"); background-size: 45px 37px;';
    del_icon.id = 'del-' + id;
    del_icon.addEventListener('click', function(e){
        const id = e.target.id.split('-')[1];
        console.log(id);
        var card = document.getElementById('card-' + id);
        card_container.removeChild(card);
    });
    del_row.appendChild(del_text);
    del_row.appendChild(del_icon);
    del.appendChild(del_row);
    // First Question    
    let category = document.createElement('div');
    category.innerHTML = "<strong>1: What is the objective you covered?</strong>";
    category.className = 'card-text';
    let category_input = document.createElement('input');
    category_input.type = "text";
    category_input.id = 'category-' + id;
    //category_input.style.zIndex = "10";

    // Second Question
    /*
    <select class="form-select form-select-sm" aria-label=".form-select-sm example">
        <option selected>Open this select menu</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
    </select>
    */
    let reason = document.createElement('div');
    reason.innerHTML = "<strong>2: Why do you think it is a privacy-threatening content?</strong>";
    reason.className = 'card-text';
    let reason_input = document.createElement('select');
    reason_input.className = 'form-select';
    reason_input.id = "reason-" + id;
    let reason_option_default = document.createElement('option');
    reason_option_default.value = 0;
    reason_option_default.selected = 'selected';
    reason_option_default.innerHTML = 'Open this select menu';
    let reason_option_1 = document.createElement('option');
    reason_option_1.value = 1;
    reason_option_1.innerHTML = 'It can expose my identity.';
    let reason_option_2 = document.createElement('option');
    reason_option_2.value = 2;
    reason_option_2.innerHTML = 'It can expose my location.';
    let reason_option_3 = document.createElement('option');
    reason_option_3.value = 3;
    reason_option_3.innerHTML = 'It can expose my habits.';
    let reason_option_4 = document.createElement('option');
    reason_option_4.value = 4;
    reason_option_4.innerHTML = 'It can expose my social circle.';
    let reason_option_5 = document.createElement('option');
    reason_option_5.value = 5;
    reason_option_5.innerHTML = 'Other reasons (Please input below).';
    let reason_text = document.createElement('input');
    reason_text.type = 'text';
    reason_text.id = 'reason-text-' + id;
    reason_text.style.display = 'None';
    reason_input.appendChild(reason_option_default);
    reason_input.appendChild(reason_option_1);
    reason_input.appendChild(reason_option_2);
    reason_input.appendChild(reason_option_3);
    reason_input.appendChild(reason_option_4);
    reason_input.appendChild(reason_option_5);
    reason_input.addEventListener('change', (e)=>{
        if(e.target.value == 5)
        {
            reason_text.style.display = "";
            reason_text.required = "required";
            reason_text.placeholder = "Please input reasons here.";
        }
        else{
            reason_text.style.display = "None";
            reason_text.required = "";
            reason_text.placeholder = "";
        }
    });
    
    //importance
    let importance = document.createElement('div');
    importance.innerHTML = "<strong>3: How important do you think about this privacy for you?</strong>";
    importance.className = 'card-text';
    let importance_input = document.createElement('input');
    importance_input.type = 'range';
    importance_input.max = '7';
    importance_input.min = '1';
    importance_input.step = '1';
    importance_input.value = '4';
    importance_input.id = "importance-" + id;
    let intensity = { '1': 'extremely unimportant',
            '2': 'moderately unimportant',
            '3': 'slightly unimportant',
            '4': 'neutral',
            '5': 'slightly important',
            '6': 'moderately important',
            '7': 'extremely important'
    };
    importance_input.addEventListener('change', (e)=>{
        importance_show.innerHTML = '<strong>' + intensity[e.target.value] + '</strong>';
    });
    let importance_show = document.createElement('div');
    importance_show.className = 'card-text';
    importance_show.innerHTML = '<strong>' + intensity[importance_input.value] + '</strong>';
    importance_show.style.textAlign = 'center';
    
   
    //delete
    card.appendChild(card_body);
    card.appendChild(category);
    card.appendChild(category_input);
    card.appendChild(reason);
    card.appendChild(reason_input);
    card.appendChild(reason_text);
    card.appendChild(importance);
    card.appendChild(importance_input);
    card.appendChild(importance_show);
    card.appendChild(del);
    //card.appendChild(del);
    card_container.appendChild(card);
}

function create_photo_info(){
    let card = document.createElement('div');
    card.id = "photo-" + len;
    card.className = 'card text-white bg-secondary mb-3';
    card.style = "width: 19rem; font-size: 20px;";
    //card.style.zIndex = "10";
    

    let card_body = document.createElement('div');
    card_body.id = 'photo-' + len;
    card_body.className = 'card-header col-12';
    card_body.innerHTML = "<strong>Basic Info of The Photo</strong>";

    let platform = document.createElement('div');
    platform.innerHTML = "<strong>1: What is platform you share this photo on?</strong>";
    platform.className = 'card-text';
    let platform_input = document.createElement('select');
    platform_input.className = 'form-select';
    platform_input.id = "platform-" + len;
    let platform_option_default = document.createElement('option');
    platform_option_default.value = 0;
    platform_option_default.selected = 'selected';
    platform_option_default.innerHTML = 'Open this select menu';
    let platform_option_1 = document.createElement('option');
    platform_option_1.value = 1;
    platform_option_1.innerHTML = 'Facebook';
    let platform_option_2 = document.createElement('option');
    platform_option_2.value = 2;
    platform_option_2.innerHTML = 'Twitter';
    let platform_option_3 = document.createElement('option');
    platform_option_3.value = 3;
    platform_option_3.innerHTML = 'Instagram';
    let platform_option_4 = document.createElement('option');
    platform_option_4.value = 4;
    platform_option_4.innerHTML = 'Line';
    let platform_option_5 = document.createElement('option');
    platform_option_5.value = 5;
    platform_option_5.innerHTML = 'Wechat';
    let platform_option_6 = document.createElement('option');
    platform_option_6.value = 6;
    platform_option_6.innerHTML = 'Whatsapp';
    let platform_option_7 = document.createElement('option');
    platform_option_7.value = 7;
    platform_option_7.innerHTML = 'Messenger';
     let platform_option_8 = document.createElement('option');
    platform_option_8.value = 8;
    platform_option_8.innerHTML = 'Snap';
     let platform_option_9 = document.createElement('option');
    platform_option_9.value = 9;
    platform_option_9.innerHTML = 'Other platforms (Please input below).';
    let platform_text = document.createElement('input');
    platform_text.type = 'text';
    platform_text.id = 'platform-text-' + len;
    platform_text.style.display = 'None';
    platform_input.appendChild(platform_option_default);
    platform_input.appendChild(platform_option_1);
    platform_input.appendChild(platform_option_2);
    platform_input.appendChild(platform_option_3);
    platform_input.appendChild(platform_option_4);
    platform_input.appendChild(platform_option_5);
    platform_input.appendChild(platform_option_6);
    platform_input.appendChild(platform_option_7);
    platform_input.appendChild(platform_option_8);
    platform_input.appendChild(platform_option_9);
    platform_input.addEventListener('change', (e)=>{
        if(e.target.value == 9)
        {
            platform_text.style.display = "";
            platform_text.required = "required";
            platform_text.placeholder = "Please input the platform here.";
        }
        else{
            platform_text.style.display = "None";
            platform_text.required = "";
            platform_text.placeholder = "";
        }
    });
    
    let recipient = document.createElement('div');
    recipient.innerHTML = "<strong>2: What are recipients you share this photo to?</strong>";
    recipient.className = 'card-text';
    let recipient_input = document.createElement('select');
    recipient_input.className = 'form-select';
    recipient_input.id = "recipient-" + len;
    let recipient_option_default = document.createElement('option');
    recipient_option_default.value = 0;
    recipient_option_default.selected = 'selected';
    recipient_option_default.innerHTML = 'Open this select menu';
    let recipient_option_1 = document.createElement('option');
    recipient_option_1.value = 1;
    recipient_option_1.innerHTML = 'Friends you added';
    let recipient_option_2 = document.createElement('option');
    recipient_option_2.value = 2;
    recipient_option_2.innerHTML = 'Public';
    let recipient_option_3 = document.createElement('option');
    recipient_option_3.value = 3;
    recipient_option_3.innerHTML = 'Broadcast programme';
    let recipient_option_4 = document.createElement('option');
    recipient_option_4.value = 4;
    recipient_option_4.innerHTML = 'Other recipients (Please input below).';
    //reason_input.style.zIndex = "10";
    recipient_input.addEventListener('change', (e)=>{
        if(e.target.value == 4)
        {
            recipient_text.style.display = "";
            recipient_text.required = "required";
            recipient_text.placeholder = "Please input the recipients here.";
        }
        else{
            recipient_text.style.display = "None";
            recipient_text.required = "";
            recipient_text.placeholder = "";
        }
    });
    let recipient_text = document.createElement('input');
    recipient_text.type = 'text';
    recipient_text.id = 'recipient-text-' + len;
    recipient_text.style.display = 'None';
    recipient_input.appendChild(recipient_option_default);
    recipient_input.appendChild(recipient_option_1);
    recipient_input.appendChild(recipient_option_2);
    recipient_input.appendChild(recipient_option_3);
    recipient_input.appendChild(recipient_option_4);

    card.appendChild(card_body);
    card.appendChild(platform);
    card.appendChild(platform_input);
    card.appendChild(platform_text);
    card.appendChild(recipient);
    card.appendChild(recipient_input);
    card.appendChild(recipient_text);
    card_container.appendChild(card);
}

function get_annotation_info(){
    let res = {};
    let info = get_info();
    res.workerid = info['workerid'];
    res.photoid = len;
    // photo basic info
    const platform_id = "platform-" + len;
    var platform = document.getElementById(platform_id);
    res.platform = platform.value;
    if(platform.value == 9)
    {
        const platform_text_id = 'platform-text-' + len;
        var platform_text = document.getElementById(platform_text_id);
        res.platform_text = platform_text.value;
    }
    const recipient_id = "recipient-" + len;
    var recipient = document.getElementById(recipient_id);
    res.recipient = recipient.value;
    if(recipient.value == 4)
    {
        const recipient_text_id = 'recipient-text-' + len;
        var recipient_text = document.getElementById(recipient_text_id);
        res.recipient_text = recipient_text.value;
    }
    // annotation info
    let annotation_num = card_container.childNodes.length;
    for(var id = 0; id < annotation_num - 1; id++)
    {
        console.log('id:', id);
        var annotation_id = 'annotation-' + id;
        res[annotation_id] = {};
        const category_id = 'category-' + id;
        var category = document.getElementById(category_id);
        res[annotation_id].category = category.value;
        var reason_id = 'reason-' + id;
        var reason = document.getElementById(reason_id);
        res[annotation_id].reason = reason.value;
        if(reason.value == 5)
        {
            const reason_text_id = 'reason-text-' + id;
            var reason_text = document.getElementById(recipient_text_id);
            res[annotation_id].reason_text = reason_text.value;
        }
        var importance_id = 'importance-' + id;
        var importance = document.getElementById(importance_id);
        res[annotation_id].importance = importance.value;
    }
    return res;
}
//One photo should contain at least one annotation
function check_if_add_annotation(){
    let annotation_num = card_container.childNodes.length - 1;
    if(annotation_num == 0)
        return false;
    return true;
}
//all annotation should be filled
function check_annotation(){
    const platform_id = "platform-" + len;
    var platform = document.getElementById(platform_id);
    const recipient_id = "recipient-" + len;
    var recipient = document.getElementById(recipient_id);
    if(platform.value == 0){
        return false;
    }
    if(recipient.value == 0)
    {
        return false;
    }
    let annotation_num = card_container.childNodes.length - 1;
    for(var id = 0; id < annotation_num; id++)
    {
        var category_id = 'category-' + id;
        var category = document.getElementById(category_id);
        if(category.value == "")
        {
            return false;
        }
        var reason_id = 'reason-' + id;
        var reason = document.getElementById(reason_id);
        if(reason.value == 0)
        {
            return false;
        }
    }
    return true;
}