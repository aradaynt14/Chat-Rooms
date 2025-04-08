document.getElementById("defaultOpen").click();

function changeAboutTab(tab){
    let tabContent = document.getElementsByClassName("tab-content");
    //hiding all tabs
    for(let i=0;i<tabContent.length;i++){
        tabContent[i].style.display = "none";
    }

    document.getElementById(tab).style.display = "block";
}
