var $grid = $(".gallery-wrapper").masonry({
  itemSelector: ".grid-item",
  columnWidth: ".grid-sizer",
  percentPosition: true,
  transitionDuration: 0
});

$grid.imagesLoaded().progress(function() {
  $grid.masonry();
});

setTimeout(function() {
  $("#message").fadeOut("slow");
}, 3000);
