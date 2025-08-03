var swiper = new Swiper(".mySwiper", {
  loop: true,
  effect: "fade",
  autoplay: { delay: 3000, disableOnInteraction: false },
  pagination: { el: ".swiper-pagination", clickable: true },
});

function toggleFavorite(deviceName) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favs.includes(deviceName)) {
    favs.push(deviceName);
    alert(deviceName + " تمت إضافته إلى المفضلة");
  } else {
    favs = favs.filter(item => item !== deviceName);
    alert(deviceName + " تمت إزالته من المفضلة");
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
}

function showFavorites() {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favs.length === 0) {
    alert("لا توجد أجهزة في المفضلة حاليا");
  } else {
    alert("الأجهزة المفضلة:\\n" + favs.join("\\n"));
  }
}
