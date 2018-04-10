/*主要步骤和编程思想如下：
*1. 点击开始游戏，动态生成100个div
*2. leftClick: 没有雷则显示数字(显示以当前小格为中心周围的8个格的雷数)
*   rightClick: 没有标记则进行标记   有标记则取消标记  标记是否正确，10个都正确标记则提示成功
*   出现数字的点击无效果
*   扩散算法(判断当前周围八个格有没有雷) 有雷则进行计数 显示个数在点击的那个格子上
*   若点到雷则GameOver*/

var minesNum;//雷的数目 用来初始化
var mineOver;//还剩余几个雷 用来判断结束
var block;
var mineMap = []; // 用一个数组代表当前小格是否有雷，有雷就不能重复放雷
var startBtn = document.getElementById('btn');
var box = document.getElementById('box');
var flagBox = document.getElementById('flagBox');
var alertBox = document.getElementById('alertBox');
var alertImage = document.getElementById('alertImage');
var closeBtn = document.getElementById('close');
var score = document.getElementById('score');
var startGameBool = true; // 锁，防止促发多个雷盘
var flagNum;//利用旗数记录标记数，不能让玩家用穷举的方法测试出雷的位置

bindEvent();

function bindEvent() {  //与鼠标点击有关的都放在这里
    startBtn.onclick = function () { // 点击开始游戏 显示雷盘和雷数
        if(startGameBool == true){
            box.style.display = 'block';
            flagBox.style.display = 'block';
            init(); // 开始动态生成100小格，并随机抽取10个格作为雷区
            startGameBool = false; // 放置促发多个雷盘
        }
    }
    box.oncontextmenu = function () {
        return false;//取消鼠标右键默认事件
    }
    box.onmousedown = function (e) { // 先在雷盘绑定事件 也就是事件委托
        var event = e.target; // 获取点的是哪个小格
        if(e.which == 1){
            leftClick(event); //鼠标左键方法 传入源事件也就是哪个小格
        }else if(e.which == 3){
            rightClick(event) //鼠标左键方法 传入源事件也就是哪个小格
        }
    }
    closeBtn.onclick = function () {    //都消失
        alertBox.style.display = 'none';
        flagBox.style.display = 'none';
        box.style.display = 'none';
        box.innerHTML = ''; //每次结束内容置空
        startGameBool = true;//关闭了才能再开
    }
}

function leftClick(dom) {
    if(dom.classList.contains('flag')){
        return; // 被标记了就不能左击
    }
    var isLei = document.getElementsByClassName('isLei');
    if(dom && dom.classList.contains('isLei')){ //左键点到雷
        console.log("Game Over!");
        for (var i = 0; i < isLei.length; i ++){
            isLei[i].classList.add('show'); // 输了则把所有的雷显示出来 添加一个类名添加样式
        }
        setTimeout(function () {
            alertBox.style.display = 'block';
            alertImage.style.backgroundImage = 'url("image/over.jpg")';//弹出结束图片
        },500);
    }else {
        var n = 0;//不是雷  显示一个数字
        var posArr = dom && dom.getAttribute('id').split('-');//取出行列位置
        var posX = posArr && +posArr[0];//隐式类型转换 字符串转数字
        var posY = posArr && +posArr[1];
        dom && dom.classList.add('num');
        for(var i = posX - 1; i <= posX + 1; i ++){ //以当前点为中心   循环周围八个 确定雷数
            for(var j = posY - 1; j <= posY + 1; j ++){
                var aroundBox = document.getElementById(i + '-' + j);
                if(aroundBox && aroundBox.classList.contains('isLei')){
                    n++; //周围如果有雷就加一
                }
            }
        }
        dom && (dom.innerHTML = n);//算完之后改变数字
        if(n == 0){  //扩散 利用递归
            for(var i = posX - 1; i <= posX + 1; i ++){
                for(var j = posY - 1; j <= posY + 1; j ++){
                    var nearBox = document.getElementById(i + '-' + j);
                    if(nearBox && nearBox.length != 0){
                        if(!nearBox.classList.contains('check')){
                            nearBox.classList.add('check');//已经判断过了用check标记
                            leftClick(nearBox);//扩散相当于自动点击了
                        }
                    }
                }
            }
        }
    }
}

function rightClick(dom) {
    if(dom.classList.contains('num')){ //有数字的格子右键没效果
        return;
    }
    if(flagNum == 0){
        return;
    }

    dom.classList.toggle('flag');// 插旗


    if(dom.classList.contains('isLei') && dom.classList.contains('flag')){//是雷并且插对了红旗
        mineOver --;//剩余雷数减一
    }
    if(dom.classList.contains('isLei') && !dom.classList.contains('flag')){//是雷但没有红旗
        mineOver ++;//剩余雷数加一
    }

    score.innerHTML = mineOver;//更新雷数

    if(mineOver == 0){  //雷数为0 成功！
        alertBox.style.display = 'block';
        alertImage.style.backgroundImage = 'url("image/success.png")';
    }
}

function init() {
    minesNum = 10;
    mineOver = 10;
    flagNum = 10;
    score.innerHTML = mineOver; // 初始
    for(var i = 0; i < 10; i ++){
        for(var j = 0; j < 10; j++){
            var con = document.createElement('div');
            con.classList.add('block');//生成100个小格后，给他们添加统一的类名，即设置同款样式属性
            con.setAttribute('id', i + "-" + j);// 根据所在行列设置唯一的id
            box.appendChild(con);//插入到雷盘
            mineMap.push({mine : 0});//用来判断当前格子是否有雷
        }
    }

    block = document.getElementsByClassName('block');//把所有的格子取出
    while(minesNum){ //要生成10个雷
        var mineIndex = Math.floor(Math.random()*100);//先随机生成雷的位置
        if(mineMap[mineIndex].mine === 0){ //等于0没有雷
            mineMap[mineIndex].mine = 1; // 改为1 代表这里已经放了雷了
            block[mineIndex].classList.add('isLei');//把对应的位置类名改变为有雷
            minesNum --;//总雷数减一
        }
    }

}
