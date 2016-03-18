// require an #log element for log to print.
var debug = {
    // common part, require device plugin, battery-status plugin.
    log: undefined,
    line: undefined,
    init: function() {
        debug.log = document.getElementById('log');
        window.addEventListener('batterystatus', debug.onBatterystatus, false);
    },
    printLine: function(text) {
        debug.line = document.createElement('p');
        debug.line.className = 'logline';
        debug.line.innerHTML = Date() + ':<br>' + text;
        debug.log.appendChild(debug.line);
        debug.log.scrollTop = debug.log.scrollHeight;
    },
    printImg: function(url) {
        debug.line = document.createElement('div');
        debug.line.className = 'logline';
        debug.log.appendChild(debug.line);

        var img = document.createElement('img');
        img.onload = function(){
            if (debug.line.clientWidth > img.naturalWidth) {
                img.width = img.naturalWidth;
            } else {
                img.width = debug.line.clientWidth;
            }
            debug.log.scrollTop = debug.log.scrollHeight;
        };
        img.src = url;
        debug.line.appendChild(img);
        debug.log.scrollTop = debug.log.scrollHeight;
    },
    deviceInfo: function() {
        debug.printLine('device.cordova = ' + device.cordova);
        debug.printLine('device.model = ' + device.model);
        debug.printLine('device.platform = ' + device.platform);
        debug.printLine('device.uuid = ' + device.uuid);
        debug.printLine('device.version = ' + device.version);
        debug.printLine('=========================================');
        /*debug.printLine('Connection=>dump = ' + debug.dump_obj(Connection));
        debug.printLine('Connection.UNKNOWN = ' + Connection.UNKNOWN);
        debug.printLine('Connection.ETHERNET = ' + Connection.ETHERNET);
        debug.printLine('Connection.WIFI = ' + Connection.WIFI);
        debug.printLine('Connection.CELL_2G = ' + Connection.CELL_2G);
        debug.printLine('Connection.CELL_3G = ' + Connection.CELL_3G);
        debug.printLine('Connection.CELL_4G = ' + Connection.CELL_4G);
        debug.printLine('Connection.CELL = ' + Connection.CELL);
        debug.printLine('Connection.NONE = ' + Connection.NONE);*/
        debug.printLine('navigator.connection.type = ' + navigator.connection.type);

        // iOS, Android, BlackBerry 10
        if (device.platform === 'Android' || device.platform === 'iOS') {
            debug.printLine('cordova.file.applicationDirectory = ' + cordova.file.applicationDirectory);
            debug.printLine('cordova.file.applicationStorageDirectory = ' + cordova.file.applicationStorageDirectory);
            debug.printLine('cordova.file.dataDirectory = ' + cordova.file.dataDirectory);
            debug.printLine('cordova.file.cacheDirectory = ' + cordova.file.cacheDirectory);
        }
        // Android
        if (device.platform === 'Android') {
            debug.printLine('cordova.file.externalApplicationStorageDirectory = ' + cordova.file.externalApplicationStorageDirectory);
            debug.printLine('cordova.file.externalDataDirectory = ' + cordova.file.externalDataDirectory);
            debug.printLine('cordova.file.externalCacheDirectory = ' + cordova.file.externalCacheDirectory);
            debug.printLine('cordova.file.externalRootDirectory = ' + cordova.file.externalRootDirectory);
        }
        // iOS
        if (device.platform === 'iOS') {
            debug.printLine('cordova.file.tempDirectory = ' + cordova.file.tempDirectory);
            debug.printLine('cordova.file.syncedDataDirectory = ' + cordova.file.syncedDataDirectory);
            debug.printLine('cordova.file.documentsDirectory = ' + cordova.file.documentsDirectory);
        }
    },
    onBatterystatus: function(e) {
        debug.printLine('batterystatus.level = ' + e.level);
        debug.printLine('batterystatus.isPlugged = ' + e.isPlugged);
    },
    dump_obj: function(myObject, Recursively) {  
        var s = "";
        if (typeof myObject !== 'object' || myObject === null) {
            return myObject;
        }
        for (var property in myObject) { 
            if (Recursively === true && typeof myObject[property] === 'object') {
                var sub = "";
                if (Object.prototype.toString.call( myObject[property] ) === '[object Array]') {
                    sub = '[';
                    for (var element in myObject[property]) {
                        sub += '\n' + debug.dump_obj(myObject[property][element]) + ',';
                    }
                    sub += '\n]';
                    s += '\n' + property + ": \n" + sub;
                } else {
                    s += '\n' + property +": {\n" + debug.dump_obj(myObject[property]) + '\n}';
                }
            } else {
                s = s + "\n " + property +": " + myObject[property];
            }
        }
        return s;  
    },
    // require quickfile library and file plugin.
    dump_dir: function(path, opt_dirDisplayName) {
        var name = path;
        if (opt_dirDisplayName != undefined) {
            name = opt_dirDisplayName;
        }
        QuickFile.readDirectory(path, 
            function (list) {
                debug.printLine('content of "' + name + '" -> ' + debug.dump_obj(list));
            },
            function (e) {
                debug.printLine('read directory '+ name +' failed ' + e.code + ': ' + QuickFile.errorToString(e));
            }
        );
    },
    // require virbation plugin.
    virbation: function() {
        debug.printLine('virbation started.');
        navigator.vibrate(500);
    },
    patternVirbation: function(timeArray) {
        debug.printLine('pattern virbation started.');
        //var timeArray = [500, 1000, 500, 1000, 500, 1000, 3000];
        if (timeArray.length > 0) {
            onetimeVibration();
        }
        function onetimeVibration() {
            navigator.vibrate(timeArray.shift());
            if (timeArray.length > 1) {
                setTimeout(onetimeVibration, timeArray.shift());
            }
        }
    },
    // require dialogs plugin. (Notification)
    tryAlert: function() {
        navigator.notification.alert(
            'you are foolish!',
            function(){debug.printLine('just alert a message.')},
            'trying alert',
            'dismiss');
    },
    tryConfirm: function() {
        // not work in browser
        navigator.notification.confirm(
            'you are great.',
            function(){debug.printLine('just conform a message with button ' + arguments[0])},
            'Did You Know',
            ['yes', 'no', 'not sure']);
    },
    tryAnotherConfirm: function() {
        window.confirm('Really simple a confirm function. Not a good choice.');
    },
    tryPrompt: function() {
        navigator.notification.prompt(
            'I Love You',
            function(){debug.printLine('just raise a prompt with button ' + arguments[0].buttonIndex + ', and received "' + arguments[0].input1 + '".')},
            'Say',
            // Android supports a maximum of three buttons, and ignores any more than that.
            ['Yes my master', 'Just BEAT IT', 'balabala...', 'forth will miss'],
            'I love you, too');
    },
    tryBeep: function() {
        // seems some windows phone device won't turn off the speaker after beep.
        navigator.notification.beep(2);
    },
    // require camera plugin
    cameraInfo: function() {
        debug.printLine('Camera -> ' + debug.dump_obj(Camera));
        debug.printLine('Camera.DestinationType -> ' + debug.dump_obj(Camera.DestinationType));
        debug.printLine('Camera.EncodingType -> ' + debug.dump_obj(Camera.EncodingType));
        debug.printLine('Camera.MediaType -> ' + debug.dump_obj(Camera.MediaType));
        debug.printLine('Camera.PictureSourceType -> ' + debug.dump_obj(Camera.PictureSourceType));
        debug.printLine('Camera.PopoverArrowDirection -> ' + debug.dump_obj(Camera.PopoverArrowDirection));
        debug.printLine('Camera.Direction -> ' + debug.dump_obj(Camera.Direction));
    },
    takePhoto: function() {
        navigator.camera.getPicture(
            function(data){debug.printLine('camera success: ' + data);debug.printImg(data)},
            function(msg){debug.printLine('camera error: ' + msg);},
            {
                quality : 80,
                /** 
                 * Camera.PictureSourceType.CAMERA PHOTOLIBRARY SAVEDPHOTOALBUM
                 * CAMERA for take a photo
                 * PHOTOLIBRARY for select a photo in the entire library on ios. Acts as same as the SAVEDPHOTOALBUM on android. So just use this one.
                 * SAVEDPHOTOALBUM for current "moments" on ios, and is not supported on windows phone.
                 */
                sourceType : Camera.PictureSourceType.CAMERA,
                /**
                 * DATA_URL FILE_URI NATIVE_URI.
                 * DATA_URL is a base64 encoded image raw data.
                 * windows phone can only use DATA_URL and FILE_URI
                 * NATIVE_URI can be used as src attribute for img elements on ios while FILE_URI only works in ios simulator(?or only installed on device instead of in phonegap app).But this option is not supported on windows phone and will occur an error.
                 */
                destinationType : Camera.DestinationType.FILE_URI,
                /**
                 * Only proccess an cut when taking photo, and will trim to squre on ios. Not support on windows phone and will be ignored.
                 */
                allowEdit : false,
                saveToPhotoAlbum : true
            }
        );
    },
    chosePhoto1: function() {
        navigator.camera.getPicture(
            function(data){debug.printLine('camera success: ' + data);debug.printImg(data);},
            function(){debug.printLine('camera error.');},
            {
                // Camera.PictureSourceType.CAMERA PHOTOLIBRARY SAVEDPHOTOALBUM
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                // cannot use as attribute 'src' in ios and windows phone.
                destinationType : Camera.DestinationType.FILE_URI
            }
        );
    },
    chosePhoto2: function() {
        navigator.camera.getPicture(
            function(data){debug.printLine('camera success: ' + data);debug.printImg(data);},
            function(){debug.printLine('camera error.');},
            {
                // Camera.PictureSourceType.CAMERA PHOTOLIBRARY SAVEDPHOTOALBUM
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                // can be used as src attribute for img elements on ios.
                // not supported on windows phone.
                destinationType : Camera.DestinationType.NATIVE_URI
            }
        );
    },
    //require dialogs plugin and md5 library.
    md5Test: function() {
        navigator.notification.prompt(
            'Input String: ',
            function(){debug.printLine('md5("' + arguments[0].input1 + '") = ' + md5(arguments[0].input1))},
            'MD5 Calculate',
            // Android supports a maximum of three buttons, and ignores any more than that.
            ['calculate'],
            ''
        );
    },
    // require quickfile library and file plugin.
    toggleMkDirectory: function(){
        var parentPath = cordova.file.dataDirectory;
        var path =  parentPath + 'top/test/';
        QuickFile.rmDirectory(
            parentPath + 'top/',
            function(){
                debug.printLine('rmDirectory success');
                debug.dump_dir(parentPath, 'dataDirectory');
            },
            function(e){
                QuickFile.mkDirectory(
                    path,
                    function(){
                        debug.printLine('mkDirectory success');
                        debug.dump_dir(parentPath, 'dataDirectory');
                        debug.dump_dir(parentPath + 'top/', 'top');
                    },
                    function(e){
                        debug.printLine('File Error ' + e.code + ': ' + QuickFile.errorToString(e));
                    }
                );
            }
        );
    },
    // require splashscreen plugin.
    splash: function(time){
        navigator.splashscreen.show();
        setTimeout(function(){
            navigator.splashscreen.hide();
        }, time);
    }
};

