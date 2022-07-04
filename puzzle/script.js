const ELE = {
    image: document.querySelector(".puzzle img"),
    frame: document.querySelector(".puzzle .frame"),
    style: document.querySelector("style.variable"),
    select: document.querySelector(".panel .select"),
    timer: document.querySelector(".panel .timer"),
    button: document.querySelector(".upload .button"),
    input: document.querySelector(".upload input"),
}

const APPS = {
    width: 0, // 拼图宽度（像素）
    height: 0, // 拼图高度（像素）
    image: "", // 背景图片地址
    level: 0, // 拼图层数（阶）
    msecs: 0, // 游戏时间（毫秒）
    handle: null, // 计时器句柄
    /**
     * 初始化参数
     */
    init: function () {
        this.width = parseInt(ELE.frame.style.width);
        this.height = this.width * (ELE.image.naturalHeight / ELE.image.naturalWidth);
        ELE.frame.style.height = this.height + "px"; // 设置拼图高度
        this.image = ELE.image.getAttribute("src");
        this.level = parseInt(ELE.select.querySelector(".active").getAttribute("data-level"));
        clearInterval(this.handle); // 停止计时器
        this.handle = null;
        this.msecs = 0;
    },
    /**
     * 重新加载应用
     */
    reloadApps: function () {
        this.init();
        ELE.frame.innerHTML = "";
        ELE.frame.className = "frame";
        ELE.timer.textContent = "0.00";
        for (let i = 0; i < (this.level * this.level); i++) {
            // let ele = document.createElement("div")
            // ele.className = "position-" + i;
            // ELE.frame.appendChild(ele);
            ELE.frame.appendChild(document.createElement("div"));
        }
        this.setBlockStyle();
        this.shuffleBlock();
    },
    /**
     * 设置拼图样式
     */
    setBlockStyle: function () {
        let style = "";
        let blockWidth = this.width / this.level;
        let blockHeight = this.height / this.level;
        style += (
            ".frame > div {\n"
            + "width: " + blockWidth + "px;\n"
            + "height: " + blockHeight + "px;\n"
            + "background-image: url(\"" + this.image + "\");\n"
            + "background-size: " + (this.level * 100) + "%;\n"
            + "}\n\n"
        );
        for (let i = 0; i < (this.level * this.level); i++) {
            style += (
                ".frame > div.position-" + i + "{\n"
                + "left: " + (Math.floor(i % this.level) * blockWidth) + "px;\n"
                + "top: " + (Math.floor(i / this.level) * blockHeight) + "px;\n"
                + "}\n\n"
            );
            style += (
                ".frame > div:nth-child(" + (i + 1) + "){\n"
                + "background-position-x: -" + (Math.floor(i % this.level) * blockWidth) + "px;\n"
                + "background-position-y: -" + (Math.floor(i / this.level) * blockHeight) + "px;\n"
                + "}\n\n"
            );
        }
        ELE.style.innerHTML = style;
    },
    /**
     * 随机打乱拼图
     */
    shuffleBlock: function () {
        let array = new Array(this.level * this.level);
        for (let i = 0; i < array.length; i++) {
            array[i] = i;
        }
        this.shuffleArray(array);
        let elements = ELE.frame.querySelectorAll("div");
        for (let i = 0; i < elements.length; i++) {
            elements[i].className = "position-" + array[i];
        }
    },
    /**
     * 轮换算法打乱数组
     */
    shuffleArray: function (array) {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < Math.pow(2, this.level); j++) {
                let a = 0, b = 0;
                while (a === b) {
                    a = Math.floor(Math.random() * (array.length - 1));
                    b = Math.floor(Math.random() * (array.length - 1));
                }
                [array[a], array[b]] = [array[b], array[a]]; // 交换值
            }
        }
        let sorted = array.slice().sort();
        if (sorted.join("") === array.join("")) {
            this.shuffleArray(array); // 确保是乱序
        }
    },
    /**
     * 启动游戏计时器
     */
    startTimer: function () {
        this.handle = setInterval(() => {
            this.msecs += 10;
            let mm = ("00" + Math.floor((this.msecs / 1000) / 60)).slice(-2);
            let ss = ("00" + Math.floor((this.msecs / 1000) % 60)).slice(-2);
            let ms = ("00" + Math.floor((this.msecs % 1000) / 10)).slice(-2);
            if (this.msecs < 60 * 1000) {
                ELE.timer.textContent = parseInt(ss) + "." + ms;
            } else {
                ELE.timer.textContent = parseInt(mm) + ":" + ss + "." + ms;
            }
        }, 10);
    },
    /**
     * 通过交换的方式移动方块
     */
    moveBlock: function (offset) {
        let blank = ELE.frame.querySelector("div:last-child");
        let index = parseInt(blank.className.slice(9));
        if (0 <= (index + offset) < (this.level * this.level)) {
            if (offset === 1 || offset === -1) {
                let curLine = Math.floor(index / this.level);
                let newLine = Math.floor((index + offset) / this.level);
                if (newLine !== curLine) {
                    return; // 限制左右移动只能在同一行
                }
            }
            let block = ELE.frame.querySelector("div.position-" + (index + offset));
            [blank.className, block.className] = [block.className, blank.className];
        }
    },
    /**
     * 检查拼图是否已完成
     */
    isCompleted: function () {
        let elements = ELE.frame.querySelectorAll("div");
        for (let i = 0; i < elements.length; i++) {
            if (parseInt(elements[i].className.slice(9)) !== i) {
                return false;
            }
        }
        return true;
    },
    /**
     * 触发模拟按键事件
     */
    pressDown: function (code) {
        let init = {code: code, location: 0, repeat: false, isComposing: false};
        let event = new KeyboardEvent("keydown", init);
        document.dispatchEvent(event);
    },
};

/**
 * 更换图片重新加载应用
 */
ELE.image.setAttribute("src", ELE.image.getAttribute("src"));
ELE.image.addEventListener("load", function () {
    APPS.reloadApps();
});

/**
 * 方向键控制方块移动
 */
document.addEventListener("keydown", function (event) {
    if (APPS.isCompleted()) {
        return;
    }
    if (APPS.handle === null) {
        APPS.startTimer();
    }
    if (event.code === "ArrowUp") {
        APPS.moveBlock(+APPS.level);
    } else if (event.code === "ArrowDown") {
        APPS.moveBlock(-APPS.level);
    } else if (event.code === "ArrowLeft") {
        APPS.moveBlock(+1);
    } else if (event.code === "ArrowRight") {
        APPS.moveBlock(-1);
    }
    if (APPS.isCompleted()) {
        ELE.frame.className = "frame completed";
        clearInterval(APPS.handle);
    }
});

/**
 * 鼠标点击移动方块
 */
ELE.frame.addEventListener("click", function (event) {
    let blank = ELE.frame.querySelector("div:last-child");
    let index = parseInt(blank.className.slice(9));
    let offset = parseInt(event.target.className.slice(9)) - index;
    if (offset === +APPS.level) {
        APPS.pressDown("ArrowUp");
    } else if (offset === -APPS.level) {
        APPS.pressDown("ArrowDown");
    } else if (offset === +1) {
        APPS.pressDown("ArrowLeft");
    } else if (offset === -1) {
        APPS.pressDown("ArrowRight");
    }
});

/**
 * 切换游戏难度
 */
ELE.select.addEventListener("click", function (event) {
    let ele = event.target;
    if (ele === this) {
        return;
    }
    let elements = ELE.select.querySelectorAll("div");
    for (let i = 0; i < elements.length; i++) {
        elements[i].className = "";
    }
    ele.className = "active";
    APPS.reloadApps();
});

/**
 * 上传自定义图片
 */
ELE.button.addEventListener("click", function () {
    ELE.input.click();
});
ELE.input.addEventListener("change", function () {
    if (ELE.input.files.length > 0) {
        let file = ELE.input.files[0];
        let url = URL.createObjectURL(file);
        ELE.image.setAttribute("src", url);
    }
});


