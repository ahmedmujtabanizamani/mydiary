(() => {
  // <stdin>
  console.log("This site was generated by Hugo.");
  var realHeight = document.querySelector("#TableOfContents").offsetHeight;
  document.querySelector("#TableOfContents").style.display = "none";
  document.querySelector("#TableOfContents").style.height = "0px";
  document.querySelector(".table-of-content-heading").onclick = () => {
    let ele = document.querySelector("#TableOfContents");
    if (ele.style.display == "block") {
      ele.style.height = "0px";
      setTimeout(
        () => {
          ele.style.display = "none";
        },
        300
      );
    } else {
      ele.style.display = "block";
      setTimeout(
        () => {
          ele.style.height = realHeight + "px";
        },
        50
      );
    }
  };
})();
