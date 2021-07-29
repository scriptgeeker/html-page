var eleTable = document.querySelector("#table-poetry");

for (var i = 0; i < 10; i++) {
    var row = document.createElement("tr");
    row.innerHTML = "<td><a target='_blank'></a></td><td></td><td></td><td></td><td></td>";
    eleTable.appendChild(row);
}

function fill_table(items) {
    var eleTrs = eleTable.querySelectorAll("tbody>tr");
    for (var i = 0; i < 10; i++) {
        var eleTds = eleTrs[i].querySelectorAll("tr>td");
        var eleA = eleTds[0].querySelector("td>a");
        if (i < items.length) {
            eleA.setAttribute("href", items[i]["url"]);
            eleA.innerText = "《" + items[i]["title"] + "》";
            eleTds[1].innerText = items[i]["dynasty"];
            eleTds[2].innerText = items[i]["author"];
            if (items[i]["content"].length > 150)
                items[i]["content"] = items[i]["content"].substr(0, 145) + "……";
            eleTds[3].setAttribute("title", items[i]["content"]);
            eleTds[3].innerText = items[i]["sentence"];
            eleTds[4].innerText = items[i]["tag"].join("，");
        } else {
            eleA.removeAttribute("href");
            eleA.innerText = '';
            eleTds[1].innerText = '';
            eleTds[2].innerText = '';
            eleTds[3].removeAttribute("title");
            eleTds[3].innerText = '';
            eleTds[4].innerText = '';
        }
    }

}

var inputPage = document.querySelector("#input-page");
var inputSearch = document.querySelector("#input-search");
var selectType = document.querySelector("#select-type");

function load_poetry(poetryData) {
    var currentData = poetryData;
    var pageIndex = parseInt(inputPage.value);

    function update_page() {
        fill_table(currentData.slice((pageIndex - 1) * 10, pageIndex * 10));
    }

    function change_page_index(new_index, old_index) {
        if (0 < new_index && new_index < (currentData.length / 10) + 1) {
            inputPage.value = new_index;
        } else {
            inputPage.value = old_index;
        }
        pageIndex = parseInt(inputPage.value);
    }

    inputPage.addEventListener("input", function (evt) {
        var index = parseInt(this.value);
        change_page_index(index, pageIndex);
        update_page();

    });

    document.querySelector(".pagination").addEventListener("click", function (evt) {
        var ele_id = evt.target.getAttribute("id");
        if (ele_id === 'btn-page-pre') {
            change_page_index(pageIndex - 1, pageIndex);
        } else if (ele_id === 'btn-page-next') {
            change_page_index(pageIndex + 1, pageIndex);
        } else {
            return false;
        }
        update_page();
    });

    document.querySelector("#btn-search").addEventListener("click", function (evt) {
        var searchData = [];
        var text = inputSearch.value;
        var type = selectType.value;
        if (text !== "") {
            for (var i = 0; i < poetryData.length; i++) {
                if (poetryData[i][type].indexOf(text) !== -1) {
                    searchData.push(poetryData[i]);
                }
            }
            currentData = searchData;
        } else {
            currentData = poetryData;
        }
        pageIndex = 1;
        inputPage.value = 1;
        update_page();
    });

    document.querySelector("form").onsubmit = function () {
        document.getElementById("btn-search").click();
        return false;
    };

    update_page();
}