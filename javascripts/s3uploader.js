var s3 = s3_init();
var len = 0;
function s3_init() {
    var bucketName = 'anran-privacy-categories-upload';
    AWS.config.region = 'ap-northeast-1'; 
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-northeast-1:82459228-da79-4229-aeef-0168565a5e2e',
    });
    AWS.config.apiVersions = {
    cognitoidentity: '2014-06-30',
    // other service API versions
    };
    var s3 = new AWS.S3({
        params: {Bucket: bucketName}
    });
    //creating the folder for every participant
    //const key = turkGetParam('hitId');
    const key = 'whole_.png';
    var URIKey= encodeURIComponent(key);
    /*s3.headObject({ Key: URIKey }, function(err, data) {
        if (!err) {
        return alert("folder already exists.");
        }
        if (err.code !== "NotFound") {
            return alert("There was an error creating your folder: " + err.message);
        }
        s3.putObject({ Key: URIKey }, function(err, data) {
        if (err) {
            return alert("Opps, There was an error creating your folder: " + err.message);
        }
        alert("Successfully created your folder.");
        });
    });
    s3.putObject({ Key: URIKey }, function(err, data) {
        if (err) {
            return alert("Opps, There was an error creating your folder: " + err.message);
        }
        alert("Successfully created your folder.");
        });*/
    //count the number of image
    return s3;
}               
// upload one photo
function s3upload_info(){
    var info = get_info();
    var name = 'participants_info/' + info['workerid'] + '_info.txt';
    var text = info['name'] + '_' + info['age'] + '_' + info['nationality'] + '_' + info['workerid'];
    var textBlob = new Blob([text], {
        type: 'text/plain'
    });
    s3.upload({
        Key: name,
        Body: textBlob,
        ContentType: 'text/plain',
        ACL: 'bucket-owner-full-control'
    }, function(err, data) {
        if(err) {
            reject('error');
        }
        }).on('httpUploadProgress', function (progress) {
        var uploaded = parseInt((progress.loaded * 100) / progress.total);
        $("progress").attr('value', uploaded);
    });
}

function s3upload_questionnaire(){
    var info = get_info();
    var res = get_bigfive();
    var name = 'participants_info/' + info['workerid'] + '_questionnaire.txt';
    var text = res['1'] + '_' + res['2'] + '_' + res['3'] + '_' + res['4'] + '_' +res['5'] 
    + '_' + res['6'] + '_' + res['7'] + '_' + res['8'] + '_' + res['9'] + '_' + res['10'];
    var textBlob = new Blob([text], {
        type: 'text/plain'
    });
    s3.upload({
        Key: name,
        Body: textBlob,
        ContentType: 'text/plain',
        ACL: 'bucket-owner-full-control'
    }, function(err, data) {
        if(err) {
            reject('error');
        }
        }).on('httpUploadProgress', function (progress) {
        var uploaded = parseInt((progress.loaded * 100) / progress.total);
        $("progress").attr('value', uploaded);
    });
}
function s3upload_photo() {
    if(!check_if_add_annotation())
    {   
        alert('アノテーションボックスを1つ以上追加してください。');
        return;
    }
    if(!check_annotation()){
        alert('全ての項目にご記入ください。');
        return;
    }
    let ori_canvas = document.getElementById('ori');
    let mosaic_canvas = document.getElementById('mosaic');
    var ori_file = ori_canvas.toDataURL('image/png');
    var mosaic_file = mosaic_canvas.toDataURL('image/png');
    var ori_image = new Image();
    var mosaic_image = new Image();
    let images = [ori_image, mosaic_image];
    var imagesLoaded = 0;
    var info = get_info();
    for(var i=0; i < images.length; i++){
        images[i].onload = () => {
            imagesLoaded++;
            if(imagesLoaded == images.length){
                allLoaded();
                move_progress();
            }
        }
    }
    ori_image.src = ori_file;
    mosaic_image.src = mosaic_file;
    // generate the whole image and then upload all images to amazon s3
    function allLoaded () {
        upload_annotation_info();
        var prefix = 'photo/';
        s3.listObjects({Prefix: prefix}, function(err, data){ 
            var num = Math.round(data["Contents"].length / 3);
            console.log('start uploading');
            var whole_img = document.createElement('canvas');
            //create an image with the mosaic 
            let canvas_area = document.getElementById('canvas-area');
            const vw = canvas_area.offsetWidth;
            const vh = canvas_area.offsetHeight;
            whole_img.width = vw;
            whole_img.height = vh;
            whole_img.getContext('2d').drawImage(ori_image, 0, 0);
            whole_img.getContext('2d').drawImage(mosaic_image,0, 0);
            var whole_file = whole_img.toDataURL('image/png');
            
            var name = prefix + info['name'] + '_' + info['age'] + '_' + info['nationality'] + '_' + info['workerid'] + '_' + 'ori_' + num + '.png';
            var file = dataURItoBlob(ori_file);
            //upload the original image
            s3.upload({
                Key: name,
                Body: file,
                ContentType: 'image/png',
                ACL: 'bucket-owner-full-control'
            }, function(err, data) {
                if(err) {
                    reject('error');
                }
                }).on('httpUploadProgress', function (progress) {
                var uploaded = parseInt((progress.loaded * 100) / progress.total);
                $("progress").attr('value', uploaded);
            });
            //upload the mosaic image
            file = dataURItoBlob(mosaic_file);
            name = prefix + info['name'] + '_' + info['age'] + '_' + info['nationality'] + '_' + info['workerid'] + '_' + 'mosaic_' + num + '.png';
            s3.upload({
                Key: name,
                Body: file,
                ContentType: 'image/png',
                ACL: 'bucket-owner-full-control'
            }, function(err, data) {
                if(err) {
                    reject('error');
                }
                }).on('httpUploadProgress', function (progress) {
                var uploaded = parseInt((progress.loaded * 100) / progress.total);
                $("progress").attr('value', uploaded);
            });
            //upload the whole image
            file = dataURItoBlob(whole_file);
            name = prefix + info['name'] + '_' + info['age'] + '_' + info['nationality'] + '_' + info['workerid'] + '_' + 'whole_' + num + '.png';
            s3.upload({
                Key: name,
                Body: file,
                ContentType: 'image/png',
                ACL: 'bucket-owner-full-control'
            }, function(err, data) {
                if(err) {
                    reject('error');
                }
                alert('Successfully Uploaded!');
                clear_canvas();
                }).on('httpUploadProgress', function (progress) {
                var uploaded = parseInt((progress.loaded * 100) / progress.total);
                $("progress").attr('value', uploaded);
            });
        });
    };
}
function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
}
function move_progress(){
    len += 1;
    var bar = document.getElementById('progress-bar'); 
    bar.innerHTML = "<h3>Uploaded " + String(len) + "/10</h3>";
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function upload_annotation_info(){
    let res = get_annotation_info();
    res = JSON.stringify(res);
    var info = get_info();
    var name = 'photo_info/' + info['workerid'] + '_' + len + '.txt';
    var textBlob = new Blob([res], {
        type: 'text/plain'
    });
    s3.upload({
        Key: name,
        Body: textBlob,
        ContentType: 'text/plain',
        ACL: 'bucket-owner-full-control'
    }, function(err, data) {
        if(err) {
            reject('error');
        }
        }).on('httpUploadProgress', function (progress) {
        var uploaded = parseInt((progress.loaded * 100) / progress.total);
        $("progress").attr('value', uploaded);
    });
}

