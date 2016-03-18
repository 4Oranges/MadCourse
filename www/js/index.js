// ****************************************************************************

var Server = {
    DEFAULT: 'http://mad-course.coding.io/',
    CUGB: 'http://mad.daftme.com/'
};








// ****************************************************************************
var DirData;
var pathData;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        debug.init();
        debug.deviceInfo();
        //window.shouldRotateToOrientation = function(degrees) { return true; };
        app.receivedEvent('deviceready');
        if (device.platform.toUpperCase() === 'ANDROID') {
            DirData = cordova.file.dataDirectory;
            pathData = DirData + 'data.json';
        }
        if (device.platform.toUpperCase() === 'IOS') {
            $("[data-role=header] h1").before('<br/>');
            DirData = cordova.file.syncedDataDirectory;
            pathData = DirData + 'data.json';
        }
        if (device.platform.toUpperCase() === 'BROWSER') {
            DirData = null;
            pathData = null;
        }

        $.support.cors = true;
        //$.mobile.buttonMarkup.hoverDelay = 200;
        $.mobile.allowCrossDomainPages = true;
        $('#courselogin select[name=collegeID]').change(function(){
            var form = $('#courselogin');
            form.find('input[name=username]').val("");
            form.find('input[name=password]').val("");
            form.find('input[name=verification]').val("");
            var value = form.find('select[name=collegeID]').val();
            if (value !== 'null') coursePreload(value);
        });
        $('#courselogin button').click(function(){
            var form = $('#courselogin');
            var collegeID = form.find('select[name=collegeID]');
            var username = form.find('input[name=username]');
            var password = form.find('input[name=password]');
            var verification = form.find('input[name=verification]');

            if (collegeID.is(":visible") && collegeID.val() === "null") {
                navigator.notification.alert('',function(){},'请选择学校','知道了');
                return false;
            }
            if (username.is(":visible") && username.val() === "") {
                navigator.notification.alert('',function(){},'请输入用户名/学号','知道了');
                return false;
            }
            if (password.is(":visible") && password.val() === "") {
                navigator.notification.alert('',function(){},'请输入密码','知道了');
                return false;
            }
            if (verification.is(":visible") && verification.val() === "") {
                navigator.notification.alert('',function(){},'请输入验证码','知道了');
                return false;
            }
            courseLoad(collegeID.val(), username.val(), password.val(), verification.val());
            return false;
        });
        $('.usercontrol-back').hide();
        setupCourse();
    },
    receivedEvent: function(id) {
        /*var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');*/
        debug.printLine(id);
        console.log('Received Event: ' + id);
    }
};

function setupCourse() {
    if (device.platform === "browser") {
        gotoLogin();
        navigator.splashscreen.hide();
        return;
    }
    getJsonObjFromFile(pathData, function(obj){
        refreshCourse(obj);
        $('.usercontrol-back').show();
        setTimeout("navigator.splashscreen.hide();", 1000);
    }, function() {
        gotoLogin();
        navigator.splashscreen.hide();
        navigator.notification.alert('请进行一次教务导入，导入的数据将保存在本地。可以随时重新导入。',function(){},'未找到本地数据','知道了');
    })
};

function addCourse(course) {
    //console.log(debug.dump_obj(course));
    var content = course.Content.replace(/\\n/ig, '<br>');
    if (content.trim() === "") {
        return;
    }
    var week = course.Week;
    var time = course.Time.replace(/\\n/ig, '<br>');
    var seq = course.Seq;

    var thead = $('#course table thead tr');
    var tbody = $('#course table tbody');

    constructWeek(week);
    var tr = constructTr(seq);
    var td = constructTd(week);

    tr.children('.dt').html('<div>' + time + '</div>');
    td.html('<div>' + content + '</div>');


    function constructWeek(weekNum) {
        var current = thead.children('th.w' + weekNum);
        if (current.size() === 0) {
            if (weekNum === 1) {
                thead.append('<th class="w1"><div>星期一</div></th>');
                return thead.children('th.w1').first();
            }
            current = constructWeek(weekNum - 1);
        } else {
            return current.first();
        }
        var str;
        switch (weekNum) {
            case 1:
                str = "星期一";
                break;
            case 2:
                str = "星期二";
                break;
            case 3:
                str = "星期三";
                break;
            case 4:
                str = "星期四";
                break;
            case 5:
                str = "星期五";
                break;
            case 6:
                str = "星期六";
                break;
            case 7:
                str = "星期日";
                break;
            default:
                break;

        }
        current.after('<th class="w' + weekNum + '"><div>' + str + '</div></th>');
        tbody.children('tr').each(function() {
            if ($(this).children('td').size() < weekNum + 1) {
                $(this).append('<td class="content d' + weekNum + '"></td>');
            }
        });
        return thead.children('th.w' + weekNum).first();
    }
    function constructTr(seqNum) {
        var current = tbody.children('tr.c' + seqNum);
        if (current.size() === 0) {
            if (seqNum === 1) {
                tbody.append('<tr class="c1"><td class="dt"><div></div></td></tr>');
                var newHtml = "";
                var newTr = tbody.children('tr.c1').first()
                for (var i = 1; i < thead.children('th').size(); ++i) {
                    newHtml += '<td class="content d' + i + '"><div></div></td>';
                }
                newTr.append(newHtml);
                return newTr;
            }
            current = constructTr(seqNum - 1);
        } else {
            return current.first();
        }
        current.after('<tr class="c' + seqNum + '"><td class="dt"></tr>');
        var newTr = tbody.children('tr.c' + seqNum).first();
        var newHtml = "";
        for (var i = 1; i < thead.children('th').size(); ++i) {
            newHtml += '<td class="content d' + i + '"><div></div></td>';
        }
        newTr.append(newHtml);
        return newTr;
    }
    function constructTd(weekNum) {
        var current = tr.children('td.d' + weekNum);
        if (current.size() === 0) {
            if (weekNum === 1) {
                tr.append('<td class="content d1"></td>');
                return tr.children('td.d1').first();
            }
            current = constructTd(weekNum - 1);
        } else {
            return current.first();
        }
        current.after('<td class="content d' + weekNum + '"></td>');
        return tr.children('td.d' + weekNum).first();
    }
};

function gotoLogin() {
    $.mobile.changePage("#login-page", { transition: "none"} );
    //window.location.href='#login-page';
}

function gotoCourse() {
    $.mobile.changePage( "#main-page", { transition: "none"} );
}

function refreshCourse(jsonObj){
    $('#course').html('<table><thead><tr><th><div>时间</div></th></tr></thead><tbody></tbody></table>');
    for (index in jsonObj.Lessons) {
        addCourse(jsonObj.Lessons[index]);
    }
}

// success(JSON_Object);
function getJsonObjFromFile(url, success, fail) {
    QuickFile.fileExists(url, function(isExists){
        if (isExists) {
            QuickFile.readFile(url, true, function(jsonStr){
                success(JSON.parse(jsonStr));
            }, fileSystemFailed);
        } else {
            fail();
        }
    }, fileSystemFailed);
}

function updateJSONFile(url, jsonObj) {
    QuickFile.fileExists(url, function(isExists){
        if (isExists) {
            QuickFile.deleteFile(url, writeData, fileSystemFailed);
        } else {
            writeData();
        }
        function writeData() {
            QuickFile.writeFile(url, JSON.stringify(jsonObj), function(url){
                console.log('update data file success: ' + url);
            }, fileSystemFailed);
        }
    }, fileSystemFailed);
}

function fileSystemFailed(error) {
    navigator.notification.alert(QuickFile.errorToString(error),function(){},'文件系统错误','知道了');
}

function coursePreload(collegeID) {
    var course = $('#courselogin');
    var u = course.find('#u');
    var p = course.find('#p');
    var v = course.find('#v');

    switch (collegeID) {
        case 'CUGB':
            u.show();
            p.show();
            v.show();
            preload();
            break;
        case 'SU':
            u.show();
            p.hide();
            v.hide();
            break;
        default:
            break;
    }

    function preload() {
        var des = "";
        if (typeof Server[collegeID.toUpperCase()] === "string") {
            des = Server[collegeID.toUpperCase()];
        } else {
            des = Server['DEFAULT'];
        }
        des += 'preload.php?collegeID=' + collegeID + '&_=' + Date.now();
        var html = '<img src="' + des + '" />';
        html += '<button class="ui-btn ui-btn-inline">换一个</button>';
        navigator.notification.alert(
                                     'add verification link: ' + html,
                                     function(){debug.printLine('just alert a message.')},
                                     'trying alert',
                                     'dismiss');
        $('#verification').html(html);
        $('#verification button').click(function() {
            var collegeID = $('#courselogin select[name=collegeID]').val();
            if (collegeID === "null") {
                $('#verification').html("");
            } else {
                coursePreload(collegeID);
            }
        });
    }
}

function courseLoad(collegeID, username, password, verification) {
    var retryCount = 3;
    fetchJson();
    function fetchJson() {
        $.mobile.loading( "show", {
            text: '正在导入',
            textVisible: true,
            theme: 'b',
            textonly: false,
            html: ""
        });
        var des = "";
        if (typeof Server[collegeID.toUpperCase()] === "string") {
            des = Server[collegeID.toUpperCase()];
        } else {
            des = Server['DEFAULT'];
        }
        des += 'load.php?_=' + Date.now();
        var postData = ["collegeID=" + collegeID, "username=" + encodeURIComponent(username), "password=" + encodeURIComponent(password), "verification=" + encodeURIComponent(verification)];
        console.log('fetching url ' + des + '&' + postData.join('&'));
        $.ajax({
            url: des,
            method: 'POST',
            data: postData.join('&'),
            dataType: 'json',
            // fetch cookies for 3s, fetch html for 3s.
            timeout: 20000,
            success: proccessJson,
            error: proccessError
        });
    };

    function proccessError(xhr, status, msg) {
        console.log('connection failed: ' + msg);
        if (retryCount === 0) {
            $.mobile.loading("hide");
            navigator.notification.confirm(
                '请检查网络连接',
                function(index){
                    if (index === 2) {
                        retryCount = 3;
                        fetchJson();
                    }
                },
                '连接失败',
                ['取消', '重试']
            );
            return;
        }
        setTimeout(function(){--retryCount; fetchJson();}, 500);
    };

    function proccessJson(data) {
        console.log(debug.dump_obj(data, true));
        if (data.Lessons.length === 0) {
            navigator.notification.alert('请重试',function(){},'导入失败','知道了');
            var form = $('#courselogin');
            form.find('input[name=username]').val("");
            form.find('input[name=password]').val("");
            form.find('input[name=verification]').val("");
            coursePreload(form.find('select[name=collegeID]').val());
            $.mobile.loading("hide");
            return;
        }
        refreshCourse(data);
        if (device.platform.toUpperCase() !== "BROWSER") {
            updateJSONFile(pathData, data);
        }
        $.mobile.loading("hide");
        $('.usercontrol-back').show();
        gotoCourse();
    };
}
